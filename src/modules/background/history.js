"use strict";

const MAX_HISTORY = 20;

async function addToHistory({ url, title }) {
  const { copyHistory = [] } = await chrome.storage.local.get({ copyHistory: [] });
  const newEntry = { url, title, timestamp: Date.now() };
  const updated = [newEntry, ...copyHistory].slice(0, MAX_HISTORY);
  await chrome.storage.local.set({ copyHistory: updated });
}

export { addToHistory, MAX_HISTORY };
