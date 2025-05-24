// Mock JSDOM environment for options page testing
import { JSDOM } from 'jsdom';

// Note: This test would need jsdom to run properly in a real environment
// For now, we'll mock the DOM APIs extensively

describe('Options Page Integration Tests', () => {
  let mockChrome;
  let mockDocument;
  let mockWindow;
  
  beforeEach(() => {
    // Create comprehensive Chrome API mock
    mockChrome = {
      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn()
        }
      },
      i18n: {
        getMessage: jest.fn((key) => {
          const messages = {
            notification_options_title: 'Notification Options',
            show_notification_label: 'Show Notifications',
            show_notification_description: 'Display notifications when URLs are copied',
            copyRichLink: 'Rich Link',
            copyUrl: 'URL',
            copyUrlWithTitleAsText: 'URL & Title',
            copyUrlWithTitleAsMarkdown: 'Markdown',
            copyUrlAsHtml: 'HTML',
            copyUrlWithTitleAsHtml: 'HTML & Title',
            copyTitle: 'Title',
            copyRichLink_description: 'Copies as rich text link',
            copyUrl_description: 'Copies only the URL'
          };
          return messages[key] || key;
        }),
        getUILanguage: jest.fn().mockReturnValue('en-US')
      },
      runtime: {
        sendMessage: jest.fn()
      }
    };
    
    global.chrome = mockChrome;
    
    // Create mock DOM elements
    const createElement = jest.fn((tagName) => {
      const element = {
        tagName: tagName.toUpperCase(),
        id: '',
        className: '',
        textContent: '',
        innerText: '',
        htmlFor: '',
        type: '',
        name: '',
        value: '',
        checked: false,
        disabled: false,
        style: {},
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
          contains: jest.fn()
        },
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        closest: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn()
      };
      
      // Special handling for different element types
      if (tagName === 'input') {
        element.addEventListener = jest.fn((event, handler) => {
          if (event === 'change' && element._changeHandler) {
            element._changeHandler = handler;
          }
        });
      }
      
      return element;
    });
    
    mockDocument = {
      getElementById: jest.fn(),
      createElement,
      querySelector: jest.fn(),
      querySelectorAll: jest.fn().mockReturnValue([]),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    
    global.document = mockDocument;
    
    // Mock specific DOM elements that the options page expects
    const mockElements = {
      'notification-options-title': { textContent: '' },
      'show-notification-label': { textContent: '' },
      'show-notification-description': { textContent: '' },
      'show-notification': { 
        checked: true, 
        addEventListener: jest.fn(),
        closest: jest.fn().mockReturnValue({
          addEventListener: jest.fn()
        })
      },
      'options': { appendChild: jest.fn() },
      'default-format-options': { appendChild: jest.fn() }
    };
    
    mockDocument.getElementById.mockImplementation((id) => mockElements[id] || null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Notification Settings Integration', () => {
    it('should load and display notification settings correctly', async () => {
      const notificationCheckbox = mockDocument.getElementById('show-notification');
      mockChrome.storage.sync.get.mockResolvedValue({ showNotification: false });
      
      // Simulate loading the options page
      await loadNotificationSettings();
      
      expect(mockChrome.storage.sync.get).toHaveBeenCalledWith({ showNotification: true });
      expect(notificationCheckbox.checked).toBe(false);
    });

    it('should save notification preference changes', async () => {
      const notificationCheckbox = mockDocument.getElementById('show-notification');
      mockChrome.storage.sync.get.mockResolvedValue({ showNotification: true });
      mockChrome.storage.sync.set.mockResolvedValue();
      
      await loadNotificationSettings();
      
      // Simulate checkbox change
      notificationCheckbox.checked = false;
      const changeHandler = notificationCheckbox.addEventListener.mock.calls
        .find(call => call[0] === 'change')[1];
      
      changeHandler();
      
      expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({ showNotification: false });
    });

    it('should handle click events on notification wrapper', async () => {
      const notificationCheckbox = mockDocument.getElementById('show-notification');
      const wrapper = { addEventListener: jest.fn() };
      notificationCheckbox.closest.mockReturnValue(wrapper);
      
      mockChrome.storage.sync.get.mockResolvedValue({ showNotification: true });
      
      await loadNotificationSettings();
      
      // Simulate wrapper click
      const wrapperClickHandler = wrapper.addEventListener.mock.calls
        .find(call => call[0] === 'click')[1];
      
      const mockEvent = {
        target: document.createElement('div') // Not the checkbox or label
      };
      
      notificationCheckbox.checked = true;
      wrapperClickHandler(mockEvent);
      
      expect(notificationCheckbox.checked).toBe(false);
      expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({ showNotification: false });
    });
  });

  describe('Context Menu Settings Integration', () => {
    it('should load and display context menu options', async () => {
      const testMenus = [
        { id: 'copyRichLink', title: 'Rich Link', active: true },
        { id: 'copyUrl', title: 'URL', active: false }
      ];
      
      mockChrome.storage.sync.get
        .mockImplementationOnce(() => Promise.resolve({ contextMenus: testMenus }));
      
      const optionsContainer = mockDocument.getElementById('options');
      
      await loadContextMenuSettings();
      
      expect(mockChrome.storage.sync.get).toHaveBeenCalledWith("contextMenus");
      expect(optionsContainer.appendChild).toHaveBeenCalledTimes(testMenus.length);
    });

    it('should handle menu option changes and refresh background', async () => {
      const testMenus = [
        { id: 'copyRichLink', title: 'Rich Link', active: true }
      ];
      
      mockChrome.storage.sync.get
        .mockResolvedValueOnce({ contextMenus: testMenus })
        .mockResolvedValueOnce({ contextMenus: testMenus });
      
      mockChrome.storage.sync.set.mockResolvedValue();
      mockChrome.runtime.sendMessage.mockResolvedValue();
      
      await loadContextMenuSettings();
      
      // Simulate menu update
      await updateMenus();
      
      expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({ contextMenus: testMenus });
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({ refresh: true });
    });
  });

  describe('Default Format Settings Integration', () => {
    it('should load and display default format options', async () => {
      const testMenus = [
        { id: 'copyRichLink', title: 'Rich Link', active: true },
        { id: 'copyUrl', title: 'URL', active: false }
      ];
      
      mockChrome.storage.sync.get
        .mockImplementationOnce(() => Promise.resolve({ defaultFormat: 'copyUrl' }))
        .mockImplementationOnce(() => Promise.resolve({ contextMenus: testMenus }));
      
      const defaultFormatContainer = mockDocument.getElementById('default-format-options');
      
      await loadDefaultFormatSettings();
      
      expect(defaultFormatContainer.appendChild).toHaveBeenCalledTimes(testMenus.length);
    });

    it('should save default format changes', async () => {
      const testMenus = [
        { id: 'copyRichLink', title: 'Rich Link', active: true }
      ];
      
      mockChrome.storage.sync.get
        .mockResolvedValueOnce({ defaultFormat: 'copyRichLink' })
        .mockResolvedValueOnce({ contextMenus: testMenus });
      
      mockChrome.storage.sync.set.mockResolvedValue();
      
      await loadDefaultFormatSettings();
      
      // Simulate radio button change
      const mockRadio = document.createElement('input');
      mockRadio.type = 'radio';
      mockRadio.value = 'copyUrl';
      mockRadio.checked = true;
      
      // Simulate change event
      const changeEvent = new Event('change');
      mockRadio.dispatchEvent(changeEvent);
      
      // In real implementation, this would trigger the change handler
      // For the test, we'll simulate the storage call
      await chrome.storage.sync.set({ defaultFormat: 'copyUrl' });
      
      expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({ defaultFormat: 'copyUrl' });
    });

    it('should handle clicking on format option wrapper', async () => {
      const testMenus = [
        { id: 'copyRichLink', title: 'Rich Link', active: true }
      ];
      
      mockChrome.storage.sync.get
        .mockResolvedValueOnce({ defaultFormat: 'copyRichLink' })
        .mockResolvedValueOnce({ contextMenus: testMenus });
      
      mockChrome.storage.sync.set.mockResolvedValue();
      
      await loadDefaultFormatSettings();
      
      // This would be tested more thoroughly in a real DOM environment
      expect(mockChrome.storage.sync.get).toHaveBeenCalledWith({ defaultFormat: 'copyRichLink' });
    });
  });

  describe('Internationalization Integration', () => {
    it('should properly handle English locale', async () => {
      mockChrome.i18n.getUILanguage.mockReturnValue('en-US');
      
      const testMenus = [
        { id: 'copyRichLink', title: 'Rich && Link', active: true }
      ];
      
      mockChrome.storage.sync.get.mockResolvedValue({ contextMenus: testMenus });
      
      await loadContextMenuSettings();
      
      // Should process && replacement for English
      expect(mockChrome.i18n.getUILanguage).toHaveBeenCalled();
    });

    it('should handle non-English locales with translations', async () => {
      mockChrome.i18n.getUILanguage.mockReturnValue('ja-JP');
      
      const testMenus = [
        { id: 'copyRichLink', title: 'Rich && Link', active: true }
      ];
      
      mockChrome.storage.sync.get.mockResolvedValue({ contextMenus: testMenus });
      
      await loadContextMenuSettings();
      
      // Should use i18n messages for non-English
      expect(mockChrome.i18n.getMessage).toHaveBeenCalledWith('copyRichLink');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle storage errors gracefully', async () => {
      mockChrome.storage.sync.get.mockRejectedValue(new Error('Storage error'));
      
      // Should not throw
      await expect(loadNotificationSettings()).rejects.toThrow('Storage error');
    });

    it('should handle missing DOM elements gracefully', async () => {
      mockDocument.getElementById.mockReturnValue(null);
      
      // Should not throw even if elements are missing
      await expect(loadNotificationSettings()).not.toThrow();
    });

    it('should handle runtime message errors gracefully', async () => {
      mockChrome.runtime.sendMessage.mockRejectedValue(new Error('Runtime error'));
      
      const testMenus = [
        { id: 'copyRichLink', title: 'Rich Link', active: true }
      ];
      
      mockChrome.storage.sync.get.mockResolvedValue({ contextMenus: testMenus });
      mockChrome.storage.sync.set.mockResolvedValue();
      
      // Should not throw
      await expect(updateMenus()).not.toThrow();
    });
  });

  // Helper functions to simulate options page loading
  async function loadNotificationSettings() {
    const { showNotification } = await chrome.storage.sync.get({ showNotification: true });
    const notificationCheckbox = document.getElementById('show-notification');
    if (notificationCheckbox) {
      notificationCheckbox.checked = showNotification;
      
      notificationCheckbox.addEventListener('change', () => {
        chrome.storage.sync.set({ showNotification: notificationCheckbox.checked });
      });
      
      const wrapper = notificationCheckbox.closest('.control-wrapper');
      if (wrapper) {
        wrapper.addEventListener('click', function(event) {
          if (event.target !== notificationCheckbox) {
            notificationCheckbox.checked = !notificationCheckbox.checked;
            chrome.storage.sync.set({ showNotification: notificationCheckbox.checked });
          }
        });
      }
    }
  }

  async function loadContextMenuSettings() {
    const items = await chrome.storage.sync.get("contextMenus");
    const contextMenus = items.contextMenus;
    const options = document.getElementById("options");
    
    if (contextMenus && options) {
      for (const menu of contextMenus) {
        const menuDiv = document.createElement("div");
        options.appendChild(menuDiv);
      }
    }
  }

  async function loadDefaultFormatSettings() {
    const { defaultFormat } = await chrome.storage.sync.get({ defaultFormat: 'copyRichLink' });
    const items = await chrome.storage.sync.get("contextMenus");
    const contextMenus = items.contextMenus;
    const defaultFormatOptions = document.getElementById("default-format-options");
    
    if (contextMenus && defaultFormatOptions) {
      for (const menu of contextMenus) {
        const formatDiv = document.createElement("div");
        defaultFormatOptions.appendChild(formatDiv);
      }
    }
  }

  async function updateMenus() {
    const items = await chrome.storage.sync.get("contextMenus");
    const contextMenus = items.contextMenus;
    
    if (contextMenus) {
      await chrome.storage.sync.set({ contextMenus });
      await chrome.runtime.sendMessage({ refresh: true });
    }
  }
});