"use strict";

import { menus } from "./modules/background/menus.js"

chrome.runtime.onInstalled.addListener(createContextMenus);
chrome.runtime.onMessage.addListener(updateContextMenus);

function createContextMenus() {
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
  chrome.contextMenus.onClicked.addListener(runTaskOfClickedMenu);
}

function runTaskOfClickedMenu(info, tab) {
  const id = info.menuItemId;
  if (!(id in menus)) {
    throw ("an undefined item of menus.")
  }
  const task = menus[id]["task"];
  task();
}

function updateContextMenus(message, sender, sendResponse) {
  chrome.contextMenus.removeAll();
  for (const key in menus) {
    if (!(menus[key][active])) {
      chrome.contextMenus.remove(key);
    }
  }
  for (const key in menus) {
    if (menus[key][active]) {
      chrome.contextMenus.create(
        {
          id
        }
      )
    }
  }
}

