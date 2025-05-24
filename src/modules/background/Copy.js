"use strict";
// This script tends to run in the context of the user's tab
// by chrome.scripting.executeScript().

async function Copy(task, showNotification = true) {
  // Store showNotification in a variable visible to all internal functions
  const shouldShowNotification = showNotification;

  // Sanitization functions to prevent XSS and injection attacks
  function sanitizeTitle(title) {
    if (typeof title !== 'string') {
      return '';
    }
    // Remove control characters, null bytes, and trim whitespace
    return title
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .replace(/\u0000/g, '') // Remove null bytes
      .trim()
      .substring(0, 1000); // Limit length to prevent extremely long titles
  }

  function sanitizeUrl(url) {
    if (typeof url !== 'string') {
      return '';
    }
    try {
      // Parse URL to validate it and get normalized version
      const parsedUrl = new URL(url);
      // Only allow http, https, and file protocols for security
      if (!['http:', 'https:', 'file:'].includes(parsedUrl.protocol)) {
        return '';
      }
      return parsedUrl.href;
    } catch (e) {
      // If URL parsing fails, return empty string
      return '';
    }
  }

  function escapeHtml(text) {
    if (typeof text !== 'string') {
      return '';
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  async function copyUrl() {
    const content = sanitizeUrl(location.href);
    await writeToClipboard(content);
  }

  async function copyUrlWithTitleAsText() {
    const title = sanitizeTitle(document.title);
    const url = sanitizeUrl(location.href);
    const content = `${title} | ${url}`;
    await writeToClipboard(content);
  }

  async function copyUrlWithTitleAsMarkdown() {
    const title = sanitizeTitle(document.title);
    const url = sanitizeUrl(location.href);
    const content = `[${title}](${url})`;
    await writeToClipboard(content);
  }

  async function copyUrlAsHtml() {
    const url = sanitizeUrl(location.href);
    const a = document.createElement("a");
    a.href = url;
    const content = a.outerHTML;
    await writeToClipboard(content);
  }

  async function copyUrlWithTitleAsHtml() {
    const title = sanitizeTitle(document.title);
    const url = sanitizeUrl(location.href);
    const a = document.createElement("a");
    a.href = url;
    a.innerText = title;
    const content = a.outerHTML;
    await writeToClipboard(content);
  }

  async function copyTitle() {
    const content = sanitizeTitle(document.title);
    await writeToClipboard(content);
  }

  async function copyRichLink() {
    const title = sanitizeTitle(document.title);
    const url = sanitizeUrl(location.href);
    await writeRichLinkToClipboard(url, title);
  }

  function showCopySuccessNotification() {
    // Don't show notification if disabled in options
    if (!shouldShowNotification) return;
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
    // Note: url and title are already sanitized by the caller
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
