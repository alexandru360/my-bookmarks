// Listens for the extension-auth tab after Google OAuth
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!changeInfo.url) return;

  let url;
  try { url = new URL(changeInfo.url); } catch { return; }

  if (url.pathname === '/extension-auth') {
    const token = url.searchParams.get('token');
    if (token) {
      chrome.storage.local.set({ authToken: token });
      // Close the auth tab after a short delay so the user sees the success message
      setTimeout(() => chrome.tabs.remove(tabId), 2500);
    }
  }
});
