// Minimal DOM stubs for tests
global.document = {
  title: 'Example',
  createElement: (tag) => {
    return {
      tagName: tag.toUpperCase(),
      style: {},
      setAttribute: jest.fn(),
      append: jest.fn(),
      appendChild: jest.fn(),
      remove: jest.fn(),
      select: jest.fn(),
      innerText: '',
      textContent: '',
      outerHTML: `<${tag}></${tag}>`,
    };
  },
  body: {
    append: jest.fn(),
    appendChild: jest.fn(),
    removeChild: jest.fn(),
  },
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  execCommand: jest.fn(),
};

global.location = { href: 'https://example.com' };

global.navigator = {};

global.Blob = global.Blob || function(parts, options) { this.parts = parts; this.type = options.type; };

global.ClipboardItem = global.ClipboardItem || function(items) { this.items = items; };
