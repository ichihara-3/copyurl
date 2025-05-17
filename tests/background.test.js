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
