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

  function showCopySuccessNotification() {
    let message = 'Copied!';
    try {
      const i18nMessage = chrome.i18n.getMessage('notification_copied');
      if (i18nMessage) {
        message = i18nMessage;
      }
    } catch (e) {
      // Fallback to default message if i18n is not available or key is missing
    }

    const notification = document.createElement('div');
    notification.textContent = message;
    Object.assign(notification.style, {
      position: 'fixed',
      bottom: '20px', // Changed from top to bottom for less intrusion
      right: '20px',
      padding: '10px 20px',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      color: 'white',
      borderRadius: '5px',
      zIndex: '2147483647', // Max z-index
      fontSize: '14px',
      opacity: '0',
      transition: 'opacity 0.3s ease-in-out, bottom 0.3s ease-in-out'
    });
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.bottom = '30px';
    }, 10);

    // Animate out and remove
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.bottom = '20px';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300); // Corresponds to transition duration
    }, 2000); // Display duration
  }

  async function writeToClipboard(content) {
    try {
      await navigator.clipboard.writeText(content);
      showCopySuccessNotification();
    } catch (e) {
      console.debug(
        "Copying failed. Trying to fall back to execCommand('copy')"
      );
      const textArea = document.createElement("textArea");
      textArea.textContent = content;
      document.body.append(textArea);
      textArea.select();
      let success = false;
      try {
        success = document.execCommand("copy");
      } catch (err) { /* ignore */ }
      textArea.remove();
      if (success) {
        showCopySuccessNotification();
      }
    }
  }

  async function writeRichLinkToClipboard(url, title) {
    const div = document.createElement("div");
    const a = document.createElement("a");
    a.href = url;
    a.innerText = title;
    div.appendChild(a);
    const htmlblob = new Blob([div.outerHTML], { type: "text/html" });
    const textblob = new Blob([`${title} | ${url}`], { type: "text/plain" });
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          [htmlblob.type]: htmlblob,
          [textblob.type]: textblob,
        }),
      ]);
      showCopySuccessNotification();
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
      let success = false;
      try {
        success = document.execCommand("copy");
      } catch (err) { /* ignore */ }
      document.removeEventListener("copy", listener);
      if (success) {
        showCopySuccessNotification();
      }
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
