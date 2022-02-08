"use strict";

import { Copy } from "./modules/background/Copy.js";
import { menus as defaultMenus } from "./modules/background/menus.js"

// initialize
chrome.runtime.onInstalled.addListener(initializeMenus);
// for option change events
chrome.runtime.onMessage.addListener(refreshMenus);
// contextmenus click event
chrome.contextMenus.onClicked.addListener(runTaskOfClickedMenu);
// icon click event
// run first action of the menus
chrome.action.onClicked.addListener(tab => copyLink(tab, defaultMenus[0].id));

function initializeMenus(details) {
  chrome.storage.sync.get("contextMenus")
    .then((items) => {
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
            break;
          }
        }
      }
      chrome.storage.sync.set({ contextMenus })
        .then(createContextMenus(contextMenus));
    });
}

function refreshMenus(message, sender, sendResponse) {
  if (!message.refresh) {
    sendResponse({ result: "refreshMenus did nothing" });
    return
  }
  updateContextMenus();
  sendResponse({ result: "finshed" });
}

function createContextMenus(contextMenus) {
  for (const menu of contextMenus) {
    chrome.contextMenus.create(
      {
        id: menu["id"],
        title: menu["title"],
        visible: menu["active"],
      }
    );
  }
}

function updateContextMenus() {
  chrome.storage.sync.get("contextMenus")
    .then((items) => {
      let contextMenus = null;
      if (items && items.contextMenus) {
        contextMenus = items.contextMenus;
      } else {
        contextMenus = defaultMenus;
        console.log("update failed, fallback to default menu")
      }
      for (const menu of contextMenus) {
        chrome.contextMenus.update(
          menu["id"],
          {
            visible: menu["active"],
          }
        );
      }
    });
}

function runTaskOfClickedMenu(info, tab) {
  const task = info.menuItemId;
  copyLink(tab, task);
}

function copyLink(tab, task) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id, allFrames: true },
      args: [task],
      func: Copy,
    }
  );
}

