import mermaid from "mermaid";

export async function renderMermaidBlocks(container: HTMLElement): Promise<void> {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? "dark" : "default",
    securityLevel: "strict",
  });

  const blocks = Array.from(container.querySelectorAll("pre code.language-mermaid"));
  if (blocks.length === 0) return;

  for (const block of blocks) {
    const source = block.textContent ?? "";
    const pre = block.parentElement;
    if (!pre) continue;

    try {
      const id = `mermaid-${Math.random().toString(36).slice(2)}`;
      const { svg } = await mermaid.render(id, source);
      const wrapper = document.createElement("div");
      wrapper.className = "mermaid-diagram";
      wrapper.innerHTML = svg;
      pre.replaceWith(wrapper);
    } catch {
      // Leave the fenced block as-is if the diagram source is invalid.
    }
  }
}
