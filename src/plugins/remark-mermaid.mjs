// src/plugins/remark-mermaid.mjs

import { visit } from 'unist-util-visit';

export function remarkMermaid() {
    return (tree) => {
        visit(tree, 'code', (node, index, parent) => {
            if (node.lang === 'mermaid') {
                // تبدیل بلوک کد به HTML
                const html = {
                    type: 'html',
                    value: `<div class="mermaid-wrapper">
<pre class="mermaid">
${node.value}
</pre>
</div>`
                };

                parent.children[index] = html;
            }
        });
    };
}

export default remarkMermaid;