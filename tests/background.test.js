import { initializeMenus } from '../src/background.js';
import { menus as defaultMenus } from '../src/modules/background/menus.js';

describe('initializeMenus', () => {
  beforeEach(() => {
    global.chrome = {
      storage: {
        sync: {
          get: jest.fn().mockResolvedValue({
            contextMenus: [
              { id: 'copyRichLink', active: false }
            ]
          }),
          set: jest.fn().mockResolvedValue(),
        },
      },
      contextMenus: {
        create: jest.fn(),
      },
    };
  });

  test('applies stored menu states', async () => {
    const expectedMenus = defaultMenus.map(m => ({ ...m }));
    expectedMenus[0].active = false;
    await initializeMenus();
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ contextMenus: expectedMenus });
    expect(chrome.contextMenus.create).toHaveBeenCalledTimes(expectedMenus.length);
    expect(chrome.contextMenus.create).toHaveBeenCalledWith({
      id: expectedMenus[0].id,
      title: expectedMenus[0].title,
      visible: expectedMenus[0].active,
    });
  });
});

describe('keyboard commands', () => {
  test('commands are defined in manifest', () => {
    const fs = require('fs');
    const path = require('path');
    const manifestPath = path.join(__dirname, '../src/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    expect(manifest.commands).toBeDefined();
    expect(manifest.commands['copy-rich-link']).toBeDefined();
    expect(manifest.commands['copy-url-only']).toBeDefined();
    expect(manifest.commands['copy-markdown']).toBeDefined();
    
    // Check keyboard shortcuts
    expect(manifest.commands['copy-rich-link'].suggested_key.default).toBe('Ctrl+Shift+C');
    expect(manifest.commands['copy-url-only'].suggested_key.default).toBe('Ctrl+Shift+U');
    expect(manifest.commands['copy-markdown'].suggested_key.default).toBe('Ctrl+Shift+M');
  });
});
