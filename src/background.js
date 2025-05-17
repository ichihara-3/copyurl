"use strict";

import { Copy } from "./modules/background/Copy.js";
import { menus as defaultMenus } from "./modules/background/menus.js";

// Cache for the default format and notification preference - initialized with default values
let cachedDefaultFormat = 'copyRichLink';
let cachedShowNotification = true;

// initialize
chrome.runtime.onInstalled.addListener(initializeExtension);
chrome.runtime.onStartup.addListener(initializeCache);

// for option change events
chrome.runtime.onMessage.addListener(refreshMenus);
// contextmenus click event
chrome.contextMenus.onClicked.addListener(runTaskOfClickedMenu);
// icon click event
// use the default format from storage
chrome.action.onClicked.addListener(tab => copyLink(tab, cachedDefaultFormat));

// Listen for changes to the default format and notification preference
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    if (changes.defaultFormat) {
      cachedDefaultFormat = changes.defaultFormat.newValue;
      console.log('Default format updated in cache:', cachedDefaultFormat);
    }
    if (changes.showNotification) {
      cachedShowNotification = changes.showNotification.newValue;
      console.log('Notification preference updated in cache:', cachedShowNotification);
    }
  }
});
// for debug convenience
// chrome.action.onClicked.addListener((tab) =>
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id, allFrames: true },
//     func: () =>
//       navigator.clipboard.read().then((items) => {
//         items.forEach((item) =>
//           item.types.forEach((type) =>
//             item
//               .getType(type)
//               .then((blob) => blob.text())
//               .then((text) => console.log(type, text))
//           )
//         );
//       }),
//   })
// );

function initializeExtension(details) {
  initializeMenus(details);
  initializeCache();
}

// Initialize the cache for better performance
function initializeCache() {
  // Load the default format and notification preference from storage and store in memory cache
  chrome.storage.sync.get({ 
    defaultFormat: 'copyRichLink',
    showNotification: true
  })
    .then(({ defaultFormat, showNotification }) => {
      cachedDefaultFormat = defaultFormat;
      cachedShowNotification = showNotification;
      console.log('Default format loaded into cache:', cachedDefaultFormat);
      console.log('Notification preference loaded into cache:', cachedShowNotification);
    })
    .catch(error => {
      console.error('Error loading cache settings:', error);
      // Keep the initial default values in case of error
    });
}

function initializeMenus(details) {
  chrome.storage.sync.get("contextMenus").then((items) => {
    let contextMenus = defaultMenus;
    if (items && items.contextMenus) {
      for (const menu of items.contextMenus) {
        if (menu.active !== undefined) {
          for (const contextMenu of contextMenus) {
            if (contextMenu.id === menu.id) {
              contextMenu.active = menu.active;
              break;
            }
          }
        }
      }
    }
    chrome.storage.sync
      .set({ contextMenus })
      .then(createContextMenus(contextMenus));
  });
}

function refreshMenus(message, sender, sendResponse) {
  if (!message.refresh) {
    sendResponse({ result: "refreshMenus did nothing" });
    return;
  }
  updateContextMenus();
  sendResponse({ result: "finished" });
}

function createContextMenus(contextMenus) {
  for (const menu of contextMenus) {
    chrome.contextMenus.create({
      id: menu["id"],
      title: menu["title"],
      visible: menu["active"],
    });
  }
}

function updateContextMenus() {
  chrome.storage.sync.get("contextMenus").then((items) => {
    let contextMenus = null;
    if (items && items.contextMenus) {
      contextMenus = items.contextMenus;
    } else {
      contextMenus = defaultMenus;
      console.log("update failed, fallback to default menu");
    }
    for (const menu of contextMenus) {
      chrome.contextMenus.update(menu["id"], {
        visible: menu["active"],
      });
    }
  });
}

function runTaskOfClickedMenu(info, tab) {
  const task = info.menuItemId;
  copyLink(tab, task);
}

async function copyLink(tab, task) {
  // Safety check - if the task is not found in the menus, fallback to rich format
  const isValidTask = defaultMenus.some(menu => menu.id === task);
  if (!isValidTask) {
    console.warn(`Task ${task} not found in menus. Falling back to copyRichLink.`);
    task = 'copyRichLink';
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      args: [task, cachedShowNotification], // Pass the notification preference
      func: Copy,
    });
  } catch (error) {
    console.warn(`Error executing script on tab ${tab.id}:`, error);
    const errorMessage = error.message.toLowerCase();
    // Check for common messages indicating restricted pages
    if (errorMessage.includes("cannot access") || 
        errorMessage.includes("cannot be scripted") || 
        errorMessage.includes("chrome://") ||
        errorMessage.includes("restricted url")) {
      
      console.error('Cannot copy from restricted page:', tab.url);
      // We don't display a Chrome notification anymore as we've unified notifications
      // Error handling is now done through console logging only
    } else {
      // For other errors, log them
      console.error('An unexpected error occurred during script execution:', error);
    }
  }
}

export { initializeMenus };
