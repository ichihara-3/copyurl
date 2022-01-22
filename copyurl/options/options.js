
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

      menuDiv.appendChild(checkbox);
      menuDiv.appendChild(label);

      checkbox.addEventListener("change", (event) => {
        updateMenus(menus);
      })
    }
  });

function updateMenus(menus) {
  for (const key in menus) {
    const checkbox = document.getElementById(key);
    menus[key]["active"] = checkbox.checked;
  }
  chrome.storage.sync.set(menus);
}

