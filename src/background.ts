interface ToggleResponse {
  rendered: boolean;
}

chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
  if (!tab.id) return;
  try {
    const response = await chrome.tabs.sendMessage<{ action: string }, ToggleResponse>(
      tab.id,
      { action: "toggle" }
    );
    updateBadge(tab.id, response?.rendered);
  } catch {
    // Content script not loaded on this page (e.g. non-markdown page).
  }
});

function updateBadge(tabId: number, isRendered: boolean | undefined): void {
  if (isRendered === undefined) return;

  chrome.action.setBadgeText({ tabId, text: isRendered ? "" : "RAW" });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#666666" });
}
