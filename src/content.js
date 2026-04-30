// Content script: detects Markdown pages, renders them, and handles
// toggle messages from the service worker.

(function () {
  "use strict";

  // --- Constants ---

  const MARKDOWN_EXTENSIONS = /\.(md|markdown|mdown|mkd)(\?.*)?$/i;

  // Content-Type values that indicate Markdown. Checked via a meta tag or
  // the response headers when available.
  const MARKDOWN_CONTENT_TYPES = ["text/markdown", "text/x-markdown"];

  // --- State ---

  let rawText = null;      // Original page text before rendering
  let isRendered = false;   // Current view state

  // --- Detection ---

  function isMarkdownUrl(url) {
    // Strip fragment before testing extension
    const urlWithoutHash = url.split("#")[0];
    return MARKDOWN_EXTENSIONS.test(urlWithoutHash);
  }

  function isMarkdownContentType() {
    // In file:// pages there's no Content-Type header accessible from JS.
    // For HTTP pages, the browser sets a <meta> on plain-text documents in
    // some cases, but the most reliable signal is the URL extension.
    // We also check if the page looks like a plain-text pre-formatted view,
    // which is how browsers render text/plain responses.
    const contentType = document.contentType || "";
    return MARKDOWN_CONTENT_TYPES.some((ct) => contentType.includes(ct));
  }

  function looksLikePlainText() {
    // Browsers wrap text/plain responses in a <pre> inside the body.
    // This is our best heuristic for detecting raw text pages.
    const body = document.body;
    if (!body) return false;
    const children = body.children;
    return (
      children.length === 1 &&
      children[0].tagName === "PRE" &&
      !body.querySelector("script, link[rel=stylesheet]")
    );
  }

  function shouldRender() {
    const url = window.location.href;

    // Direct extension match in URL
    if (isMarkdownUrl(url)) return true;

    // Content-Type header indicates Markdown
    if (isMarkdownContentType()) return true;

    // Known raw-hosting domains with plain text — check URL extension
    // (already covered above, but keeping explicit for clarity)

    return false;
  }

  // --- Rendering ---

  function getPageText() {
    // On text/plain pages, the text is inside a single <pre>.
    // On file:// pages for unknown types, same structure.
    const pre = document.querySelector("body > pre");
    if (pre) return pre.textContent;

    // Fallback: grab body text content
    return document.body.textContent;
  }

  function renderMarkdown(text) {
    // marked is loaded globally by the manifest's content_scripts entry.
    // GFM is enabled by default in marked, which gives us tables, task
    // lists, strikethrough, and autolinks out of the box.
    return window.marked.parse(text);
  }

  function applyRenderedView(html) {
    // Replace the entire body content with the rendered Markdown.
    // We use innerHTML here because marked.parse() returns an HTML string
    // and this is the standard way to inject parsed Markdown. The input is
    // the same text the user was already viewing in plain text — we are not
    // introducing untrusted content.
    document.body.innerHTML = "";

    const container = document.createElement("article");
    container.id = "markitdown-content";
    container.className = "markitdown-body";
    container.innerHTML = html;

    document.body.appendChild(container);
    isRendered = true;
  }

  function applyRawView(text) {
    document.body.innerHTML = "";

    const pre = document.createElement("pre");
    pre.id = "markitdown-raw";
    pre.textContent = text;
    pre.style.whiteSpace = "pre-wrap";
    pre.style.wordWrap = "break-word";
    pre.style.margin = "0";
    pre.style.padding = "16px";
    pre.style.fontFamily = "monospace";

    document.body.appendChild(pre);
    isRendered = false;
  }

  function toggle() {
    if (isRendered) {
      applyRawView(rawText);
    } else {
      applyRenderedView(renderMarkdown(rawText));
    }
    return isRendered;
  }

  // --- Message handling ---

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === "toggle") {
      if (rawText === null) {
        // Page wasn't detected as Markdown — nothing to toggle
        sendResponse({ rendered: undefined });
        return;
      }
      const nowRendered = toggle();
      sendResponse({ rendered: nowRendered });
    }
  });

  // --- Init ---

  function init() {
    if (!shouldRender()) return;
    if (!looksLikePlainText()) return;

    rawText = getPageText();
    if (!rawText || rawText.trim().length === 0) return;

    const html = renderMarkdown(rawText);
    applyRenderedView(html);
  }

  init();
})();
