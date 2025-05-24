import { menus as defaultMenus } from '../../src/modules/background/menus.js';

describe('Context Menu Integration Tests', () => {
  let mockChrome;
  let backgroundModule;
  
  beforeEach(() => {
    // Create comprehensive Chrome API mock
    mockChrome = {
      contextMenus: {
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        removeAll: jest.fn(),
        onClicked: {
          addListener: jest.fn()
        }
      },
      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn()
        }
      },
      runtime: {
        onMessage: {
          addListener: jest.fn()
        }
      },
      scripting: {
        executeScript: jest.fn()
      }
    };
    
    global.chrome = mockChrome;
    
    // Mock console
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

  describe('Context Menu Creation', () => {
    it('should create all default context menus', async () => {
      mockChrome.storage.sync.get.mockResolvedValue({});
      mockChrome.storage.sync.set.mockResolvedValue();
      
      const { initializeMenus } = await import('../../src/background.js');
      await initializeMenus();
      
      expect(mockChrome.contextMenus.create).toHaveBeenCalledTimes(defaultMenus.length);
      
      defaultMenus.forEach((menu, index) => {
        expect(mockChrome.contextMenus.create).toHaveBeenNthCalledWith(index + 1, {
          id: menu.id,
          title: menu.title,
          visible: menu.active
        });
      });
    });

    it('should create context menus with stored visibility settings', async () => {
      const storedMenus = [
        { id: 'copyRichLink', active: false },
        { id: 'copyUrl', active: true },
        { id: 'copyUrlWithTitleAsText', active: false }
      ];
      
      mockChrome.storage.sync.get.mockResolvedValue({ contextMenus: storedMenus });
      mockChrome.storage.sync.set.mockResolvedValue();
      
      const { initializeMenus } = await import('../../src/background.js');
      await initializeMenus();
      
      // Check that visibility is set according to stored preferences
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

    it('should handle partial stored menu configurations', async () => {
      const partialStoredMenus = [
        { id: 'copyRichLink', active: false }
        // Missing other menu configurations
      ];
      
      mockChrome.storage.sync.get.mockResolvedValue({ contextMenus: partialStoredMenus });
      mockChrome.storage.sync.set.mockResolvedValue();
      
      const { initializeMenus } = await import('../../src/background.js');
      await initializeMenus();
      
      // Should still create all menus, with defaults for missing ones
      expect(mockChrome.contextMenus.create).toHaveBeenCalledTimes(defaultMenus.length);
      
      // copyRichLink should use stored setting
      expect(mockChrome.contextMenus.create).toHaveBeenCalledWith({
        id: 'copyRichLink',
        title: 'Rich Link',
        visible: false
      });
      
      // Others should use default settings
      expect(mockChrome.contextMenus.create).toHaveBeenCalledWith({
        id: 'copyUrl',
        title: 'URL',
        visible: false // default from menus.js
      });
    });
  });

  describe('Context Menu Updates', () => {
    it('should update context menu visibility when settings change', async () => {
      const updatedMenus = [
        { id: 'copyRichLink', active: true },
        { id: 'copyUrl', active: false },
        { id: 'copyUrlWithTitleAsText', active: true }
      ];
      
      mockChrome.storage.sync.get.mockResolvedValue({ contextMenus: updatedMenus });
      
      // Import background to get access to the message handler
      await import('../../src/background.js');
      
      // Simulate message handler registration
      const messageHandler = mockChrome.runtime.onMessage.addListener.mock.calls[0][0];
      const sendResponse = jest.fn();
      
      // Trigger menu refresh
      messageHandler({ refresh: true }, {}, sendResponse);
      
      expect(sendResponse).toHaveBeenCalledWith({ result: "finished" });
      expect(mockChrome.storage.sync.get).toHaveBeenCalledWith("contextMenus");
      
      // Should update each menu's visibility
      updatedMenus.forEach(menu => {
        expect(mockChrome.contextMenus.update).toHaveBeenCalledWith(menu.id, {
          visible: menu.active
        });
      });
    });

    it('should fall back to default menus when stored menus are invalid', async () => {
      mockChrome.storage.sync.get.mockResolvedValue({}); // No stored menus
      
      await import('../../src/background.js');
      
      const messageHandler = mockChrome.runtime.onMessage.addListener.mock.calls[0][0];
      const sendResponse = jest.fn();
      
      messageHandler({ refresh: true }, {}, sendResponse);
      
      expect(global.console.log).toHaveBeenCalledWith("update failed, fallback to default menu");
      
      // Should update using default menu settings
      defaultMenus.forEach(menu => {
        expect(mockChrome.contextMenus.update).toHaveBeenCalledWith(menu.id, {
          visible: menu.active
        });
      });
    });

    it('should handle non-refresh messages correctly', async () => {
      await import('../../src/background.js');
      
      const messageHandler = mockChrome.runtime.onMessage.addListener.mock.calls[0][0];
      const sendResponse = jest.fn();
      
      // Send non-refresh message
      messageHandler({ otherMessage: true }, {}, sendResponse);
      
      expect(sendResponse).toHaveBeenCalledWith({ result: "refreshMenus did nothing" });
      expect(mockChrome.storage.sync.get).not.toHaveBeenCalled();
      expect(mockChrome.contextMenus.update).not.toHaveBeenCalled();
    });
  });

  describe('Context Menu Click Handling', () => {
    it('should execute copy script when context menu is clicked', async () => {
      mockChrome.scripting.executeScript.mockResolvedValue();
      
      await import('../../src/background.js');
      
      const clickHandler = mockChrome.contextMenus.onClicked.addListener.mock.calls[0][0];
      
      const info = { menuItemId: 'copyRichLink' };
      const tab = { id: 123, url: 'https://example.com' };
      
      clickHandler(info, tab);
      
      expect(mockChrome.scripting.executeScript).toHaveBeenCalledWith({
        target: { tabId: 123, allFrames: true },
        args: ['copyRichLink', true], // includes showNotification default
        func: expect.any(Function)
      });
    });

    it('should handle different menu items correctly', async () => {
      mockChrome.scripting.executeScript.mockResolvedValue();
      
      await import('../../src/background.js');
      
      const clickHandler = mockChrome.contextMenus.onClicked.addListener.mock.calls[0][0];
      
      // Test different menu items
      const menuItems = ['copyUrl', 'copyUrlWithTitleAsText', 'copyUrlWithTitleAsMarkdown'];
      
      for (const menuItem of menuItems) {
        const info = { menuItemId: menuItem };
        const tab = { id: 123, url: 'https://example.com' };
        
        clickHandler(info, tab);
        
        expect(mockChrome.scripting.executeScript).toHaveBeenCalledWith({
          target: { tabId: 123, allFrames: true },
          args: [menuItem, true],
          func: expect.any(Function)
        });
      }
    });

    it('should handle invalid menu items with fallback', async () => {
      mockChrome.scripting.executeScript.mockResolvedValue();
      
      await import('../../src/background.js');
      
      const clickHandler = mockChrome.contextMenus.onClicked.addListener.mock.calls[0][0];
      
      const info = { menuItemId: 'invalidMenuItem' };
      const tab = { id: 123, url: 'https://example.com' };
      
      clickHandler(info, tab);
      
      expect(global.console.warn).toHaveBeenCalledWith(
        'Task invalidMenuItem not found in menus. Falling back to copyRichLink.'
      );
      
      expect(mockChrome.scripting.executeScript).toHaveBeenCalledWith({
        target: { tabId: 123, allFrames: true },
        args: ['copyRichLink', true],
        func: expect.any(Function)
      });
    });
  });

  describe('Error Scenarios', () => {
    it('should handle storage errors during menu initialization', async () => {
      mockChrome.storage.sync.get.mockRejectedValue(new Error('Storage error'));
      
      const { initializeMenus } = await import('../../src/background.js');
      
      await expect(initializeMenus()).rejects.toThrow('Storage error');
    });

    it('should handle script execution errors for restricted pages', async () => {
      const restrictedError = new Error('Cannot access chrome:// URLs');
      mockChrome.scripting.executeScript.mockRejectedValue(restrictedError);
      
      await import('../../src/background.js');
      
      const clickHandler = mockChrome.contextMenus.onClicked.addListener.mock.calls[0][0];
      
      const info = { menuItemId: 'copyRichLink' };
      const tab = { id: 123, url: 'chrome://settings' };
      
      // Should not throw
      await expect(async () => {
        clickHandler(info, tab);
        // Wait for async execution
        await new Promise(resolve => setTimeout(resolve, 0));
      }).not.toThrow();
      
      expect(global.console.error).toHaveBeenCalledWith(
        'Cannot copy from restricted page:', 'chrome://settings'
      );
    });

    it('should handle unexpected script execution errors', async () => {
      const unexpectedError = new Error('Unexpected error');
      mockChrome.scripting.executeScript.mockRejectedValue(unexpectedError);
      
      await import('../../src/background.js');
      
      const clickHandler = mockChrome.contextMenus.onClicked.addListener.mock.calls[0][0];
      
      const info = { menuItemId: 'copyRichLink' };
      const tab = { id: 123, url: 'https://example.com' };
      
      // Should not throw
      await expect(async () => {
        clickHandler(info, tab);
        await new Promise(resolve => setTimeout(resolve, 0));
      }).not.toThrow();
      
      expect(global.console.error).toHaveBeenCalledWith(
        'An unexpected error occurred during script execution:', unexpectedError
      );
    });

    it('should handle context menu creation errors', async () => {
      mockChrome.storage.sync.get.mockResolvedValue({});
      mockChrome.storage.sync.set.mockResolvedValue();
      mockChrome.contextMenus.create.mockImplementation(() => {
        throw new Error('Context menu creation failed');
      });
      
      const { initializeMenus } = await import('../../src/background.js');
      
      await expect(initializeMenus()).rejects.toThrow('Context menu creation failed');
    });

    it('should handle context menu update errors', async () => {
      const testMenus = [{ id: 'copyRichLink', active: true }];
      
      mockChrome.storage.sync.get.mockResolvedValue({ contextMenus: testMenus });
      mockChrome.contextMenus.update.mockImplementation(() => {
        throw new Error('Context menu update failed');
      });
      
      await import('../../src/background.js');
      
      const messageHandler = mockChrome.runtime.onMessage.addListener.mock.calls[0][0];
      const sendResponse = jest.fn();
      
      // Should not throw, but should handle error
      await expect(async () => {
        messageHandler({ refresh: true }, {}, sendResponse);
        await new Promise(resolve => setTimeout(resolve, 0));
      }).not.toThrow();
    });
  });

  describe('Menu Configuration Validation', () => {
    it('should validate menu IDs match expected format', () => {
      const validMenuIds = [
        'copyRichLink',
        'copyUrl', 
        'copyUrlWithTitleAsText',
        'copyUrlWithTitleAsMarkdown',
        'copyUrlAsHtml',
        'copyUrlWithTitleAsHtml',
        'copyTitle'
      ];
      
      const actualMenuIds = defaultMenus.map(menu => menu.id);
      
      expect(actualMenuIds).toEqual(expect.arrayContaining(validMenuIds));
      expect(actualMenuIds.length).toBe(validMenuIds.length);
    });

    it('should ensure all menus have required properties', () => {
      defaultMenus.forEach(menu => {
        expect(menu).toHaveProperty('id');
        expect(menu).toHaveProperty('title');
        expect(menu).toHaveProperty('active');
        expect(menu).toHaveProperty('description');
        
        expect(typeof menu.id).toBe('string');
        expect(typeof menu.title).toBe('string');
        expect(typeof menu.active).toBe('boolean');
        expect(typeof menu.description).toBe('string');
        
        expect(menu.id.length).toBeGreaterThan(0);
        expect(menu.title.length).toBeGreaterThan(0);
        expect(menu.description.length).toBeGreaterThan(0);
      });
    });
  });
});