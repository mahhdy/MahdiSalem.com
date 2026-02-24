// scripts/lib/mermaid-processor.mjs
// Pipeline-time Mermaid processor — v2.0
// Added: HTML source support, :::className stripping, \n→<br/>, quadrantChart

function toEnglishDigits(str) {
    return str.replace(/[۰-۹]/g, d =>
        String(d.codePointAt(0) - '۰'.codePointAt(0))
    );
}

function convertFarsiDurations(text) {
    return text.replace(
        /([۰-۹0-9]+)\s*(ماه|هفته|روز|سال)/g,
        (match, num, unit) => {
            const n = parseInt(toEnglishDigits(num), 10);
            if (unit === 'سال') return (n * 365) + 'd';
            if (unit === 'ماه') return (n * 30) + 'd';
            if (unit === 'هفته') return (n * 7) + 'd';
            if (unit === 'روز') return n + 'd';
            return match;
        }
    );
}

function detectDiagramType(code) {
    // Handle %%{init:}%% directives at top
    const withoutDirective = code.trim().replace(/^%%\{[\s\S]*?\}%%\s*/m, '');
    const firstLine = withoutDirective.trim().split('\n').find(l => l.trim()) || '';
    const fl = firstLine.trim().toLowerCase();

    if (fl.startsWith('gantt')) return 'gantt';
    if (fl.startsWith('flowchart')) return 'flowchart';
    if (fl.startsWith('graph')) return 'graph';
    if (fl.startsWith('pie')) return 'pie';
    if (fl.startsWith('timeline')) return 'timeline';
    if (fl.startsWith('mindmap')) return 'mindmap';
    if (fl.startsWith('quadrantchart')) return 'quadrantChart';
    if (fl.startsWith('sequencediagram')) return 'sequenceDiagram';
    if (fl.startsWith('classdiagram')) return 'classDiagram';
    if (fl.startsWith('statediagram')) return 'stateDiagram';
    if (fl.startsWith('erdiagram')) return 'erDiagram';
    if (fl.startsWith('sankey')) return 'sankey';
    if (fl.startsWith('xychart')) return 'xychart';
    return 'other';
}

// ─────────────────────────────────────────────
// EXISTING FIXES (kept as-is)
// ─────────────────────────────────────────────

