"use strict";

import { menus } from "../modules/background/menus.js";

const MAX_RECENT_FORMATS = 3;

let currentTab = null;
let recentFormats = [];
let selectedFormat = null;

document.addEventListener('DOMContentLoaded', async () => {
  await initializePopup();
  await loadRecentFormats();
  await loadCurrentTabInfo();
  renderFormatButtons();
  setupEventListeners();
});

async function initializePopup() {
  try {
    // Get current active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tabs[0];
  } catch (error) {
    console.error('Error getting current tab:', error);
  }
}

async function loadRecentFormats() {
  try {
    const result = await chrome.storage.sync.get({ recentFormats: [] });
    recentFormats = result.recentFormats;
  } catch (error) {
    console.error('Error loading recent formats:', error);
    recentFormats = [];
  }
}

async function saveRecentFormats() {
  try {
    await chrome.storage.sync.set({ recentFormats });
  } catch (error) {
    console.error('Error saving recent formats:', error);
  }
}

function addToRecentFormats(formatId) {
  // Remove if already exists
  recentFormats = recentFormats.filter(id => id !== formatId);
  // Add to beginning
  recentFormats.unshift(formatId);
  // Keep only the most recent ones
  recentFormats = recentFormats.slice(0, MAX_RECENT_FORMATS);
  saveRecentFormats();
}

async function loadCurrentTabInfo() {
  const pageTitleElement = document.getElementById('pageTitle');
  const pageUrlElement = document.getElementById('pageUrl');
  
  if (currentTab) {
    pageTitleElement.textContent = currentTab.title || 'Untitled';
    pageUrlElement.textContent = currentTab.url || '';
  } else {
    pageTitleElement.textContent = 'No tab selected';
    pageUrlElement.textContent = '';
  }
}

function renderFormatButtons() {
  renderRecentFormats();
  renderAllFormats();
}

function renderRecentFormats() {
  const recentContainer = document.getElementById('recentFormats');
  const recentButtonsContainer = document.getElementById('recentFormatButtons');
  
  // Clear existing buttons
  recentButtonsContainer.innerHTML = '';
  
  if (recentFormats.length > 0) {
    recentContainer.style.display = 'block';
    
    recentFormats.forEach(formatId => {
      const menu = menus.find(m => m.id === formatId);
      if (menu) {
        const button = createFormatButton(menu, true);
        recentButtonsContainer.appendChild(button);
      }
    });
  } else {
    recentContainer.style.display = 'none';
  }
}

function renderAllFormats() {
  const allButtonsContainer = document.getElementById('allFormatButtons');
  
  // Clear existing buttons
  allButtonsContainer.innerHTML = '';
  
  menus.forEach(menu => {
    const button = createFormatButton(menu, false);
    allButtonsContainer.appendChild(button);
  });
}

function createFormatButton(menu, isRecent = false) {
  const button = document.createElement('button');
  button.className = 'format-button';
  button.dataset.formatId = menu.id;
  
  const formatName = document.createElement('div');
  formatName.className = 'format-name';
  formatName.textContent = getLocalizedMessage(menu.id) || menu.title;
  
  const formatDesc = document.createElement('div');
  formatDesc.className = 'format-desc';
  formatDesc.textContent = getLocalizedMessage(`${menu.id}_description`) || menu.description;
  
  button.appendChild(formatName);
  button.appendChild(formatDesc);
  
  if (isRecent) {
    const recentBadge = document.createElement('span');
    recentBadge.className = 'recent-badge';
    recentBadge.textContent = '★';
    button.appendChild(recentBadge);
  }
  
  button.addEventListener('click', () => {
    selectFormat(menu.id);
  });
  
  button.addEventListener('mouseenter', () => {
    showPreview(menu.id);
  });
  
  return button;
}

function getLocalizedMessage(key) {
  try {
    return chrome.i18n.getMessage(key);
  } catch (error) {
    return null;
  }
}

