// src/plugins/remark-mermaid.mjs
// Comprehensive Mermaid processor with permanent fixes for all known issue classes.
// See: developments/MERMAID_CHART_FIX_TRACKER.md

import { visit } from 'unist-util-visit';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function toEnglishDigits(str) {
    return str.replace(/[۰-۹]/g, function (d) {
        return String(d.codePointAt(0) - '۰'.codePointAt(0));
    });
}

// CLASS D: Convert Farsi duration strings to Mermaid-compatible day counts.
function convertFarsiDurations(text) {
    return text.replace(/([۰-۹0-9]+)\s*(ماه|هفته|روز|سال)/g, function (match, num, unit) {
        const n = parseInt(toEnglishDigits(num), 10);
        if (unit === 'سال') return n * 365 + 'd';
        if (unit === 'ماه') return n * 30 + 'd';
        if (unit === 'هفته') return n * 7 + 'd';
        if (unit === 'روز') return n + 'd';
        return match;
    });
}

function detectDiagramType(code) {
    var firstLine = code.trim().split('\n').find(function (l) { return l.trim(); }) || '';
    var fl = firstLine.trim().toLowerCase();
    if (fl.startsWith('gantt')) return 'gantt';
    if (fl.startsWith('flowchart')) return 'flowchart';
    if (fl.startsWith('graph')) return 'graph';
    if (fl.startsWith('sequence')) return 'sequence';
    if (fl.startsWith('pie')) return 'pie';
    if (fl.startsWith('timeline')) return 'timeline';
    if (fl.startsWith('mindmap')) return 'mindmap';
    if (fl.startsWith('classdiagram') || fl.startsWith('classDiagram')) return 'class';
    return 'unknown';
}

// ─────────────────────────────────────────────────────────────
// Per-class fixers
// ─────────────────────────────────────────────────────────────

