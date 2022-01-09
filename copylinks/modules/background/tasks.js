class Tasks {
  copyLink() {
    this.#sendMessageToContentScript({"task": "copyLink"});
  }

  copyLinkWithTitleAsText() {
    this.#sendMessageToContentScript({"task": "copyLinkWithTitleAsText"});
  }

  copyLinkWithTitleAsMarkdown() {
    this.#sendMessageToContentScript({"task": "copyLinkWithTitleAsMarkdown"});
  }

  #sendMessageToContentScript(message) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      chrome.tabs.sendMessage(tab.id, { "task": "copyLinkOfThePage" });
    });
  }
}


export { Tasks };