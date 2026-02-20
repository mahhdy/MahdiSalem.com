// src/plugins/remark-mermaid.mjs
// Enhanced mermaid plugin with proper diagram rendering support

import { visit } from 'unist-util-visit';

export function remarkMermaid() {
    return (tree) => {
        visit(tree, 'code', (node, index, parent) => {
            if (node.lang === 'mermaid') {
                let processedValue = node.value;
                const meta = node.meta || '';

                // Extract width and height from meta (e.g. ```mermaid width="400" height="300")
                const widthMatch = meta.match(/width=["']?([^"'\s]+)["']?/);
                const heightMatch = meta.match(/height=["']?([^"'\s]+)["']?/);

                const width = widthMatch ? (widthMatch[1].endsWith('%') || widthMatch[1].endsWith('px') ? widthMatch[1] : `${widthMatch[1]}px`) : null;
                const height = heightMatch ? (heightMatch[1].endsWith('%') || heightMatch[1].endsWith('px') ? heightMatch[1] : `${heightMatch[1]}px`) : null;

                // 1. Escape HTML and braces to prevent MDX JSX parsing errors
                processedValue = processedValue
                    .replaceAll('<', '&lt;')
                    .replaceAll('>', '&gt;')
                    .replaceAll('{', '&#123;')
                    .replaceAll('}', '&#125;');

                // 2. Auto-quote Farsi text inside Mermaid nodes
                processedValue = processedValue.replace(/([\[\(\{>])([^"\[\(\{>][^\]\)\}<]+?)([\]\)\}])/g, (match, open, text, close) => {
                    if (/[\u0600-\u06FF]/.test(text) && !text.includes('"')) {
                        return `${open}"${text}"${close}`;
                    }
                    return match;
                });

                const wrapperStyles = [];
                if (width) wrapperStyles.push(`width: ${width}`);
                if (height) wrapperStyles.push(`max-height: ${height}`);
                if (width || height) wrapperStyles.push(`margin-left: auto`, `margin-right: auto`, `overflow: auto`);

                const styleAttr = wrapperStyles.length > 0 ? ` style="${wrapperStyles.join('; ')}"` : '';

                const html = {
                    type: 'html',
                    value: `<div class="mermaid-wrapper" role="figure"${styleAttr}>
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