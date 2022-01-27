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
      label.innerText = menu["title"];

      const p = document.createElement("p");
      p.className = "description"
      p.innerText = menu["description"];

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

