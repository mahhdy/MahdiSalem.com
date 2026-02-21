// scripts/lib/mermaid-processor.mjs
// Pipeline-time Mermaid processor — mirrors the runtime remark-mermaid.mjs fixes.
// See: developments/MERMAID_CHART_FIX_TRACKER.md

function toEnglishDigits(str) {
    return str.replace(/[۰-۹]/g, function(d) {
        return String(d.codePointAt(0) - '۰'.codePointAt(0));
    });
}

// CLASS D: Convert Farsi duration strings to Mermaid-compatible day counts.
function convertFarsiDurations(text) {
    return text.replace(/([۰-۹0-9]+)\s*(ماه|هفته|روز|سال)/g, function(match, num, unit) {
        var n = parseInt(toEnglishDigits(num), 10);
        if (unit === 'سال')  return (n * 365) + 'd';
        if (unit === 'ماه')  return (n * 30) + 'd';
        if (unit === 'هفته') return (n * 7) + 'd';
        if (unit === 'روز')  return n + 'd';
        return match;
    });
}

function detectDiagramType(code) {
    var firstLine = code.trim().split('\n').find(function(l) { return l.trim(); }) || '';
    var fl = firstLine.trim().toLowerCase();
    if (fl.startsWith('gantt'))     return 'gantt';
    if (fl.startsWith('flowchart')) return 'flowchart';
    if (fl.startsWith('graph'))     return 'graph';
    if (fl.startsWith('pie'))       return 'pie';
    if (fl.startsWith('timeline'))  return 'timeline';
    if (fl.startsWith('mindmap'))   return 'mindmap';
    return 'other';
}

// CLASS B: malformed AI node syntax -->"B["label""] -> --> B["label"]
function fixMalformedNodeSyntax(code) {
    code = code.replace(/(-->|-\.->|===>?|~~~)\s*"([A-Za-z][A-Za-z0-9]*)\["([^"]+)""\]/g,
        function(_, arrow, nodeId, label) {
            return arrow + ' ' + nodeId + '["' + label + '"]';
        }
    );
    code = code.replace(/(-->|===>?)\s*"([A-Za-z]\d*)\["/g,
        function(_, arrow, nodeId) {
            return arrow + ' ' + nodeId + '["';
        }
    );
    code = code.replace(/""\]/g, '"]');
    return code;
}

// CLASS E: timeline typo
function fixTimelineTypo(code) {
    return code.replace(/titleChronologie\s/g, 'title Chronologie ');
}

// CLASS F: pie title nested quotes
function fixPieTitleQuotes(code) {
    return code.replace(/^(pie\s+title\s+)"(.+?)\("(.+?)"\)"?\s*$/gm,
        function(match, prefix, main, sub) {
            return prefix + '"' + main + ' - ' + sub + '"';
        }
    );
}

// CLASS G: unquoted Farsi subgraph labels
function fixSubgraphLabels(code) {
    return code.replace(/^(\s*subgraph\s+)([^"\n]+[\u0600-\u06FF][^"\n]*)$/gm,
        function(match, prefix, label) {
            var t = label.trim();
            return t.charAt(0) === '"' ? match : prefix + '"' + t + '"';
        }
    );
}

// CLASS H: trailing < in edge labels
function fixEdgeLabelTrailingChar(code) {
    return code.replace(/\|(".*?)"<\|/g, '|$1"|');
}

// CLASS D (gantt axes)
function fixGanttAxes(code) {
    code = code.replace(/^(\s*axisFormat\s+)ماه\s*$/gm, '$1%Y-%m');
    code = code.replace(/\b(\d{4}-\d{2})(?!-\d{2})\b/g, '$1-01');
    code = code.replace(/[۰-۹]/g, function(d) { return toEnglishDigits(d); });
    return code;
}

// Auto-quote Farsi in node labels — line-by-line to avoid complex regex char classes
function autoQuoteFarsiNodes(code) {
    var lines = code.split('\n');
    var result = lines.map(function(line) {
        // Square bracket nodes: ID[text]
        line = line.replace(/([A-Za-z]\d*)(\[)([^\]"]+)(])/g, function(m, id, open, text, close) {
            var t = text.trim();
            if (!t || t.charAt(0) === '"') return m;
            if (/[\u0600-\u06FF]/.test(t)) return id + open + '"' + t + '"' + close;
            return m;
        });
        // Round bracket nodes: ID(text)
        line = line.replace(/([A-Za-z]\d*)(\()([^)"]+)(\))/g, function(m, id, open, text, close) {
            var t = text.trim();
            if (!t || t.charAt(0) === '"') return m;
            if (/[\u0600-\u06FF]/.test(t)) return id + open + '"' + t + '"' + close;
            return m;
        });
        return line;
    });
    code = result.join('\n');
    // Edge labels |text|
    code = code.replace(/\|([^|"]+)\|/g, function(m, text) {
        var t = text.trim();
        if (!t || t.charAt(0) === '"' || !/[\u0600-\u06FF]/.test(t)) return m;
        return '|"' + t + '"|';
    });
    return code;
}

export class MermaidProcessor {
    constructor(options = {}) {
        this.stats = { processed: 0, cached: 0, failed: 0 };
    }

    /**
     * Process all mermaid code blocks in a markdown string.
     * Applies all permanent fixes from the tracker.
     */
    async process(content, options = {}) {
        if (!content) return content;

        return content.replace(/```mermaid([^\n]*)\n([\s\S]*?)```/g, function(match, meta, rawCode) {
            var code = rawCode.trim();
            var diagramType = detectDiagramType(code);

            // All universal fixes
            code = fixMalformedNodeSyntax(code);
            code = fixEdgeLabelTrailingChar(code);
            code = fixSubgraphLabels(code);

            // Type-specific
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

            // Auto-quote (not for gantt/timeline)
            if (diagramType !== 'gantt' && diagramType !== 'timeline') {
                code = autoQuoteFarsiNodes(code);
            }

            return '```mermaid' + meta + '\n' + code + '\n```';
        });
    }

    getStats() {
        return Object.assign({}, this.stats);
    }
}

export default MermaidProcessor;