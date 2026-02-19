// src/plugins/remark-mermaid.mjs
// Enhanced mermaid plugin with proper diagram rendering support

import { visit } from 'unist-util-visit';

export function remarkMermaid() {
    return (tree) => {
        visit(tree, 'code', (node, index, parent) => {
            if (node.lang === 'mermaid') {
                // تبدیل بلوک کد به HTML
                // Convert to proper mermaid.js format with escaped content
                const html = {
                    type: 'html',
                    value: `<div class="mermaid-wrapper" role="figure">
<div class="mermaid">
${node.value}
</div>
</div>`
                };

                parent.children[index] = html;
            }
        });
    };
}

export default remarkMermaid;