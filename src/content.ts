import { marked } from "marked";
import hljs from "./hljs-languages";

const MARKDOWN_EXTENSIONS = /\.(md|markdown|mdown|mkd)(\?.*)?$/i;
const MARKDOWN_CONTENT_TYPES = ["text/markdown", "text/x-markdown"];

let rawText: string | null = null;
let isRendered = false;

// --- Detection ---

function isMarkdownUrl(url: string): boolean {
  const urlWithoutHash = url.split("#")[0];
  return MARKDOWN_EXTENSIONS.test(urlWithoutHash);
}

function isMarkdownContentType(): boolean {
  // In file:// pages there's no Content-Type header accessible from JS.
  // For HTTP pages the most reliable signal is the URL extension.
  const contentType = document.contentType ?? "";
  return MARKDOWN_CONTENT_TYPES.some((ct) => contentType.includes(ct));
}

function looksLikePlainText(): boolean {
  // Browsers wrap text/plain responses in a <pre> inside the body.
  const body = document.body;
  if (!body) return false;
  const children = body.children;
  return (
    children.length === 1 &&
    children[0].tagName === "PRE" &&
    !body.querySelector("script, link[rel=stylesheet]")
  );
}

function shouldRender(): boolean {
  const url = window.location.href;
  if (isMarkdownUrl(url)) return true;
  if (isMarkdownContentType()) return true;
  return false;
}

// --- Rendering ---

function getPageText(): string | null {
  const pre = document.querySelector("body > pre");
  if (pre) return pre.textContent;
  return document.body.textContent;
}

function renderMarkdown(text: string): string {
  // GFM is enabled by default in marked (tables, task lists, strikethrough, autolinks).
  // marked.parse() is synchronous when no async options are set.
  return marked.parse(text) as string;
}

function highlightCodeBlocks(root: HTMLElement): void {
  root.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block as HTMLElement);
  });
}

function applyRenderedView(html: string): void {
  // We use innerHTML because marked.parse() returns an HTML string. The input
  // is the same text the user was already viewing in plain text — not untrusted content.
  document.body.innerHTML = "";

  const container = document.createElement("article");
  container.id = "markitdown-content";
  container.className = "markitdown-body";
  container.innerHTML = html;

  highlightCodeBlocks(container);
  document.body.appendChild(container);
  isRendered = true;
}

function applyRawView(text: string): void {
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

function toggle(): boolean {
  if (rawText === null) return false;
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
      sendResponse({ rendered: undefined });
      return;
    }
    sendResponse({ rendered: toggle() });
  }
});

// --- Init ---

function init(): void {
  if (!shouldRender()) return;
  if (!looksLikePlainText()) return;

  rawText = getPageText();
  if (!rawText || rawText.trim().length === 0) return;

  applyRenderedView(renderMarkdown(rawText));
}

init();
