// Service worker: handles toolbar icon clicks and relays toggle messages
// to the content script running in the active tab.

chrome.action.onClicked.addListener(async (tab) => {
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: "toggle" });
    updateBadge(tab.id, response?.rendered);
  } catch {
    // Content script not loaded on this page (e.g. non-markdown page).
    // Nothing to do — the click is simply a no-op.
  }
});

function updateBadge(tabId, isRendered) {
  if (isRendered === undefined) return;

  chrome.action.setBadgeText({
    tabId,
    text: isRendered ? "" : "RAW"
  });
  chrome.action.setBadgeBackgroundColor({
    tabId,
    color: "#666666"
  });
}
