import { addToHistory, MAX_HISTORY } from '../src/modules/background/history.js';

describe('addToHistory', () => {
  beforeEach(() => {
    global.chrome = {
      storage: {
        local: {
          get: jest.fn().mockResolvedValue({ copyHistory: [] }),
          set: jest.fn().mockResolvedValue(),
        },
      },
    };
  });

  test('adds entry and trims history', async () => {
    const existing = Array(MAX_HISTORY).fill({ url: 'old', title: 'old' });
    chrome.storage.local.get.mockResolvedValue({ copyHistory: existing });

    await addToHistory({ url: 'https://example.com', title: 'Example' });

    expect(chrome.storage.local.get).toHaveBeenCalledWith({ copyHistory: [] });
    expect(chrome.storage.local.set).toHaveBeenCalled();
    const updated = chrome.storage.local.set.mock.calls[0][0].copyHistory;
    expect(updated.length).toBe(MAX_HISTORY);
    expect(updated[0].url).toBe('https://example.com');
  });
});