function selectFormat(formatId) {
  selectedFormat = formatId;
  
  // Update visual selection
  document.querySelectorAll('.format-button').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  document.querySelectorAll(`[data-format-id="${formatId}"]`).forEach(btn => {
    btn.classList.add('selected');
  });
  
  // Copy the format
  copyFormat(formatId);
}

function showPreview(formatId) {
  if (!currentTab) return;
  
  const previewSection = document.getElementById('previewSection');
  const previewContent = document.getElementById('previewContent');
  
  const title = currentTab.title || 'Untitled';
  const url = currentTab.url || '';
  
  let previewText = '';
  
  switch (formatId) {
    case 'copyRichLink':
      previewText = `Rich text link: "${title}" → ${url}`;
      break;
    case 'copyUrl':
      previewText = url;
      break;
    case 'copyUrlWithTitleAsText':
      previewText = `${title} | ${url}`;
      break;
    case 'copyUrlWithTitleAsMarkdown':
      previewText = `[${title}](${url})`;
      break;
    case 'copyUrlAsHtml':
      previewText = `<a href="${url}">${url}</a>`;
      break;
    case 'copyUrlWithTitleAsHtml':
      previewText = `<a href="${url}">${title}</a>`;
      break;
    case 'copyTitle':
      previewText = title;
      break;
    default:
      previewText = 'Preview not available';
  }
  
  previewContent.textContent = previewText;
  previewSection.style.display = 'block';
}

async function copyFormat(formatId) {
  if (!currentTab) {
    console.error('No current tab available');
    return;
  }
  
  // Add visual feedback
  const button = document.querySelector(`[data-format-id="${formatId}"]`);
  if (button) {
    button.classList.add('copying');
  }
  
  try {
    // Use the same copy mechanism as the background script
    await chrome.scripting.executeScript({
      target: { tabId: currentTab.id, allFrames: true },
      args: [formatId, true], // Always show notification for popup usage
      func: copyFunction
    });
    
    // Add to recent formats
    addToRecentFormats(formatId);
    
    // Show success feedback
    if (button) {
      button.classList.remove('copying');
      button.classList.add('copy-success');
      setTimeout(() => {
        button.classList.remove('copy-success');
      }, 1500);
    }
    
    // Update recent formats display
    setTimeout(() => {
      renderRecentFormats();
    }, 100);
    
  } catch (error) {
    console.error('Error copying format:', error);
    
    if (button) {
      button.classList.remove('copying');
    }
    
    // Show error feedback
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 1000;
      font-size: 12px;
    `;
    errorDiv.textContent = 'Failed to copy. Page may be restricted.';
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 3000);
  }
}

// Copy function to be injected (same as Copy.js but simplified)
async function copyFunction(task, showNotification = true) {
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
    if (!showNotification) return;
    let message = 'Copied!';
    try {
      const i18nMessage = chrome.i18n.getMessage('notification_copied');
      if (i18nMessage) {
        message = i18nMessage;
      }
    } catch (e) {
      // Fallback to default message
    }

    const notification = document.createElement('div');
    notification.textContent = message;
    Object.assign(notification.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '10px 20px',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      color: 'white',
      borderRadius: '5px',
      zIndex: '2147483647',
      fontSize: '14px',
      opacity: '0',
      transition: 'opacity 0.3s ease-in-out, bottom 0.3s ease-in-out'
    });
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.bottom = '30px';
    }, 10);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.bottom = '20px';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 2000);
  }

  async function writeToClipboard(content) {
    try {
      await navigator.clipboard.writeText(content);
      showCopySuccessNotification();
    } catch (e) {
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

function setupEventListeners() {
  const optionsButton = document.getElementById('optionsButton');
  optionsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });
  
  // Hide preview when mouse leaves format buttons
  document.addEventListener('mouseleave', (e) => {
    if (e.target.classList.contains('format-button')) {
      // Small delay to prevent flickering
      setTimeout(() => {
        const previewSection = document.getElementById('previewSection');
        if (!document.querySelector('.format-button:hover')) {
          previewSection.style.display = 'none';
        }
      }, 100);
    }
  });
}