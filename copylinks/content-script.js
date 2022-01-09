"use strict";

chrome.runtime.onMessage.addListener(
  async (message, sender, sendResponse) => {
    console.log("recieve from background.");

    if (!("task" in message)) {
      throw ("task is not in message.");
    }
    switch (message.task) {
      case "copyLinkOfThePage":
        await copyLinkOfThePage();
        break;
      default:
        void (0);
    }

    sendResponse({ "message": "thankyou" });
  }
);

async function copyLinkOfThePage() {
  const content = location.href
  await copyToClipBoard(content)
}

async function copyToClipBoard(content) {
  try {
    await navigator.clipboard.writeText(content);
  } catch {
    console.log("copying failed.");
  }
}
