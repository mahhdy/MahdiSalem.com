import { visit } from "unist-util-visit";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function remarkMermaid() {
  return function transformer(tree) {
    visit(tree, "code", function (node) {
      const lang = String(node.lang || "").toLowerCase();

      if (lang !== "mermaid") return;

      // Normalize line endings; don't touch syntax.
      const code = String(node.value || "").replace(/\r\n?/g, "\n");

      node.type = "html";
      node.value = `<div class="mermaid-wrapper">
<div class="mermaid-toolbar" aria-hidden="true">
  <button type="button" class="mermaid-tool-btn mermaid-zoom-in" title="Zoom in">＋</button>
  <button type="button" class="mermaid-tool-btn mermaid-zoom-out" title="Zoom out">－</button>
  <button type="button" class="mermaid-tool-btn mermaid-reset" title="Reset view">Reset</button>
  <div class="mermaid-divider"></div>
  <button type="button" class="mermaid-tool-btn pan-btn" title="Toggle Pan Mode">✋</button>
  <button type="button" class="mermaid-tool-btn zoom-btn" title="Full Screen">⛶</button>
</div>
<pre class="mermaid">${escapeHtml(code)}</pre>
</div>`;
    });
  };
}

export default remarkMermaid;