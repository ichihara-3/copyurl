"use strict";

chrome.runtime.onMessage.addListener(
  async (message, sender, sendResponse) => {
    console.debug("recieve from background.");

    if (!("task" in message)) {
      throw ("task is not in message.");
    }
    switch (message.task) {
      case "copyUrl":
        await copyUrl();
        break;
      case "copyUrlWithTitleAsText":
        await copyUrlWithTitleAsText();
        break;
      case "copyUrlWithTitleAsMarkdown":
        await copyUrlWithTitleAsMarkdown();
        break;
      default:
        console.debug("not implemented");
    }

    sendResponse({ "message": "thankyou" });
  }
);

async function copyUrl() {
  const content = location.href
  await copyToClipBoard(content);
}

async function copyUrlWithTitleAsText() {
  const content = `${document.title} | ${location.href}`;
  await copyToClipBoard(content);
}

async function copyUrlWithTitleAsMarkdown() {
  const content = `[document.title](${location.href})`;
  await copyToClipBoard(content);
}

async function copyToClipBoard(content) {
  try {
    await navigator.clipboard.writeText(content);
  } catch (e) {
    console.info("copying failed.");
    throw (e);
  }
}