// CLASS B: Repair malformed AI-generated node syntax: -->"B["label""]  ->  --> B["label"]
function fixMalformedNodeSyntax(code) {
    // Pattern: arrow + quote + NodeId + ["label""]
    code = code.replace(/(-->|-\.->|===>?|~~~)\s*"([A-Za-z][A-Za-z0-9]*)\["([^"]+)""\]/g,
        function (_, arrow, nodeId, label) {
            return arrow + ' ' + nodeId + '["' + label + '"]';
        }
    );
    // Simpler form: -->"B[" -> --> B["
    code = code.replace(/(-->|===>?)\s*"([A-Za-z]\d*)\["/g,
        function (_, arrow, nodeId) {
            return arrow + ' ' + nodeId + '["';
        }
    );
    // Clean up remaining double-closing quotes: ""] -> "]
    code = code.replace(/""\]/g, '"]');
    return code;
}

// CLASS E: Fix 'titleChronologie' typo in timeline blocks.
function fixTimelineTypo(code) {
    return code.replace(/titleChronologie\s/g, 'title Chronologie ');
}

// CLASS F: Fix nested/unmatched quotes in pie title.
function fixPieTitleQuotes(code) {
    return code.replace(/^(pie\s+title\s+)"(.+?)\("(.+?)"\)"?\s*$/gm, function (match, prefix, main, sub) {
        return prefix + '"' + main + ' - ' + sub + '"';
    });
}

// CLASS G: Auto-quote unquoted Farsi subgraph labels.
function fixSubgraphLabels(code) {
    return code.replace(/^(\s*subgraph\s+)([^"\n]+[\u0600-\u06FF][^"\n]*)$/gm, function (match, prefix, label) {
        var trimmed = label.trim();
        if (trimmed.charAt(0) === '"') return match;
        return prefix + '"' + trimmed + '"';
    });
}

// CLASS H: Remove trailing '<' from edge labels |"text"<| -> |"text"|
function fixEdgeLabelTrailingChar(code) {
    return code.replace(/\|(".*?)"<\|/g, '|$1"|');
}

// CLASS C: Protect <br/> tags from downstream encoding.
var BR_PLACEHOLDER = '__MERMAID_BR__';
function protectBrTags(code) {
    return code.replace(/<br\s*\/?>/gi, BR_PLACEHOLDER);
}
function restoreBrTags(code) {
    return code.replace(/__MERMAID_BR__/g, '<br/>');
}

// Auto-quote Farsi in flowchart/graph node labels.
// Uses simple two-step approach to avoid complex nested char classes.
function autoQuoteFarsiNodes(code) {
    // Step 1: quote Farsi text in square brackets: ID["text"] or ID[text]
    // Only touch nodes that contain Farsi and aren't already quoted
    // Process line by line to be safe
    var lines = code.split('\n');
    var result = lines.map(function (line) {
        // Match node definition: letters+digits + open bracket + content + close bracket
        // But only if content has Farsi and is not already quoted
        return line.replace(/([A-Za-z]\d*)(\[)([^\]"]+)(])/g, function (m, id, open, text, close) {
            var t = text.trim();
            if (!t || t.charAt(0) === '"') return m;
            if (/[\u0600-\u06FF]/.test(t)) return id + open + '"' + t + '"' + close;
            return m;
        }).replace(/([A-Za-z]\d*)(\()([^)"]+)(\))/g, function (m, id, open, text, close) {
            // Skip double-paren (( which is already handled or mindmap
            var t = text.trim();
            if (!t || t.charAt(0) === '"') return m;
            if (/[\u0600-\u06FF]/.test(t)) return id + open + '"' + t + '"' + close;
            return m;
        });
    });
    code = result.join('\n');

    // Step 2: quote Farsi edge labels |text|
    code = code.replace(/\|([^|"]+)\|/g, function (m, text) {
        var t = text.trim();
        if (!t || t.charAt(0) === '"' || !/[\u0600-\u06FF]/.test(t)) return m;
        return '|"' + t + '"|';
    });

    return code;
}

// Fix gantt axes
function fixGanttAxes(code) {
    code = code.replace(/^(\s*axisFormat\s+)ماه\s*$/gm, '$1%Y-%m');
    // Add day to dates missing it: 2025-01 -> 2025-01-01
    code = code.replace(/\b(\d{4}-\d{2})(?!-\d{2})\b/g, '$1-01');
    // Convert Farsi digits
    code = code.replace(/[۰-۹]/g, function (d) { return toEnglishDigits(d); });
    return code;
}

// ─────────────────────────────────────────────────────────────
// Main plugin
// ─────────────────────────────────────────────────────────────

export function remarkMermaid() {
    return function (tree) {
        visit(tree, 'code', function (node, index, parent) {
            if (node.lang !== 'mermaid') return;

            var code = node.value;
            var meta = node.meta || '';
            var diagramType = detectDiagramType(code);

            // STEP 1: Protect <br/> from downstream encoding
            code = protectBrTags(code);

            // STEP 2: Universal structural fixes
            code = fixMalformedNodeSyntax(code);   // CLASS B
            code = fixEdgeLabelTrailingChar(code);  // CLASS H
            code = fixSubgraphLabels(code);         // CLASS G

            // STEP 3: Type-specific fixes
            if (diagramType === 'gantt') {
                code = fixGanttAxes(code);
                code = convertFarsiDurations(code);
            }
            if (diagramType === 'timeline') {
                code = fixTimelineTypo(code);
            }
            if (diagramType === 'pie') {
                code = fixPieTitleQuotes(code);
            }

            // STEP 4: Auto-quote Farsi (not for gantt/timeline — they use different syntax)
            if (diagramType !== 'gantt' && diagramType !== 'timeline') {
                code = autoQuoteFarsiNodes(code);
            }

            // STEP 5: Restore <br/>
            code = restoreBrTags(code);

            // STEP 6: Trim
            code = code.trim();

            // STEP 7: Build wrapper HTML
            var wrapperStyles = ['overflow: auto'];

            var widthMatch = meta.match(/width=["']?([^"'\s]+)["']?/);
            var heightMatch = meta.match(/height=["']?([^"'\s]+)["']?/);

            if (widthMatch) {
                var w = widthMatch[1];
                if (!w.endsWith('%') && !w.endsWith('px')) w = w + 'px';
                wrapperStyles.push('width: ' + w);
            }
            if (heightMatch) {
                var h = heightMatch[1];
                if (!h.endsWith('%') && !h.endsWith('px')) h = h + 'px';
                wrapperStyles.push('max-height: ' + h);
            }

            var alignMatch = meta.match(/align=["']?([^"'\s]+)["']?/);
            var align = alignMatch ? alignMatch[1] : 'center';
            if (align === 'left') {
                wrapperStyles.push('margin-left: 0', 'margin-right: auto');
            } else if (align === 'right') {
                wrapperStyles.push('margin-left: auto', 'margin-right: 0');
            } else {
                wrapperStyles.push('margin-left: auto', 'margin-right: auto');
            }

            var styleAttr = ' style="' + wrapperStyles.join('; ') + '"';
            var expanded = meta.includes('expanded') ? 'true' : 'false';

            // Auto-collapse large/complex types by default if not specified
            if (!meta.includes('expanded') && !meta.includes('collapsed')) {
                if (diagramType === 'gantt' || diagramType === 'timeline' || diagramType === 'mindmap') {
                    expanded = 'false';
                }
            }
            if (meta.includes('collapsed')) expanded = 'false';

            var collapseClass = expanded === 'false' ? ' is-collapsed' : '';
            var classes = 'mermaid-wrapper' + collapseClass + ' mermaid-type-' + diagramType;

            var html = {
                type: 'html',
                value: '<div class="' + classes + '" role="figure"' + styleAttr +
                    ' data-align="' + align + '" data-expanded="' + expanded +
                    '" data-diagram-type="' + diagramType + '">\n' +
                    '<div class="mermaid-toolbar">\n' +
                    '    <div class="mermaid-zoom-control">\n' +
                    '        <span class="zoom-label">\uD83D\uDD0D</span>\n' +
                    '        <input type="range" class="mermaid-zoom-slider" min="0.2" max="3" step="0.1" value="1" title="Zoom">\n' +
                    '    </div>\n' +
                    '    <button class="mermaid-tool-btn pan-btn" title="Pan Tool">\uD83E\uDD1A</button>\n' +
                    '    <button class="mermaid-tool-btn reset-btn" title="Reset View">\uD83D\uDD04</button>\n' +
                    '    <button class="mermaid-tool-btn zoom-btn" title="Full Screen">\u2194\uFE0F</button>\n' +
                    '    <button class="mermaid-tool-btn expand-btn" title="Expand/Collapse">\u2195\uFE0F</button>\n' +
                    '</div>\n' +
                    '<div class="mermaid">\n' +
                    code + '\n' +
                    '</div>\n' +
                    '</div>',
            };

            parent.children[index] = html;
        });
    };
}

export default remarkMermaid;