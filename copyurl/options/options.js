"use strict";

chrome.storage.sync.get("menus")
  .then((items) => {
    const menus = items.menus;
    const options = document.getElementById("options");
    for (const key in menus) {
      const menuDiv = document.createElement("div");
      options.appendChild(menuDiv);

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = key;
      checkbox.checked = menus[key]["active"];

      const label = document.createElement("label");
      label.for = key;
      label.innerText = menus[key]["title"];

      const p = document.createElement("p");
      p.className = "description"
      p.innerText = menus[key]["description"];

      menuDiv.appendChild(checkbox);
      menuDiv.appendChild(label);
      menuDiv.appendChild(p);

      checkbox.addEventListener("change", (event) => {
        updateMenus();
      })
    }
  });

function updateMenus() {
  chrome.storage.sync.get("menus")
    .then((items) => {
      const menus = items.menus;
      for (const key in menus) {
        const checkbox = document.getElementById(key);
        menus[key]["active"] = checkbox.checked;
      }
      chrome.storage.sync.set({ menus }).then(() => {
        chrome.runtime.sendMessage({ refresh: true })
      });
    });
}

