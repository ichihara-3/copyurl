"use strict";

import { menus } from "./modules/background/menus.js"

chrome.runtime.onInstalled.addListener(initializeMenus);
chrome.runtime.onMessage.addListener(refreshMenus);

chrome.contextMenus.onClicked.addListener(runTaskOfClickedMenu);

function initializeMenus(details) {
  createContextMenus();
}

function refreshMenus(message, sender, sendResponse) {
  if (!message.refresh) {
    sendResponse({ result: 'refreshMenus did nothing' });
    return
  }
  updateContextMenus();
  sendResponse({ result: 'finshed' });
}

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
}

function updateContextMenus() {
  chrome.contextMenus.removeAll();
  createContextMenus();
}

function runTaskOfClickedMenu(info, tab) {
  const id = info.menuItemId;
  if (!(id in menus)) {
    throw ("an undefined item of menus.")
  }
  const task = menus[id]["task"];
  task();
}