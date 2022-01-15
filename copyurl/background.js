"use strict";

import { menus } from "./modules/background/menus.js"

chrome.runtime.onInstalled.addListener(createContextMenus);

function createContextMenus() {
  for (const key in menus) {
    chrome.contextMenus.create(
      {
        id: key,
        title: menus[key]["title"],
      }
    );
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
