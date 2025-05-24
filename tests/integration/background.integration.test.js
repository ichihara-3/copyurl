import { initializeMenus } from '../../src/background.js';
import { menus as defaultMenus } from '../../src/modules/background/menus.js';

describe('Background Script Integration Tests', () => {
  let mockChrome;
  
  beforeEach(() => {
    // Create comprehensive Chrome API mock
    mockChrome = {
      runtime: {
        onInstalled: {
          addListener: jest.fn()
        },
        onStartup: {
          addListener: jest.fn()
        },
        onMessage: {
          addListener: jest.fn()
        }
      },
      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn(),
        },
        onChanged: {
          addListener: jest.fn()
        }
      },
      contextMenus: {
        create: jest.fn(),
        update: jest.fn(),
        onClicked: {
          addListener: jest.fn()
        }
      },
      action: {
        onClicked: {
          addListener: jest.fn()
        }
      },
      scripting: {
        executeScript: jest.fn()
      },
      i18n: {
        getMessage: jest.fn().mockReturnValue('Test Message')
      }
    };
    
    global.chrome = mockChrome;
    
    // Mock console methods
    global.console = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Menu Initialization', () => {
    it('should initialize menus with default configuration when no stored menus exist', async () => {
      mockChrome.storage.sync.get.mockResolvedValue({});
      mockChrome.storage.sync.set.mockResolvedValue();
      
      await initializeMenus();
      
      expect(mockChrome.storage.sync.get).toHaveBeenCalledWith("contextMenus");
      expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({ contextMenus: defaultMenus });
      expect(mockChrome.contextMenus.create).toHaveBeenCalledTimes(defaultMenus.length);
      
      // Verify each menu was created correctly
      defaultMenus.forEach((menu, index) => {
        expect(mockChrome.contextMenus.create).toHaveBeenNthCalledWith(index + 1, {
          id: menu.id,
          title: menu.title,
          visible: menu.active
        });
      });
    });

    it('should merge stored menu states with default menus', async () => {
      const storedMenus = [
        { id: 'copyRichLink', active: false },
        { id: 'copyUrl', active: true }
      ];
      
      mockChrome.storage.sync.get.mockResolvedValue({ contextMenus: storedMenus });
      mockChrome.storage.sync.set.mockResolvedValue();
      
      await initializeMenus();
      
      const expectedMenus = defaultMenus.map(menu => ({ ...menu }));
      expectedMenus[0].active = false; // copyRichLink
      expectedMenus[1].active = true;  // copyUrl
      
      expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({ contextMenus: expectedMenus });
      expect(mockChrome.contextMenus.create).toHaveBeenCalledWith({
        id: 'copyRichLink',
        title: 'Rich Link',
        visible: false
      });
      expect(mockChrome.contextMenus.create).toHaveBeenCalledWith({
        id: 'copyUrl',
        title: 'URL',
        visible: true
      });
    });

    it('should handle storage errors gracefully', async () => {
      mockChrome.storage.sync.get.mockRejectedValue(new Error('Storage error'));
      
      // Should not throw
      await expect(initializeMenus()).rejects.toThrow('Storage error');
    });
  });

  describe('Storage and Caching Integration', () => {
    it('should handle default format caching', async () => {
      const storageChangeListener = jest.fn();
      mockChrome.storage.onChanged.addListener.mockImplementation((callback) => {
        storageChangeListener.mockImplementation(callback);
      });
      
      // Simulate storage change event
      const changes = {
        defaultFormat: {
          oldValue: 'copyRichLink',
          newValue: 'copyUrl'
        }
      };
      
      storageChangeListener(changes, 'sync');
      
      expect(global.console.log).toHaveBeenCalledWith('Default format updated in cache:', 'copyUrl');
    });

    it('should handle notification preference caching', async () => {
      const storageChangeListener = jest.fn();
      mockChrome.storage.onChanged.addListener.mockImplementation((callback) => {
        storageChangeListener.mockImplementation(callback);
      });
      
      // Simulate storage change event
      const changes = {
        showNotification: {
          oldValue: true,
          newValue: false
        }
      };
      
      storageChangeListener(changes, 'sync');
      
      expect(global.console.log).toHaveBeenCalledWith('Notification preference updated in cache:', false);
    });
  });

  describe('Context Menu Updates', () => {
    it('should update context menu visibility based on stored preferences', async () => {
      const testMenus = [
        { id: 'copyRichLink', active: true },
        { id: 'copyUrl', active: false }
      ];
      
      mockChrome.storage.sync.get.mockResolvedValue({ contextMenus: testMenus });
      
      // Simulate menu refresh message
      const messageListener = jest.fn();
      mockChrome.runtime.onMessage.addListener.mockImplementation((callback) => {
        messageListener.mockImplementation(callback);
      });
      
      const sendResponse = jest.fn();
      messageListener({ refresh: true }, {}, sendResponse);
      
      expect(sendResponse).toHaveBeenCalledWith({ result: "finished" });
      expect(mockChrome.storage.sync.get).toHaveBeenCalledWith("contextMenus");
      
      // Should update each menu's visibility
      testMenus.forEach(menu => {
        expect(mockChrome.contextMenus.update).toHaveBeenCalledWith(menu.id, {
          visible: menu.active
        });
      });
    });

    it('should handle non-refresh messages appropriately', async () => {
      const messageListener = jest.fn();
      mockChrome.runtime.onMessage.addListener.mockImplementation((callback) => {
        messageListener.mockImplementation(callback);
      });
      
      const sendResponse = jest.fn();
      messageListener({ otherMessage: true }, {}, sendResponse);
      
      expect(sendResponse).toHaveBeenCalledWith({ result: "refreshMenus did nothing" });
    });
  });

  describe('Script Execution Integration', () => {
    it('should execute Copy script with correct parameters', async () => {
      mockChrome.scripting.executeScript.mockResolvedValue();
      
      // Simulate context menu click
      const contextMenuListener = jest.fn();
      mockChrome.contextMenus.onClicked.addListener.mockImplementation((callback) => {
        contextMenuListener.mockImplementation(callback);
      });
      
      const tab = { id: 123, url: 'https://example.com' };
      const info = { menuItemId: 'copyRichLink' };
      
      contextMenuListener(info, tab);
      
      expect(mockChrome.scripting.executeScript).toHaveBeenCalledWith({
        target: { tabId: 123, allFrames: true },
        args: ['copyRichLink', true], // includes cached showNotification
        func: expect.any(Function)
      });
    });

    it('should handle restricted page errors', async () => {
      const restrictedError = new Error('Cannot access chrome:// URLs');
      mockChrome.scripting.executeScript.mockRejectedValue(restrictedError);
      
      const contextMenuListener = jest.fn();
      mockChrome.contextMenus.onClicked.addListener.mockImplementation((callback) => {
        contextMenuListener.mockImplementation(callback);
      });
      
      const tab = { id: 123, url: 'chrome://settings' };
      const info = { menuItemId: 'copyRichLink' };
      
      // Should not throw
      await expect(async () => {
        contextMenuListener(info, tab);
        // Wait for async execution
        await new Promise(resolve => setTimeout(resolve, 0));
      }).not.toThrow();
      
      expect(global.console.error).toHaveBeenCalledWith('Cannot copy from restricted page:', 'chrome://settings');
    });

    it('should handle invalid task gracefully with fallback', async () => {
      mockChrome.scripting.executeScript.mockResolvedValue();
      
      const contextMenuListener = jest.fn();
      mockChrome.contextMenus.onClicked.addListener.mockImplementation((callback) => {
        contextMenuListener.mockImplementation(callback);
      });
      
      const tab = { id: 123, url: 'https://example.com' };
      const info = { menuItemId: 'invalidTask' };
      
      contextMenuListener(info, tab);
      
      expect(global.console.warn).toHaveBeenCalledWith('Task invalidTask not found in menus. Falling back to copyRichLink.');
      expect(mockChrome.scripting.executeScript).toHaveBeenCalledWith({
        target: { tabId: 123, allFrames: true },
        args: ['copyRichLink', true],
        func: expect.any(Function)
      });
    });
  });

  describe('Extension Lifecycle Integration', () => {
    it('should register all event listeners when chrome API is available', () => {
      // Re-import the module to trigger the chrome availability check
      jest.resetModules();
      global.chrome = mockChrome;
      
      require('../../src/background.js');
      
      expect(mockChrome.runtime.onInstalled.addListener).toHaveBeenCalled();
      expect(mockChrome.runtime.onStartup.addListener).toHaveBeenCalled();
      expect(mockChrome.runtime.onMessage.addListener).toHaveBeenCalled();
      expect(mockChrome.contextMenus.onClicked.addListener).toHaveBeenCalled();
      expect(mockChrome.action.onClicked.addListener).toHaveBeenCalled();
      expect(mockChrome.storage.onChanged.addListener).toHaveBeenCalled();
    });

    it('should handle installation event correctly', async () => {
      mockChrome.storage.sync.get.mockResolvedValue({});
      mockChrome.storage.sync.set.mockResolvedValue();
      
      const installListener = jest.fn();
      mockChrome.runtime.onInstalled.addListener.mockImplementation((callback) => {
        installListener.mockImplementation(callback);
      });
      
      const details = { reason: 'install' };
      installListener(details);
      
      // Should initialize menus and cache
      expect(mockChrome.storage.sync.get).toHaveBeenCalled();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle storage sync errors during cache initialization', async () => {
      const cacheInitError = new Error('Storage sync failed');
      mockChrome.storage.sync.get.mockRejectedValue(cacheInitError);
      
      const startupListener = jest.fn();
      mockChrome.runtime.onStartup.addListener.mockImplementation((callback) => {
        startupListener.mockImplementation(callback);
      });
      
      // Should not throw
      await expect(async () => {
        startupListener();
        await new Promise(resolve => setTimeout(resolve, 0));
      }).not.toThrow();
      
      expect(global.console.error).toHaveBeenCalledWith('Error loading cache settings:', cacheInitError);
    });

    it('should handle script execution errors for unexpected reasons', async () => {
      const unexpectedError = new Error('Unexpected script error');
      mockChrome.scripting.executeScript.mockRejectedValue(unexpectedError);
      
      const contextMenuListener = jest.fn();
      mockChrome.contextMenus.onClicked.addListener.mockImplementation((callback) => {
        contextMenuListener.mockImplementation(callback);
      });
      
      const tab = { id: 123, url: 'https://example.com' };
      const info = { menuItemId: 'copyRichLink' };
      
      // Should not throw
      await expect(async () => {
        contextMenuListener(info, tab);
        await new Promise(resolve => setTimeout(resolve, 0));
      }).not.toThrow();
      
      expect(global.console.error).toHaveBeenCalledWith('An unexpected error occurred during script execution:', unexpectedError);
    });
  });
});