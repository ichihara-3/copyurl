import { Copy } from '../../src/modules/background/Copy.js';

describe('Clipboard Integration Tests', () => {
  let mockClipboard;
  let mockDocument;
  
  beforeEach(() => {
    // Mock navigator.clipboard with full API
    mockClipboard = {
      writeText: jest.fn(),
      write: jest.fn(),
      read: jest.fn(),
      readText: jest.fn()
    };
    global.navigator = { clipboard: mockClipboard };
    
    // Enhanced document mock for clipboard operations
    mockDocument = {
      title: 'Test Page Title',
      createElement: jest.fn((tag) => {
        const element = {
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
        };
        
        // Simulate outerHTML updates for anchor elements
        if (tag === 'a') {
          Object.defineProperty(element, 'outerHTML', {
            get() {
              const href = this.href ? ` href="${this.href}"` : '';
              const text = this.innerText || '';
              return `<a${href}>${text}</a>`;
            }
          });
        }
        
        return element;
      }),
      body: {
        append: jest.fn(),
        appendChild: jest.fn(),
        removeChild: jest.fn()
      },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      execCommand: jest.fn().mockReturnValue(true)
    };
    global.document = mockDocument;
    
    global.location = { href: 'https://example.com/test-page' };
    
    // Mock Blob and ClipboardItem for rich text operations
    global.Blob = jest.fn((parts, options) => ({
      parts,
      type: options?.type || 'text/plain'
    }));
    
    global.ClipboardItem = jest.fn((items) => ({ items }));
    
    // Mock chrome.i18n for notifications
    global.chrome = {
      i18n: {
        getMessage: jest.fn().mockReturnValue('Copied!')
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic URL Copying', () => {
    it('should copy URL using clipboard API', async () => {
      mockClipboard.writeText.mockResolvedValue();
      
      await Copy('copyUrl');
      
      expect(mockClipboard.writeText).toHaveBeenCalledWith('https://example.com/test-page');
    });

    it('should fallback to execCommand when clipboard API fails', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard API failed'));
      
      await Copy('copyUrl');
      
      expect(mockClipboard.writeText).toHaveBeenCalled();
      expect(mockDocument.createElement).toHaveBeenCalledWith('textArea');
      expect(mockDocument.execCommand).toHaveBeenCalledWith('copy');
    });
  });

  describe('URL with Title Copying', () => {
    it('should copy URL with title as text', async () => {
      mockClipboard.writeText.mockResolvedValue();
      
      await Copy('copyUrlWithTitleAsText');
      
      expect(mockClipboard.writeText).toHaveBeenCalledWith('Test Page Title | https://example.com/test-page');
    });

    it('should copy URL with title as markdown', async () => {
      mockClipboard.writeText.mockResolvedValue();
      
      await Copy('copyUrlWithTitleAsMarkdown');
      
      expect(mockClipboard.writeText).toHaveBeenCalledWith('[Test Page Title](https://example.com/test-page)');
    });
  });

  describe('HTML Copying', () => {
    it('should copy URL as HTML anchor', async () => {
      mockClipboard.writeText.mockResolvedValue();
      
      await Copy('copyUrlAsHtml');
      
      expect(mockClipboard.writeText).toHaveBeenCalledWith('<a href="https://example.com/test-page"></a>');
    });

    it('should copy URL with title as HTML anchor', async () => {
      mockClipboard.writeText.mockResolvedValue();
      
      await Copy('copyUrlWithTitleAsHtml');
      
      expect(mockClipboard.writeText).toHaveBeenCalledWith('<a href="https://example.com/test-page">Test Page Title</a>');
    });
  });

  describe('Rich Link Copying', () => {
    it('should copy rich link with HTML and text formats', async () => {
      mockClipboard.write.mockResolvedValue();
      
      await Copy('copyRichLink');
      
      expect(mockClipboard.write).toHaveBeenCalled();
      expect(global.Blob).toHaveBeenCalledWith(['<div><a href="https://example.com/test-page">Test Page Title</a></div>'], { type: "text/html" });
      expect(global.Blob).toHaveBeenCalledWith(['Test Page Title | https://example.com/test-page'], { type: "text/plain" });
      expect(global.ClipboardItem).toHaveBeenCalled();
    });

    it('should fallback to execCommand with clipboardData for rich links', async () => {
      mockClipboard.write.mockRejectedValue(new Error('Clipboard API failed'));
      
      await Copy('copyRichLink');
      
      expect(mockClipboard.write).toHaveBeenCalled();
      expect(mockDocument.addEventListener).toHaveBeenCalledWith('copy', expect.any(Function), { passive: false });
      expect(mockDocument.execCommand).toHaveBeenCalledWith('copy');
      expect(mockDocument.removeEventListener).toHaveBeenCalledWith('copy', expect.any(Function));
    });
  });

  describe('Title Copying', () => {
    it('should copy page title', async () => {
      mockClipboard.writeText.mockResolvedValue();
      
      await Copy('copyTitle');
      
      expect(mockClipboard.writeText).toHaveBeenCalledWith('Test Page Title');
    });
  });

  describe('Notification Handling', () => {
    it('should show notification when enabled', async () => {
      mockClipboard.writeText.mockResolvedValue();
      
      await Copy('copyUrl', true);
      
      expect(mockDocument.createElement).toHaveBeenCalledWith('div');
      expect(mockDocument.body.appendChild).toHaveBeenCalled();
    });

    it('should not show notification when disabled', async () => {
      mockClipboard.writeText.mockResolvedValue();
      
      await Copy('copyUrl', false);
      
      // Notification div should not be created when disabled
      const createElementCalls = mockDocument.createElement.mock.calls;
      const notificationDivCreated = createElementCalls.some(call => 
        call[0] === 'div' && call !== createElementCalls[0] // Exclude textArea creation
      );
      expect(notificationDivCreated).toBe(false);
    });

    it('should use i18n message for notification text', async () => {
      global.chrome.i18n.getMessage.mockReturnValue('コピーしました！');
      mockClipboard.writeText.mockResolvedValue();
      
      await Copy('copyUrl', true);
      
      expect(global.chrome.i18n.getMessage).toHaveBeenCalledWith('notification_copied');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle invalid task gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
      
      await Copy('invalidTask');
      
      expect(consoleSpy).toHaveBeenCalledWith('not implemented');
      consoleSpy.mockRestore();
    });

    it('should handle clipboard API and execCommand both failing', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard API failed'));
      mockDocument.execCommand.mockReturnValue(false);
      
      await Copy('copyUrl');
      
      expect(mockClipboard.writeText).toHaveBeenCalled();
      expect(mockDocument.execCommand).toHaveBeenCalled();
      // Should not throw error, should handle gracefully
    });

    it('should handle missing chrome.i18n gracefully', async () => {
      global.chrome = {}; // Remove i18n
      mockClipboard.writeText.mockResolvedValue();
      
      await Copy('copyUrl', true);
      
      // Should still work without i18n
      expect(mockClipboard.writeText).toHaveBeenCalled();
    });
  });

  describe('Cross-browser Compatibility', () => {
    it('should work when ClipboardItem is not available', async () => {
      global.ClipboardItem = undefined;
      mockClipboard.write.mockRejectedValue(new Error('ClipboardItem not supported'));
      
      await Copy('copyRichLink');
      
      // Should fall back to execCommand approach
      expect(mockDocument.execCommand).toHaveBeenCalledWith('copy');
    });

    it('should work when navigator.clipboard is not available', async () => {
      global.navigator = {}; // Remove clipboard
      
      await Copy('copyUrl');
      
      // Should fall back to execCommand
      expect(mockDocument.execCommand).toHaveBeenCalledWith('copy');
    });
  });
});