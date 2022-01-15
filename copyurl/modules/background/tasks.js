export function copyUrl() {
  sendMessageToContentScript({"task": "copyUrl"});
}

export function copyUrlWithTitleAsText() {
  sendMessageToContentScript({"task": "copyUrlWithTitleAsText"});
}

export function copyUrlWithTitleAsMarkdown() {
  sendMessageToContentScript({"task": "copyUrlWithTitleAsMarkdown"});
}

export function copyTitle() {
  sendMessageToContentScript({ "task": "copyTitle" });
}

function sendMessageToContentScript(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.sendMessage(tab.id, message);
  });
}