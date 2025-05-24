"use strict";
// This script tends to run in the context of the user's tab
// by chrome.scripting.executeScript().

async function Copy(task, showNotification = true) {
  // Store showNotification in a variable visible to all internal functions
  const shouldShowNotification = showNotification;
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

  function showNotification(messageKey = 'notification_copied', isError = false) {
    // Don't show notification if disabled in options
    if (!shouldShowNotification) return;
    
    let message = isError ? 'Error' : 'Copied!';
    try {
      const i18nMessage = chrome.i18n.getMessage(messageKey);
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
      bottom: '20px',
      right: '20px',
      padding: '10px 20px',
      backgroundColor: isError ? 'rgba(220, 38, 38, 0.9)' : 'rgba(0, 0, 0, 0.75)',
      color: 'white',
      borderRadius: '5px',
      zIndex: '2147483647',
      fontSize: '14px',
      opacity: '0',
      transition: 'opacity 0.3s ease-in-out, bottom 0.3s ease-in-out',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
    });
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.bottom = '30px';
    }, 10);

    // Animate out and remove
    const displayDuration = isError ? 4000 : 2000; // Show errors longer
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.bottom = '20px';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, displayDuration);
  }

  function showCopySuccessNotification() {
    showNotification('notification_copied', false);
  }

  function showCopyErrorNotification(errorType = 'clipboard') {
    const messageKey = `notification_error_${errorType}`;
    showNotification(messageKey, true);
  }

  async function writeToClipboard(content) {
    try {
      await navigator.clipboard.writeText(content);
      showCopySuccessNotification();
    } catch (e) {
      console.debug("Clipboard API failed:", e.message);
      console.debug("Trying to fall back to execCommand('copy')");
      
      // Determine error type based on the error message
      let errorType = 'clipboard';
      if (e.name === 'NotAllowedError' || e.message.includes('permission')) {
        errorType = 'permission';
      }
      
      const textArea = document.createElement("textArea");
      textArea.textContent = content;
      document.body.append(textArea);
      textArea.select();
      let success = false;
      try {
        success = document.execCommand("copy");
      } catch (err) {
        console.debug("execCommand('copy') also failed:", err.message);
      }
      textArea.remove();
      
      if (success) {
        showCopySuccessNotification();
      } else {
        // Both methods failed, show error notification
        showCopyErrorNotification(errorType);
        console.error("All clipboard methods failed. Error:", e.message);
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
      console.debug("Rich clipboard API failed:", e.message);
      console.debug("Trying to fall back to execCommand('copy')");

      // Determine error type based on the error message
      let errorType = 'clipboard';
      if (e.name === 'NotAllowedError' || e.message.includes('permission')) {
        errorType = 'permission';
      }

      function listener(event) {
        event.preventDefault();
        event.clipboardData.setData("text/html", div.outerHTML);
        event.clipboardData.setData("text/plain", `${title} | ${url}`);
      }
      document.addEventListener("copy", listener, { passive: false });
      let success = false;
      try {
        success = document.execCommand("copy");
      } catch (err) {
        console.debug("execCommand('copy') also failed:", err.message);
      }
      document.removeEventListener("copy", listener);
      
      if (success) {
        showCopySuccessNotification();
      } else {
        // Both methods failed, show error notification
        showCopyErrorNotification(errorType);
        console.error("All clipboard methods failed. Error:", e.message);
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
