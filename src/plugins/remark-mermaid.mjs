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

                // Alignment logic
                const alignMatch = meta.match(/align=["']?([^"'\s]+)["']?/);
                const align = alignMatch ? alignMatch[1] : 'center';

                if (align === 'left') wrapperStyles.push(`margin-left: 0`, `margin-right: auto`);
                else if (align === 'right') wrapperStyles.push(`margin-left: auto`, `margin-right: 0`);
                else wrapperStyles.push(`margin-left: auto`, `margin-right: auto`);

                wrapperStyles.push(`overflow: auto`);

                const styleAttr = wrapperStyles.length > 0 ? ` style="${wrapperStyles.join('; ')}"` : '';

                // Metadata for client-side JS
                const expanded = meta.includes('expanded') ? 'true' : 'false';

                const html = {
                    type: 'html',
                    value: `<div class="mermaid-wrapper" role="figure"${styleAttr} data-align="${align}" data-expanded="${expanded}">
<div class="mermaid-toolbar">
    <div class="mermaid-zoom-control">
        <span class="zoom-label">🔍</span>
        <input type="range" class="mermaid-zoom-slider" min="0.2" max="3" step="0.1" value="1" title="Zoom">
    </div>
    <button class="mermaid-tool-btn pan-btn" title="Pan Tool">🤚</button>
    <button class="mermaid-tool-btn reset-btn" title="Reset View">🔄</button>
    <button class="mermaid-tool-btn zoom-btn" title="Full Screen">↔️</button>
    <button class="mermaid-tool-btn expand-btn" title="Expand/Collapse">↕️</button>
</div>
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