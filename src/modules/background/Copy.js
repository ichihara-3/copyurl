"use strict";
// This script tend to run in the context of the user's tab
// by chrome.scripting.executeScript().

async function Copy(task) {
  async function copyUrl() {
    const content = location.href;
    await writeToClipboard(content);
  }

  async function copyUrlWithTitleAsText() {
    const content = `${document.title} | ${location.href}`;
    await writeToClipboard(content);
  }

  async function copyUrlWithTitleAsMarkdown() {
    const content = `[${document.title}](${location.href})`;
    await writeToClipboard(content);
  }

  async function copyUrlAsHtml() {
    const a = document.createElement("a");
    a.href = location.href;
    const content = a.outerHTML;
    await writeToClipboard(content);
  }

  async function copyUrlWithTitleAsHtml() {
    const a = document.createElement("a");
    a.href = location.href;
    a.innerText = document.title;
    const content = a.outerHTML;
    await writeToClipboard(content);
  }

  async function copyTitle() {
    const content = document.title;
    await writeToClipboard(content);
  }

  async function copyRichLink() {
    await writeRichLinkToClipboard(location.href, document.title);
  }

  async function writeToClipboard(content) {
    try {
      await navigator.clipboard.writeText(content);
    } catch (e) {
      console.debug(
        "Copying failed. Trying to fall back to execCommand('copy')"
      );
      const textArea = document.createElement("textArea");
      textArea.textContent = content;
      document.body.append(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    }
  }

  async function writeRichLinkToClipboard(url, title) {
    const div = document.createElement("div");
    const a = document.createElement("a");
    a.href = url;
    a.innerText = title;
    div.appendChild(a);
    const htmlblob = new Blob([div.outerHTML], { type: "text/html" });
    const textblob = new Blob([url], { type: "text/plain" });
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          [htmlblob.type]: htmlblob,
          [textblob.type]: textblob,
        }),
      ]);
    } catch (e) {
      console.debug(e);
      console.debug(
        "copying failed. Trying to fall back to execCommand('copy')"
      );

      function listener(event) {
        event.preventDefault();
        event.clipboardData.setData("text/html", div.outerHTML);
        event.clipboardData.setData("text/plain", url);
      }
      document.addEventListener("copy", listener, { passive: false });
      document.execCommand("copy");
      document.removeEventListener("copy", listener);
    }
  }

  switch (task) {
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
    case "copyRichLink":
      await copyRichLink();
      break;
    default:
      console.debug("not implemented");
  }
}

export { Copy };
