"use strict";

chrome.runtime.onMessage.addListener(
  async (message, sender, sendResponse) => {
    console.debug("recieve from background.");

    if (!("task" in message)) {
      throw ("task is not in message.");
    }
    switch (message.task) {
      case "copyLink":
        await copyLink();
        break;
      case "copyLinkWithTitleAsText":
        await copyLinkWithTitleAsText();
        break;
      case "copyLinkWithTitleAsMarkdown":
        await copyLinkWithTitleAsMarkdown();
        break;
      default:
        console.debug("not implemented");
    }

    sendResponse({ "message": "thankyou" });
  }
);

async function copyLink() {
  const content = location.href
  await copyToClipBoard(content);
}

async function copyLinkWithTitleAsText() {
  const content = `${document.title} | ${location.href}`;
  await copyToClipBoard(content);
}

async function copyLinkWithTitleAsMarkdown() {
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
