import { Copy } from '../../src/modules/background/Copy.js';

describe('Error Scenarios Integration Tests', () => {
  let mockChrome;
  let originalConsole;
  
  beforeEach(() => {
    // Create Chrome API mock
    mockChrome = {
      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn()
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
      scripting: {
        executeScript: jest.fn()
      },
      runtime: {
        onInstalled: { addListener: jest.fn() },
        onStartup: { addListener: jest.fn() },
        onMessage: { addListener: jest.fn() },
        sendMessage: jest.fn()
      },
      action: {
        onClicked: { addListener: jest.fn() }
      },
      i18n: {
        getMessage: jest.fn()
      }
    };
    
    global.chrome = mockChrome;
    
    // Store original console and create mock
    originalConsole = global.console;
    global.console = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };
    
    // Mock DOM environment
    global.document = {
      title: 'Test Page',
      createElement: jest.fn((tag) => ({
        tagName: tag.toUpperCase(),
        style: {},
        href: '',
        innerText: '',
        textContent: '',
        outerHTML: `<${tag}></${tag}>`,
        setAttribute: jest.fn(),
        append: jest.fn(),
        appendChild: jest.fn(),
        remove: jest.fn(),
        select: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      })),
      body: {
        append: jest.fn(),
        appendChild: jest.fn(),
        removeChild: jest.fn()
      },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      execCommand: jest.fn()
    };
    
    global.location = { href: 'https://example.com/test' };
    global.navigator = {};
    global.Blob = jest.fn();
    global.ClipboardItem = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.console = originalConsole;
  });

  describe('Clipboard API Failures', () => {
    it('should handle complete clipboard API unavailability', async () => {
      global.navigator = {}; // No clipboard property
      global.document.execCommand.mockReturnValue(true);
      
      await Copy('copyUrl');
      
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
      expect(global.document.createElement).toHaveBeenCalledWith('textArea');
    });

    it('should handle clipboard.writeText rejection with fallback success', async () => {
      global.navigator.clipboard = {
        writeText: jest.fn().mockRejectedValue(new Error('Clipboard denied'))
      };
      global.document.execCommand.mockReturnValue(true);
      
      await Copy('copyUrl');
      
      expect(global.navigator.clipboard.writeText).toHaveBeenCalled();
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
      expect(global.console.debug).toHaveBeenCalledWith(
        "Copying failed. Trying to fall back to execCommand('copy')"
      );
    });

    it('should handle both clipboard API and execCommand failures', async () => {
      global.navigator.clipboard = {
        writeText: jest.fn().mockRejectedValue(new Error('Clipboard denied'))
      };
      global.document.execCommand.mockReturnValue(false);
      
      await Copy('copyUrl');
      
      expect(global.navigator.clipboard.writeText).toHaveBeenCalled();
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
      // Should not show notification when both methods fail
    });

    it('should handle execCommand throwing exception', async () => {
      global.navigator.clipboard = {
        writeText: jest.fn().mockRejectedValue(new Error('Clipboard denied'))
      };
      global.document.execCommand.mockImplementation(() => {
        throw new Error('execCommand failed');
      });
      
      await Copy('copyUrl');
      
      expect(global.navigator.clipboard.writeText).toHaveBeenCalled();
      expect(global.document.execCommand).toHaveBeenCalled();
      // Should handle exception gracefully
    });
  });

  describe('Rich Link Copy Failures', () => {
    it('should handle clipboard.write rejection with fallback', async () => {
      global.navigator.clipboard = {
        write: jest.fn().mockRejectedValue(new Error('Rich clipboard denied'))
      };
      global.document.execCommand.mockReturnValue(true);
      
      await Copy('copyRichLink');
      
      expect(global.navigator.clipboard.write).toHaveBeenCalled();
      expect(global.document.addEventListener).toHaveBeenCalledWith(
        'copy', expect.any(Function), { passive: false }
      );
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
      expect(global.document.removeEventListener).toHaveBeenCalled();
    });

    it('should handle Blob creation errors', async () => {
      global.Blob = jest.fn().mockImplementation(() => {
        throw new Error('Blob creation failed');
      });
      global.navigator.clipboard = {
        write: jest.fn()
      };
      
      await expect(Copy('copyRichLink')).rejects.toThrow('Blob creation failed');
    });

    it('should handle ClipboardItem creation errors', async () => {
      global.ClipboardItem = jest.fn().mockImplementation(() => {
        throw new Error('ClipboardItem creation failed');
      });
      global.navigator.clipboard = {
        write: jest.fn()
      };
      
      await expect(Copy('copyRichLink')).rejects.toThrow('ClipboardItem creation failed');
    });

    it('should handle missing ClipboardItem constructor', async () => {
      global.ClipboardItem = undefined;
      global.navigator.clipboard = {
        write: jest.fn().mockRejectedValue(new Error('ClipboardItem not supported'))
      };
      global.document.execCommand.mockReturnValue(true);
      
      await Copy('copyRichLink');
      
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
    });
  });

  describe('Storage Errors', () => {
    it('should handle storage.sync.get failures during initialization', async () => {
      mockChrome.storage.sync.get.mockRejectedValue(new Error('Storage unavailable'));
      
      const { initializeMenus } = await import('../../src/background.js');
      
      await expect(initializeMenus()).rejects.toThrow('Storage unavailable');
    });

    it('should handle storage.sync.set failures', async () => {
      mockChrome.storage.sync.get.mockResolvedValue({});
      mockChrome.storage.sync.set.mockRejectedValue(new Error('Storage write failed'));
      
      const { initializeMenus } = await import('../../src/background.js');
      
      await expect(initializeMenus()).rejects.toThrow('Storage write failed');
    });

    it('should handle storage quota exceeded errors', async () => {
      mockChrome.storage.sync.set.mockRejectedValue(
        new Error('QUOTA_BYTES quota exceeded')
      );
      
      // Simulate options page storage update
      await expect(
        mockChrome.storage.sync.set({ largeData: 'x'.repeat(100000) })
      ).rejects.toThrow('QUOTA_BYTES quota exceeded');
    });

    it('should handle storage sync disabled errors', async () => {
      mockChrome.storage.sync.get.mockRejectedValue(
        new Error('Storage sync is disabled')
      );
      
      const { initializeMenus } = await import('../../src/background.js');
      
      await expect(initializeMenus()).rejects.toThrow('Storage sync is disabled');
    });
  });

  describe('Script Execution Errors', () => {
    it('should handle restricted page errors (chrome://, extension://, etc.)', async () => {
      const restrictedErrors = [
        'Cannot access contents of url "chrome://settings/"',
        'Cannot access a chrome:// URL',
        'Cannot access contents of url "moz-extension://"',
        'Cannot access a restricted URL'
      ];
      
      await import('../../src/background.js');
      const clickHandler = mockChrome.contextMenus.onClicked.addListener.mock.calls[0][0];
      
      for (const errorMessage of restrictedErrors) {
        mockChrome.scripting.executeScript.mockRejectedValue(new Error(errorMessage));
        
        const info = { menuItemId: 'copyRichLink' };
        const tab = { id: 123, url: 'chrome://settings' };
        
        // Should not throw
        await expect(async () => {
          clickHandler(info, tab);
          await new Promise(resolve => setTimeout(resolve, 0));
        }).not.toThrow();
        
        expect(global.console.error).toHaveBeenCalledWith(
          'Cannot copy from restricted page:', 'chrome://settings'
        );
        
        jest.clearAllMocks();
      }
    });

    it('should handle tab not found errors', async () => {
      mockChrome.scripting.executeScript.mockRejectedValue(
        new Error('No tab with id: 999')
      );
      
      await import('../../src/background.js');
      const clickHandler = mockChrome.contextMenus.onClicked.addListener.mock.calls[0][0];
      
      const info = { menuItemId: 'copyRichLink' };
      const tab = { id: 999, url: 'https://example.com' };
      
      await expect(async () => {
        clickHandler(info, tab);
        await new Promise(resolve => setTimeout(resolve, 0));
      }).not.toThrow();
      
      expect(global.console.error).toHaveBeenCalledWith(
        'An unexpected error occurred during script execution:', 
        expect.any(Error)
      );
    });

    it('should handle permission denied errors', async () => {
      mockChrome.scripting.executeScript.mockRejectedValue(
        new Error('The extensions gallery cannot be scripted')
      );
      
      await import('../../src/background.js');
      const clickHandler = mockChrome.contextMenus.onClicked.addListener.mock.calls[0][0];
      
      const info = { menuItemId: 'copyRichLink' };
      const tab = { id: 123, url: 'https://chrome.google.com/webstore' };
      
      await expect(async () => {
        clickHandler(info, tab);
        await new Promise(resolve => setTimeout(resolve, 0));
      }).not.toThrow();
      
      expect(global.console.error).toHaveBeenCalledWith(
        'Cannot copy from restricted page:', 'https://chrome.google.com/webstore'
      );
    });
  });

  describe('Context Menu Errors', () => {
    it('should handle context menu creation failures', async () => {
      mockChrome.storage.sync.get.mockResolvedValue({});
      mockChrome.storage.sync.set.mockResolvedValue();
      mockChrome.contextMenus.create.mockImplementation(() => {
        throw new Error('Failed to create context menu item');
      });
      
      const { initializeMenus } = await import('../../src/background.js');
      
      await expect(initializeMenus()).rejects.toThrow('Failed to create context menu item');
    });

    it('should handle context menu update failures', async () => {
      mockChrome.storage.sync.get.mockResolvedValue({
        contextMenus: [{ id: 'copyRichLink', active: true }]
      });
      mockChrome.contextMenus.update.mockImplementation(() => {
        throw new Error('Failed to update context menu');
      });
      
      await import('../../src/background.js');
      const messageHandler = mockChrome.runtime.onMessage.addListener.mock.calls[0][0];
      
      const sendResponse = jest.fn();
      
      await expect(async () => {
        messageHandler({ refresh: true }, {}, sendResponse);
        await new Promise(resolve => setTimeout(resolve, 0));
      }).not.toThrow();
      
      // Should still respond even if update fails
      expect(sendResponse).toHaveBeenCalledWith({ result: "finished" });
    });

    it('should handle context menu API unavailability', async () => {
      delete mockChrome.contextMenus;
      
      const { initializeMenus } = await import('../../src/background.js');
      
      await expect(initializeMenus()).rejects.toThrow();
    });
  });

  describe('Runtime Message Errors', () => {
    it('should handle runtime.sendMessage failures in options page', async () => {
      mockChrome.runtime.sendMessage.mockRejectedValue(
        new Error('Could not establish connection')
      );
      
      // Simulate options page message
      await expect(
        mockChrome.runtime.sendMessage({ refresh: true })
      ).rejects.toThrow('Could not establish connection');
    });

    it('should handle invalid message format', async () => {
      await import('../../src/background.js');
      const messageHandler = mockChrome.runtime.onMessage.addListener.mock.calls[0][0];
      
      const sendResponse = jest.fn();
      
      // Send invalid message
      messageHandler(null, {}, sendResponse);
      
      expect(sendResponse).toHaveBeenCalledWith({ result: "refreshMenus did nothing" });
    });

    it('should handle message handler exceptions', async () => {
      mockChrome.storage.sync.get.mockImplementation(() => {
        throw new Error('Storage access failed');
      });
      
      await import('../../src/background.js');
      const messageHandler = mockChrome.runtime.onMessage.addListener.mock.calls[0][0];
      
      const sendResponse = jest.fn();
      
      await expect(async () => {
        messageHandler({ refresh: true }, {}, sendResponse);
        await new Promise(resolve => setTimeout(resolve, 0));
      }).not.toThrow();
    });
  });

  describe('Internationalization Errors', () => {
    it('should handle missing i18n messages gracefully', async () => {
      mockChrome.i18n.getMessage.mockReturnValue('');
      global.navigator.clipboard = {
        writeText: jest.fn().mockResolvedValue()
      };
      
      await Copy('copyUrl', true);
      
      // Should still show notification with fallback text
      expect(global.document.createElement).toHaveBeenCalledWith('div');
    });

    it('should handle i18n API unavailability', async () => {
      global.chrome = { ...mockChrome };
      delete global.chrome.i18n;
      
      global.navigator.clipboard = {
        writeText: jest.fn().mockResolvedValue()
      };
      
      await Copy('copyUrl', true);
      
      // Should work without i18n
      expect(global.document.createElement).toHaveBeenCalledWith('div');
    });

    it('should handle i18n.getMessage throwing errors', async () => {
      mockChrome.i18n.getMessage.mockImplementation(() => {
        throw new Error('i18n service unavailable');
      });
      
      global.navigator.clipboard = {
        writeText: jest.fn().mockResolvedValue()
      };
      
      await Copy('copyUrl', true);
      
      // Should fallback gracefully
      expect(global.document.createElement).toHaveBeenCalledWith('div');
    });
  });

  describe('Cross-Browser Compatibility Errors', () => {
    it('should handle Firefox-specific clipboard errors', async () => {
      global.navigator.clipboard = {
        writeText: jest.fn().mockRejectedValue(
          new Error('clipboard.writeText is not a function')
        )
      };
      global.document.execCommand.mockReturnValue(true);
      
      await Copy('copyUrl');
      
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('should handle Safari-specific API limitations', async () => {
      // Safari doesn't support ClipboardItem in some contexts
      global.ClipboardItem = undefined;
      global.navigator.clipboard = {
        write: jest.fn().mockRejectedValue(
          new Error('ClipboardItem is not defined')
        )
      };
      global.document.execCommand.mockReturnValue(true);
      
      await Copy('copyRichLink');
      
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('should handle Edge-specific execution context errors', async () => {
      mockChrome.scripting.executeScript.mockRejectedValue(
        new Error('Script execution context is invalid')
      );
      
      await import('../../src/background.js');
      const clickHandler = mockChrome.contextMenus.onClicked.addListener.mock.calls[0][0];
      
      const info = { menuItemId: 'copyRichLink' };
      const tab = { id: 123, url: 'https://example.com' };
      
      await expect(async () => {
        clickHandler(info, tab);
        await new Promise(resolve => setTimeout(resolve, 0));
      }).not.toThrow();
      
      expect(global.console.error).toHaveBeenCalledWith(
        'An unexpected error occurred during script execution:', 
        expect.any(Error)
      );
    });
  });

  describe('Network and Connectivity Errors', () => {
    it('should handle storage sync failures due to network issues', async () => {
      mockChrome.storage.sync.get.mockRejectedValue(
        new Error('Network error: fetch failed')
      );
      
      const { initializeMenus } = await import('../../src/background.js');
      
      await expect(initializeMenus()).rejects.toThrow('Network error: fetch failed');
    });

    it('should handle storage sync timeout errors', async () => {
      mockChrome.storage.sync.set.mockRejectedValue(
        new Error('Operation timeout')
      );
      
      await expect(
        mockChrome.storage.sync.set({ test: 'data' })
      ).rejects.toThrow('Operation timeout');
    });
  });
});