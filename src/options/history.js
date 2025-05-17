"use strict";

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('history-list');
  chrome.storage.local.get({ copyHistory: [] }).then(({ copyHistory }) => {
    copyHistory.forEach(({ url, title }) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = url;
      a.textContent = title || url;
      a.target = '_blank';
      li.appendChild(a);
      list.appendChild(li);
    });
  });
});