function fixMalformedNodeSyntax(code) {
    code = code.replace(
        /(-->|-\.->|===>?|~~~)\s*"([A-Za-z][A-Za-z0-9]*)$$"([^"]+)""$$/g,
        (_, arrow, nodeId, label) => `${arrow} ${nodeId}["${label}"]`
    );
    code = code.replace(
        /(-->|===>?)\s*"([A-Za-z]\d*)$$"/g,
        (_, arrow, nodeId) => `${arrow} ${nodeId}["`
    );
    code = code.replace(/""$$/g, '"]');
    return code;
}

function fixTimelineTypo(code) {
    return code.replace(/titleChronologie\s/g, 'title Chronologie ');
}

function fixPieTitleQuotes(code) {
    return code.replace(
        /^(pie\s+title\s+)"(.+?)\("(.+?)"\)"?\s*$/gm,
        (_, prefix, main, sub) => `${prefix}"${main} - ${sub}"`
    );
}

function fixSubgraphLabels(code) {
    return code.replace(
        /^(\s*subgraph\s+)([^"\n]+[\u0600-\u06FF][^"\n]*)$/gm,
        (match, prefix, label) => {
            const t = label.trim();
            return t.charAt(0) === '"' ? match : `${prefix}"${t}"`;
        }
    );
}

function fixEdgeLabelTrailingChar(code) {
    return code.replace(/\|(".*?)"<\|/g, '|\$1"|');
}

function fixGanttAxes(code) {
    code = code.replace(/^(\s*axisFormat\s+)ماه\s*$/gm, '\$1%Y-%m');
    code = code.replace(/\b(\d{4}-\d{2})(?!-\d{2})\b/g, '\$1-01');
    code = code.replace(/[۰-۹]/g, d => toEnglishDigits(d));
    return code;
}

function autoQuoteFarsiNodes(code) {
    const lines = code.split('\n');
    const result = lines.map(line => {
        line = line.replace(
            /([A-Za-z]\d*)($$)([^$$"]+)(])/g,
            (m, id, open, text, close) => {
                const t = text.trim();
                if (!t || t.charAt(0) === '"') return m;
                if (/[\u0600-\u06FF]/.test(t)) return `${id}${open}"${t}"${close}`;
                return m;
            }
        );
        line = line.replace(
            /([A-Za-z]\d*)(\()([^)"]+)(\))/g,
            (m, id, open, text, close) => {
                const t = text.trim();
                if (!t || t.charAt(0) === '"') return m;
                if (/[\u0600-\u06FF]/.test(t)) return `${id}${open}"${t}"${close}`;
                return m;
            }
        );
        return line;
    });
    code = result.join('\n');

    code = code.replace(/\|([^|"]+)\|/g, (m, text) => {
        const t = text.trim();
        if (!t || t.charAt(0) === '"' || !/[\u0600-\u06FF]/.test(t)) return m;
        return `|"${t}"|`;
    });
    return code;
}

// ─────────────────────────────────────────────
// NEW FIXES for HTML-sourced content
// ─────────────────────────────────────────────

/**
 * Strip :::className annotations from mindmap nodes
 * These only work if custom CSS classes exist — our site doesn't have them
 */
function stripMindmapClassAnnotations(code) {
    return code.replace(/:::[\w-]+/g, '');
}

/**
 * Fix = sign in mindmap node text that breaks parser
 * "Libertas = non-domination" → "Libertas as non-domination"
 */
function fixMindmapEquals(code) {
    // Only fix = that appears in indented text lines (mindmap node content)
    // Don't touch style declarations or other = usage
    return code.replace(
        /^(\s{2,}\S.*?)\s+=\s+(.*)$/gm,
        '\$1 as \$2'
    );
}

/**
 * Fix comma in mindmap node text that can break parser
 * "Two Concepts of Liberty, 1958" → "Two Concepts of Liberty 1958"
 */
function fixMindmapCommas(code) {
    // Only fix comma followed by space and 4-digit year
    return code.replace(
        /^(\s{2,}.*),\s+(\d{4})\s*$/gm,
        '\$1 \$2'
    );
}

/**
 * Convert \n to <br/> inside flowchart/graph node definitions
 * ["text\nmore text"] → ["text<br/>more text"]
 */
function fixFlowchartNewlines(code) {
    // Inside square bracket nodes
    code = code.replace(
        /$$"([^"]*?)"$$/g,
        (match) => match.replace(/\\n/g, '<br/>')
    );

    // Inside parenthesis nodes
    code = code.replace(
        /\("([^"]*?)"\)/g,
        (match) => match.replace(/\\n/g, '<br/>')
    );

    // Unquoted square bracket nodes with \n
    code = code.replace(
        /$$([^$$"]*?\\n[^\]]*?)\]/g,
        (match) => match.replace(/\\n/g, '<br/>')
    );

    return code;
}

/**
 * Decode HTML entities that may appear in Mermaid content
 * (when converted from HTML source)
 */
function decodeMermaidHTMLEntities(code) {
    const entityMap = {
        '&hellip;': '…', '&mdash;': '—', '&ndash;': '–',
        '&laquo;': '«', '&raquo;': '»', '&bull;': '•',
        '&nbsp;': ' ', '&zwnj;': '\u200C',
        '&rarr;': '→', '&larr;': '←',
        '&eacute;': 'é', '&Eacute;': 'É',
        '&egrave;': 'è', '&ecirc;': 'ê', '&Ecirc;': 'Ê',
        '&ouml;': 'ö', '&Ouml;': 'Ö', '&uuml;': 'ü',
        '&amp;': '&', '&lt;': '<', '&gt;': '>',
    };

    let result = code;
    for (const [entity, char] of Object.entries(entityMap)) {
        if (entity === '&amp;') continue; // Do last
        result = result.replaceAll(entity, char);
    }

    // Numeric entities
    result = result.replace(/&#(\d+);/g, (_, c) => {
        try { return String.fromCodePoint(parseInt(c, 10)); } catch { return `&#${c};`; }
    });
    result = result.replace(/&#x([0-9a-f]+);/gi, (_, h) => {
        try { return String.fromCodePoint(parseInt(h, 16)); } catch { return `&#x${h};`; }
    });

    // Now decode &amp;
    result = result.replace(/&amp;(?!#?\w+;)/g, '&');

    return result;
}


// ─────────────────────────────────────────────
// MAIN CLASS
// ─────────────────────────────────────────────

export class MermaidProcessor {
    constructor(options = {}) {
        this.stats = { processed: 0, fixed: 0, failed: 0 };
        this.options = {
            decodeHTMLEntities: options.decodeHTMLEntities ?? false,
            stripClassAnnotations: options.stripClassAnnotations ?? true,
            fixNewlines: options.fixNewlines ?? true,
            ...options,
        };
    }

    /**
     * Process all mermaid code blocks in a markdown/MDX string.
     * Applies all permanent fixes.
     */
    async process(content, options = {}) {
        if (!content) return content;

        const self = this;
        const opts = { ...this.options, ...options };

        return content.replace(
            /```mermaid([^\n]*)\n([\s\S]*?)```/g,
            (match, meta, rawCode) => {
                let code = rawCode.trim();
                const diagramType = detectDiagramType(code);
                self.stats.processed++;

                try {
                    // ─── HTML Entity Decoding (for HTML-sourced content) ───
                    if (opts.decodeHTMLEntities) {
                        code = decodeMermaidHTMLEntities(code);
                    }

                    // ─── Universal fixes ───
                    code = fixMalformedNodeSyntax(code);
                    code = fixEdgeLabelTrailingChar(code);
                    code = fixSubgraphLabels(code);

                    // ─── Type-specific fixes ───
                    switch (diagramType) {
                        case 'mindmap':
                            if (opts.stripClassAnnotations) {
                                code = stripMindmapClassAnnotations(code);
                            }
                            code = fixMindmapEquals(code);
                            code = fixMindmapCommas(code);
                            break;

                        case 'flowchart':
                        case 'graph':
                            if (opts.fixNewlines) {
                                code = fixFlowchartNewlines(code);
                            }
                            break;

                        case 'gantt':
                            code = fixGanttAxes(code);
                            code = convertFarsiDurations(code);
                            break;

                        case 'timeline':
                            code = fixTimelineTypo(code);
                            break;

                        case 'pie':
                            code = fixPieTitleQuotes(code);
                            break;

                        case 'quadrantChart':
                            // Generally clean — no special fixes needed
                            break;
                    }

                    // ─── Auto-quote Farsi (not for gantt/timeline/quadrant) ───
                    if (!['gantt', 'timeline', 'quadrantChart'].includes(diagramType)) {
                        code = autoQuoteFarsiNodes(code);
                    }

                    self.stats.fixed++;
                } catch (err) {
                    self.stats.failed++;
                    console.warn(`⚠️ Mermaid fix failed for ${diagramType}:`, err.message);
                }

                return '```mermaid' + meta + '\n' + code + '\n```';
            }
        );
    }

    getStats() {
        return { ...this.stats };
    }
}

// ─── Export standalone functions for use in converter ───
export {
    detectDiagramType,
    stripMindmapClassAnnotations,
    fixMindmapEquals,
    fixMindmapCommas,
    fixFlowchartNewlines,
    decodeMermaidHTMLEntities,
    fixSubgraphLabels,
    autoQuoteFarsiNodes,
};

export default MermaidProcessor;