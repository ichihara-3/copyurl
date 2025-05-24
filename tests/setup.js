// Enhanced DOM stubs for integration tests
global.document = {
  title: 'Example',
  createElement: (tag) => {
    const element = {
      tagName: tag.toUpperCase(),
      id: '',
      className: '',
      style: {},
      href: '',
      innerText: '',
      textContent: '',
      setAttribute: jest.fn(),
      getAttribute: jest.fn(),
      append: jest.fn(),
      appendChild: jest.fn(),
      remove: jest.fn(),
      select: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      closest: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn().mockReturnValue([]),
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn()
      }
    };
    
    // Dynamic outerHTML generation
    Object.defineProperty(element, 'outerHTML', {
      get() {
        const attrs = this.href ? ` href="${this.href}"` : '';
        const content = this.innerText || this.textContent || '';
        return `<${tag}${attrs}>${content}</${tag}>`;
      }
    });
    
    return element;
  },
  body: {
    append: jest.fn(),
    appendChild: jest.fn(),
    removeChild: jest.fn(),
  },
  getElementById: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn().mockReturnValue([]),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  execCommand: jest.fn().mockReturnValue(true),
};

global.location = { href: 'https://example.com' };

global.navigator = {
  clipboard: {
    writeText: jest.fn(),
    write: jest.fn(),
    read: jest.fn(),
    readText: jest.fn()
  }
};

// Enhanced Blob mock
global.Blob = global.Blob || function(parts, options) { 
  this.parts = parts; 
  this.type = options?.type || 'text/plain';
  this.size = parts.reduce((size, part) => size + (part.length || 0), 0);
};

// Enhanced ClipboardItem mock
global.ClipboardItem = global.ClipboardItem || function(items) { 
  this.items = items;
  this.types = Object.keys(items);
  this.getType = jest.fn((type) => Promise.resolve(items[type]));
};

// Chrome extension API mock base
global.chrome = {
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn(),
    },
    onChanged: {
      addListener: jest.fn()
    }
  },
  runtime: {
    onInstalled: { addListener: jest.fn() },
    onStartup: { addListener: jest.fn() },
    onMessage: { addListener: jest.fn() },
    sendMessage: jest.fn()
  },
  contextMenus: {
    create: jest.fn(),
    update: jest.fn(),
    onClicked: { addListener: jest.fn() }
  },
  action: {
    onClicked: { addListener: jest.fn() }
  },
  scripting: {
    executeScript: jest.fn()
  },
  i18n: {
    getMessage: jest.fn(),
    getUILanguage: jest.fn().mockReturnValue('en-US')
  }
};

// Global console mock
global.console = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

// Timeout functions for async testing
global.setTimeout = jest.fn((callback, delay) => {
  if (typeof callback === 'function') {
    return setTimeout(callback, delay);
  }
  return 1;
});

global.clearTimeout = jest.fn();

// Event constructor mock
global.Event = function(type, options) {
  this.type = type;
  this.bubbles = options?.bubbles || false;
  this.cancelable = options?.cancelable || false;
  this.target = null;
  this.currentTarget = null;
  this.preventDefault = jest.fn();
  this.stopPropagation = jest.fn();
};
