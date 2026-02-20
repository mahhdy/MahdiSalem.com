// lib/mermaid-processor.mjs

export class MermaidProcessor {
    constructor(options = {}) {
        this.stats = { processed: 0, cached: 0, failed: 0 };
    }

    async process(content, options = {}) {
        if (!content) return content;

        // Find all mermaid code blocks
        return content.replace(/```mermaid\s*\n([\s\S]*?)```/g, (match, code) => {
            this.stats.processed++;

            let processedCode = code;

            // 1. Auto-quote Farsi text inside Mermaid nodes/labels
            // This handles common Mermaid syntax like:
            // Node[متن]  -> Node["متن"]
            // Node(متن)  -> Node("متن")
            // Node{متن}  -> Node{"متن"}
            // |текст|    -> |"текст"|
            // >متن]     -> >"متن"]

            // Nodes with brackets: [ ], ( ), (( )), { }, > ]
            processedCode = processedCode.replace(/([\[\(\{>])\s*([^"\[\(\{>][^\]\)\}<]+?)\s*([\]\)\}])/g, (m, open, text, close) => {
                const trimmedText = text.trim();
                if (/[\u0600-\u06FF]/.test(trimmedText) && !trimmedText.startsWith('"')) {
                    return `${open}"${trimmedText}"${close}`;
                }
                return m;
            });

            // Labels with pipes: |text|
            processedCode = processedCode.replace(/\|\s*([^"|]+?)\s*\|/g, (m, text) => {
                const trimmedText = text.trim();
                if (/[\u0600-\u06FF]/.test(trimmedText) && !trimmedText.startsWith('"')) {
                    return `|"${trimmedText}"|`;
                }
                return m;
            });

            // Edge cases: nodes that are just text without brackets (if possible in some mermaid types)
            // But usually mermaid requires brackets for text with spaces or special chars.

            return `\n\n\`\`\`mermaid\n${processedCode}\n\`\`\`\n\n`;
        });
    }

    getStats() {
        return { ...this.stats };
    }
}

export default MermaidProcessor;