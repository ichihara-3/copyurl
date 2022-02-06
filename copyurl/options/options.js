"use strict";

chrome.storage.sync.get("contextMenus")
  .then((items) => {
    const contextMenus = items.contextMenus;
    const options = document.getElementById("options");
    for (const menu of contextMenus) {
      const menuDiv = document.createElement("div");
      options.appendChild(menuDiv);

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = menu["id"];
      checkbox.checked = menu["active"];

      const label = document.createElement("label");
      label.for = menu["id"];
      // Until the chrome bug is fixed, you cannot i18n-ized context menu.
      // c.f. https://bugs.chromium.org/p/chromium/issues/detail?id=1268098
      // So adding some translations beside to English title
      if (chrome.i18n.getUILanguage().slice(0, 2) === "en") {
        label.innerText = menu["title"];
      } else {
        label.innerText = menu["title"] + ` (${chrome.i18n.getMessage(menu.id)})`;
      }

      const p = document.createElement("p");
      p.className = "description";
      p.innerText = chrome.i18n.getMessage(`${menu.id}_description`);

      menuDiv.appendChild(checkbox);
      menuDiv.appendChild(label);
      menuDiv.appendChild(p);

      checkbox.addEventListener("change", (event) => {
        updateMenus();
      })
    }
  });

function updateMenus() {
  chrome.storage.sync.get("contextMenus")
    .then((items) => {
      const contextMenus = items.contextMenus;
      for (const menu of contextMenus) {
        const checkbox = document.getElementById(menu["id"]);
        menu["active"] = checkbox.checked;
      }
      chrome.storage.sync.set({ contextMenus }).then(() => {
        chrome.runtime.sendMessage({ refresh: true })
      });
    });
}