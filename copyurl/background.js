"use strict";

import { menus as defaultMenus } from "./modules/background/menus.js"

chrome.runtime.onInstalled.addListener(initializeMenus);
chrome.runtime.onMessage.addListener(refreshMenus);

chrome.contextMenus.onClicked.addListener(runTaskOfClickedMenu);

function initializeMenus(details) {
  chrome.storage.sync.get("menus")
    .then((items) => {
      let menus;
      if (items.menus) {
        menus = items.menus;
      } else {
        menus = defaultMenus;
      }
      chrome.storage.sync.set({ menus })
        .then(createContextMenus(menus));
    });
}

function refreshMenus(message, sender, sendResponse) {
  if (!message.refresh) {
    sendResponse({ result: 'refreshMenus did nothing' });
    return
  }
  updateContextMenus();
  sendResponse({ result: 'finshed' });
}

function createContextMenus(menus) {
  for (const key in menus) {
    if (menus[key]["active"]) {
      chrome.contextMenus.create(
        {
          id: key,
          title: menus[key]["title"],
        }
      );
    }
  }
}

function updateContextMenus() {
  chrome.contextMenus.removeAll();
  chrome.storage.sync.get("menus")
    .then((items) => {
      if (items.menus) {
        createContextMenus(items.menus);
      } else {
        createContextMenus(defaultMenus);
        console.log("update failed, fallback to default menu")
      }
    });
}

function runTaskOfClickedMenu(info, tab) {
  const id = info.menuItemId;
  if (!(id in defaultMenus)) {
    throw ("an undefined item of menus.")
  }
  const task = defaultMenus[id]["task"];
  task();
}