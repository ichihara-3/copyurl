import { Copy } from '../../src/modules/background/Copy.js';

describe('Cross-Browser Compatibility Integration Tests', () => {
  let originalNavigator;
  let originalDocument;
  let originalChrome;
  
  beforeEach(() => {
    originalNavigator = global.navigator;
    originalDocument = global.document;
    originalChrome = global.chrome;
    
    // Base mock setup
    global.console = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };
    
    global.location = { href: 'https://example.com/test' };
    global.Blob = jest.fn((parts, options) => ({ parts, type: options?.type }));
    global.ClipboardItem = jest.fn((items) => ({ items }));
  });

  afterEach(() => {
    global.navigator = originalNavigator;
    global.document = originalDocument;
    global.chrome = originalChrome;
    jest.clearAllMocks();
  });

  describe('Chrome Browser Compatibility', () => {
    beforeEach(() => {
      setupChromeEnvironment();
    });

    it('should work with full Chrome Clipboard API support', async () => {
      global.navigator.clipboard = {
        writeText: jest.fn().mockResolvedValue(),
        write: jest.fn().mockResolvedValue()
      };
      
      await Copy('copyUrl');
      expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/test');
      
      await Copy('copyRichLink');
      expect(global.navigator.clipboard.write).toHaveBeenCalled();
    });

    it('should handle Chrome permissions-restricted contexts', async () => {
      global.navigator.clipboard = {
        writeText: jest.fn().mockRejectedValue(new Error('NotAllowedError: Write permission denied')),
        write: jest.fn().mockRejectedValue(new Error('NotAllowedError: Write permission denied'))
      };
      global.document.execCommand.mockReturnValue(true);
      
      await Copy('copyUrl');
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
      
      await Copy('copyRichLink');
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('should work in Chrome extension context', async () => {
      global.chrome = {
        i18n: {
          getMessage: jest.fn().mockReturnValue('Copied!')
        }
      };
      global.navigator.clipboard = {
        writeText: jest.fn().mockResolvedValue()
      };
      
      await Copy('copyUrl', true);
      
      expect(global.chrome.i18n.getMessage).toHaveBeenCalledWith('notification_copied');
      expect(global.document.createElement).toHaveBeenCalledWith('div');
    });
  });

  describe('Firefox Browser Compatibility', () => {
    beforeEach(() => {
      setupFirefoxEnvironment();
    });

    it('should work with Firefox Clipboard API limitations', async () => {
      // Firefox may not support clipboard.write in some contexts
      global.navigator.clipboard = {
        writeText: jest.fn().mockResolvedValue()
        // No write method
      };
      global.document.execCommand.mockReturnValue(true);
      
      await Copy('copyRichLink');
      
      // Should fall back to execCommand for rich links
      expect(global.document.addEventListener).toHaveBeenCalledWith(
        'copy', expect.any(Function), { passive: false }
      );
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('should handle Firefox-specific user gesture requirements', async () => {
      global.navigator.clipboard = {
        writeText: jest.fn().mockRejectedValue(
          new Error('clipboard.writeText requires a user gesture')
        )
      };
      global.document.execCommand.mockReturnValue(true);
      
      await Copy('copyUrl');
      
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('should work with Firefox extension API differences', async () => {
      // Firefox uses browser.* APIs, but we're testing the Chrome API compatibility
      global.chrome = undefined;
      global.navigator.clipboard = {
        writeText: jest.fn().mockResolvedValue()
      };
      
      await Copy('copyUrl', true);
      
      // Should work without chrome.i18n
      expect(global.document.createElement).toHaveBeenCalledWith('div');
    });
  });

  describe('Safari Browser Compatibility', () => {
    beforeEach(() => {
      setupSafariEnvironment();
    });

    it('should work with Safari Clipboard API limitations', async () => {
      // Safari has limited clipboard support
      global.navigator.clipboard = {
        writeText: jest.fn().mockResolvedValue()
        // No write method or limited write support
      };
      
      await Copy('copyRichLink');
      
      // Should fall back gracefully
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('should handle Safari ClipboardItem constructor unavailability', async () => {
      global.ClipboardItem = undefined;
      global.navigator.clipboard = {
        write: jest.fn().mockRejectedValue(new Error('ClipboardItem is not defined'))
      };
      global.document.execCommand.mockReturnValue(true);
      
      await Copy('copyRichLink');
      
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('should work with Safari strict security policies', async () => {
      global.navigator.clipboard = {
        writeText: jest.fn().mockRejectedValue(
          new Error('The request is not allowed by the user agent')
        )
      };
      global.document.execCommand.mockReturnValue(true);
      
      await Copy('copyUrl');
      
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
    });
  });

  describe('Edge Browser Compatibility', () => {
    beforeEach(() => {
      setupEdgeEnvironment();
    });

    it('should work with Edge Clipboard API support', async () => {
      global.navigator.clipboard = {
        writeText: jest.fn().mockResolvedValue(),
        write: jest.fn().mockResolvedValue()
      };
      
      await Copy('copyRichLink');
      
      expect(global.navigator.clipboard.write).toHaveBeenCalled();
      expect(global.ClipboardItem).toHaveBeenCalled();
    });

    it('should handle Edge legacy execCommand support', async () => {
      global.navigator.clipboard = undefined;
      global.document.execCommand.mockReturnValue(true);
      
      await Copy('copyUrl');
      
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('should work with Edge Chromium base', async () => {
      // Edge Chromium should behave like Chrome
      global.chrome = {
        i18n: {
          getMessage: jest.fn().mockReturnValue('Copied!')
        }
      };
      global.navigator.clipboard = {
        writeText: jest.fn().mockResolvedValue()
      };
      
      await Copy('copyUrl', true);
      
      expect(global.chrome.i18n.getMessage).toHaveBeenCalled();
    });
  });

  describe('Mobile Browser Compatibility', () => {
    it('should handle mobile Chrome limitations', async () => {
      setupMobileEnvironment();
      
      // Mobile may have different clipboard behavior
      global.navigator.clipboard = {
        writeText: jest.fn().mockRejectedValue(
          new Error('Clipboard access restricted on mobile')
        )
      };
      global.document.execCommand.mockReturnValue(false); // May not work on mobile
      
      await Copy('copyUrl');
      
      // Should attempt both methods
      expect(global.navigator.clipboard.writeText).toHaveBeenCalled();
      expect(global.document.execCommand).toHaveBeenCalled();
    });

    it('should handle iOS Safari restrictions', async () => {
      setupiOSSafariEnvironment();
      
      global.navigator.clipboard = undefined; // Often unavailable
      global.document.execCommand.mockReturnValue(true);
      
      await Copy('copyUrl');
      
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('should handle Android Chrome restrictions', async () => {
      setupAndroidChromeEnvironment();
      
      global.navigator.clipboard = {
        writeText: jest.fn().mockRejectedValue(
          new Error('Clipboard requires secure context')
        )
      };
      global.document.execCommand.mockReturnValue(true);
      
      await Copy('copyUrl');
      
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
    });
  });

  describe('Legacy Browser Support', () => {
    it('should work with browsers without Clipboard API', async () => {
      global.navigator = {}; // No clipboard property
      global.document.execCommand.mockReturnValue(true);
      
      await Copy('copyUrl');
      
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
      expect(global.document.createElement).toHaveBeenCalledWith('textArea');
    });

    it('should work with browsers without Promise support for clipboard', async () => {
      global.navigator.clipboard = {
        writeText: function(text) {
          // Non-promise version (shouldn't exist, but testing)
          return undefined;
        }
      };
      global.document.execCommand.mockReturnValue(true);
      
      await Copy('copyUrl');
      
      // Should fall back to execCommand
      expect(global.document.execCommand).toHaveBeenCalled();
    });

    it('should handle missing modern DOM methods', async () => {
      // Remove modern methods
      global.document.createElement = jest.fn((tag) => {
        const element = {
          tagName: tag.toUpperCase(),
          style: {},
          textContent: '',
          select: jest.fn(),
          remove: jest.fn()
        };
        
        // No appendChild, use old methods
        element.removeNode = jest.fn();
        return element;
      });
      
      global.document.body = {
        insertBefore: jest.fn(),
        removeChild: jest.fn()
      };
      
      global.navigator = {};
      global.document.execCommand.mockReturnValue(true);
      
      await Copy('copyUrl');
      
      expect(global.document.execCommand).toHaveBeenCalledWith('copy');
    });
  });

  describe('Extension Context Compatibility', () => {
    it('should work in content script context', async () => {
      // Content script environment
      global.chrome = {
        i18n: {
          getMessage: jest.fn().mockReturnValue('Copied!')
        }
      };
      global.navigator.clipboard = {
        writeText: jest.fn().mockResolvedValue()
      };
      
      await Copy('copyUrl', true);
      
      expect(global.navigator.clipboard.writeText).toHaveBeenCalled();
      expect(global.chrome.i18n.getMessage).toHaveBeenCalled();
    });

    it('should work in popup context', async () => {
      global.chrome = {
        i18n: {
          getMessage: jest.fn().mockReturnValue('Copied!')
        }
      };
      global.navigator.clipboard = {
        writeText: jest.fn().mockResolvedValue()
      };
      
      await Copy('copyUrl', false); // No notification in popup
      
      expect(global.navigator.clipboard.writeText).toHaveBeenCalled();
      // Should not create notification div
      const createElementCalls = global.document.createElement.mock.calls;
      const notificationCreated = createElementCalls.some(call => call[0] === 'div');
      expect(notificationCreated).toBe(false);
    });

    it('should work in options page context', async () => {
      global.chrome = {
        i18n: {
          getMessage: jest.fn().mockReturnValue('Copied!')
        }
      };
      global.navigator.clipboard = {
        writeText: jest.fn().mockResolvedValue()
      };
      
      await Copy('copyUrl', true);
      
      expect(global.navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  // Helper functions to set up different browser environments
  function setupChromeEnvironment() {
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
      execCommand: jest.fn().mockReturnValue(true)
    };
    
    global.chrome = {
      i18n: {
        getMessage: jest.fn().mockReturnValue('Copied!')
      }
    };
  }

  function setupFirefoxEnvironment() {
    setupChromeEnvironment(); // Similar base
    
    // Firefox-specific differences
    global.document.execCommand = jest.fn().mockReturnValue(true);
  }

  function setupSafariEnvironment() {
    setupChromeEnvironment(); // Similar base
    
    // Safari-specific limitations
    global.ClipboardItem = undefined;
  }

  function setupEdgeEnvironment() {
    setupChromeEnvironment(); // Similar to Chrome
  }

  function setupMobileEnvironment() {
    setupChromeEnvironment();
    
    // Mobile-specific limitations
    global.document.execCommand = jest.fn().mockReturnValue(false);
  }

  function setupiOSSafariEnvironment() {
    setupMobileEnvironment();
    
    // iOS Safari specific
    global.ClipboardItem = undefined;
  }

  function setupAndroidChromeEnvironment() {
    setupMobileEnvironment();
    
    // Android Chrome specific behavior
  }
});