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
      case "copyUrlAsHtml":
        await copyUrlAsHtml();
        break;
      case "copyUrlWithTitleAsHtml":
        await copyUrlWithTitleAsHtml();
        break;
      case "copyTitle":
        await copyTitle();
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

async function copyUrlAsHtml() {
  const a = document.createElement("a");
  a.href = location.href;
  const content = a.outerHTML;
  await copyToClipBoard(content);
}

async function copyUrlWithTitleAsHtml() {
  const a = document.createElement("a");
  a.href = location.href;
  a.innerText = document.title;
  const content = a.outerHTML;
  await copyToClipBoard(content);
}

async function copyTitle() {
  const content = document.title;
  await copyToClipBoard(content);
}

async function copyToClipBoard(content) {
  try {
    await navigator.clipboard.writeText(content);
  } catch (e) {
    console.debug("copying failed. Trying to fall back to execCommand('copy')");
    const textArea = document.createElement("textArea");
    textArea.textContent = content;
    document.body.append(textArea);
    textArea.select();
    document.execCommand('copy');
    textArea.remove();
  }
}
