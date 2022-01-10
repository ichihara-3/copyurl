export function copyLink() {
  sendMessageToContentScript({"task": "copyLink"});
}

export function copyLinkWithTitleAsText() {
  sendMessageToContentScript({"task": "copyLinkWithTitleAsText"});
}

export function copyLinkWithTitleAsMarkdown() {
  sendMessageToContentScript({"task": "copyLinkWithTitleAsMarkdown"});
}

function sendMessageToContentScript(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.sendMessage(tab.id, message);
  });
}