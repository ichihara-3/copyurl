export function copyUrl() {
  sendMessageToContentScript({"task": "copyUrl"});
}

export function copyUrlWithTitleAsText() {
  sendMessageToContentScript({"task": "copyUrlWithTitleAsText"});
}

export function copyUrlWithTitleAsMarkdown() {
  sendMessageToContentScript({"task": "copyUrlWithTitleAsMarkdown"});
}

export function copyUrlAsHtml() {
  sendMessageToContentScript({ "task": "copyUrlAsHtml" });
}

export function copyUrlWithTitleAsHtml() {
  sendMessageToContentScript({ "task": "copyUrlWithTitleAsHtml" });
}


export function copyTitle() {
  sendMessageToContentScript({ "task": "copyTitle" });
}

export function copyRichLink() {
  sendMessageToContentScript({ "task": "copyRichLink" });
}

function sendMessageToContentScript(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.sendMessage(tab.id, message);
  });
}