// Temporary validation file — delete when issue #8 (content.ts) is merged.
// Verifies that all imports needed for #6, #7, #8 resolve correctly under our tsconfig.

import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';

// marked: parse() returns string | Promise<string>
marked.parse('# hello') satisfies Promise<string> | string;

// hljs: registerLanguage + highlightElement
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.highlightElement(document.createElement('code'));

// chrome extension APIs used in background.ts (#6)
chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  chrome.tabs.sendMessage(tab.id, { action: 'toggle' }, (_response: { rendered: boolean }) => {});
  chrome.action.setBadgeText({ tabId: tab.id, text: '' });
  chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: '#666' });
});

// chrome extension APIs used in content.ts (#8)
chrome.runtime.onMessage.addListener((_msg, _sender, sendResponse) => {
  sendResponse({ rendered: true });
  return true;
});

export {};
