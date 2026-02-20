// src/plugins/remark-mermaid.mjs
// Enhanced mermaid plugin with proper diagram rendering support

import { visit } from 'unist-util-visit';

export function remarkMermaid() {
    return (tree) => {
        visit(tree, 'code', (node, index, parent) => {
            if (node.lang === 'mermaid') {
                let processedValue = node.value;

                // 1. Escape HTML to prevent MDX JSX parsing errors
                processedValue = processedValue.replaceAll('<', '&lt;').replaceAll('>', '&gt;');

                // 2. Auto-quote Farsi text inside Mermaid nodes
                // Match patterns like Node[متن فارسی] and replace with Node["متن فارسی"]
                processedValue = processedValue.replace(/([\[\(\{>])([^"\[\(\{>][^\]\)\}<]+?)([\]\)\}])/g, (match, open, text, close) => {
                    if (/[\u0600-\u06FF]/.test(text) && !text.includes('"')) {
                        return `${open}"${text}"${close}`;
                    }
                    return match;
                });

                const html = {
                    type: 'html',
                    value: `<div class="mermaid-wrapper" role="figure">
<div class="mermaid">
${processedValue}
</div>
</div>`
                };

                parent.children[index] = html;
            }
        });
    };
}

export default remarkMermaid;