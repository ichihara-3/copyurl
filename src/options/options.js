"use strict";

// Initialize i18n for notification section
document.getElementById('notification-options-title').textContent = chrome.i18n.getMessage('notification_options_title');
document.getElementById('show-notification-label').textContent = chrome.i18n.getMessage('show_notification_label');
document.getElementById('show-notification-description').textContent = chrome.i18n.getMessage('show_notification_description');

// Load notification settings
chrome.storage.sync.get({ showNotification: true }).then(({ showNotification }) => {
  const notificationCheckbox = document.getElementById('show-notification');
  notificationCheckbox.checked = showNotification;
  
  // Add event listener to save changes immediately
  notificationCheckbox.addEventListener('change', () => {
    chrome.storage.sync.set({ showNotification: notificationCheckbox.checked });
  });
  
  // Add click listener to the entire row for the notification checkbox
  const notificationWrapper = notificationCheckbox.closest('.control-wrapper');
  if (notificationWrapper) {
    notificationWrapper.addEventListener('click', function(event) {
      if (event.target !== notificationCheckbox && event.target !== notificationWrapper.querySelector('label')) {
        notificationCheckbox.checked = !notificationCheckbox.checked;
        chrome.storage.sync.set({ showNotification: notificationCheckbox.checked });
      }
    });
  }
});

// Load context menus and set up checkboxes
chrome.storage.sync.get("contextMenus")
  .then((items) => {
    const contextMenus = items.contextMenus;
    const options = document.getElementById("options");
    for (const menu of contextMenus) {
      const menuDiv = document.createElement("div");
      options.appendChild(menuDiv);

      // Create a wrapper for the checkbox and label for better alignment
      const controlWrapper = document.createElement("div");
      controlWrapper.className = "control-wrapper";
      
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = menu["id"];
      checkbox.checked = menu["active"];

      const label = document.createElement("label");
      label.htmlFor = menu["id"]; // Fix: use htmlFor instead of for
      // Until the chrome bug is fixed, you cannot i18n-ize the context menu.
      // c.f. https://bugs.chromium.org/p/chromium/issues/detail?id=1268098
      // So adding some translations beside to English title
      if (chrome.i18n.getUILanguage().slice(0, 2) === "en") {
        label.innerText = menu["title"].replace(/&&/g, '&');
      } else {
        label.innerText = menu["title"].replace(/&&/g, '&') + ` (${chrome.i18n.getMessage(menu.id)})`;
      }

      const p = document.createElement("p");
      p.className = "description";
      p.innerText = chrome.i18n.getMessage(`${menu.id}_description`);

      controlWrapper.appendChild(checkbox);
      controlWrapper.appendChild(label);
      
      menuDiv.appendChild(controlWrapper);
      menuDiv.appendChild(p);

      // Add click listener to the entire row for checkboxes
      menuDiv.addEventListener('click', function(event) {
        if (event.target !== checkbox && event.target !== label) {
          checkbox.checked = !checkbox.checked;
          updateMenus(); // Ensure storage and context menus are updated
        }
      });

      checkbox.addEventListener("change", (event) => {
        updateMenus();
      })
    }
  });

// Load and set up default format radio buttons
chrome.storage.sync.get({ defaultFormat: 'copyRichLink' })
  .then(({ defaultFormat }) => {
    const defaultFormatOptions = document.getElementById("default-format-options");
    
    // Get the menus to create radio buttons for each format
    chrome.storage.sync.get("contextMenus").then((items) => {
      const contextMenus = items.contextMenus;
      
      for (const menu of contextMenus) {
        const formatDiv = document.createElement("div");
        defaultFormatOptions.appendChild(formatDiv);
        
        // Create a wrapper for the radio and label for better alignment
        const controlWrapper = document.createElement("div");
        controlWrapper.className = "control-wrapper";
        
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.id = `default-${menu.id}`;
        radio.name = "defaultFormat";
        radio.value = menu.id;
        radio.checked = (menu.id === defaultFormat);
        
        // Keep all radio buttons enabled regardless of context menu settings
        // This allows users to select any format as default, even if disabled in context menu
        radio.disabled = false;
        
        const label = document.createElement("label");
        label.htmlFor = `default-${menu.id}`;
        
        if (chrome.i18n.getUILanguage().slice(0, 2) === "en") {
          label.innerText = menu["title"].replace(/&&/g, '&');
        } else {
          label.innerText = menu["title"].replace(/&&/g, '&') + ` (${chrome.i18n.getMessage(menu.id)})`;
        }
        
        // No disabled styling, all formats are available for the icon click
        
        // Add description for the format option
        const p = document.createElement("p");
        p.className = "description";
        p.innerText = chrome.i18n.getMessage(`${menu.id}_description`);
        
        controlWrapper.appendChild(radio);
        controlWrapper.appendChild(label);
        
        formatDiv.appendChild(controlWrapper);
        formatDiv.appendChild(p);
        
        // Add click listener to the entire row for radio buttons - works for all items
        formatDiv.addEventListener('click', function(event) {
          // No skip condition - all formats can be selected for icon click
          
          if (event.target !== radio && event.target !== label) {
            if (!radio.checked) { // Only act if it's not already checked
              radio.checked = true;
              chrome.storage.sync.set({ defaultFormat: radio.value });
            }
          }
        });

        // Add event listener to save changes immediately
        radio.addEventListener("change", () => {
          if (radio.checked) {
            chrome.storage.sync.set({ defaultFormat: radio.value });
          }
        });
      }
      
      // Check if the currently selected default format is disabled and switch if needed
      updateDefaultFormatSelection(contextMenus, defaultFormat);
    });
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
        chrome.runtime.sendMessage({ refresh: true });
        
        // Update radio button disabled states when menu options change
        updateDefaultFormatOptions(contextMenus);
      });
    });
}

// Helper function to update the default format radio buttons
// Default format selection is independent from context menu enabled/disabled state
function updateDefaultFormatOptions(contextMenus) {
  for (const menu of contextMenus) {
    const radio = document.getElementById(`default-${menu.id}`);
    const label = document.querySelector(`label[for="default-${menu.id}"]`);
    
    if (radio) {
      // Keep all radio buttons enabled regardless of context menu settings
      radio.disabled = false;
      
      if (label) {
        // Remove any disabled styling
        label.classList.remove("disabled");
      }
    }
  }
}

// Helper function to update the default format selection if needed
// This is now only used to validate that the format exists in the menu system
function updateDefaultFormatSelection(contextMenus, defaultFormat) {
  const selectedMenu = contextMenus.find(menu => menu.id === defaultFormat);
    
  // Only switch if the format isn't found in the menus array
  if (!selectedMenu) {
    const firstMenu = contextMenus[0]; // Just use the first available menu
    
    if (firstMenu) {
      console.warn(`Default format "${defaultFormat}" is not found. Switching to "${firstMenu.id}".`);
      chrome.storage.sync.set({ defaultFormat: firstMenu.id });
      
      // Update the checked state of radio buttons
      const radios = document.querySelectorAll('input[name="defaultFormat"]');
      radios.forEach(r => {
        r.checked = (r.value === firstMenu.id);
      });
    }
  }
}