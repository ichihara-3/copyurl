import { Copy } from '../src/modules/background/Copy.js';

describe('Copy fallback', () => {
  beforeEach(() => {
    navigator.clipboard = {
      writeText: jest.fn().mockRejectedValue(new Error('fail')),
    };
    document.execCommand = jest.fn().mockReturnValue(true);
  });

  test('falls back to execCommand when clipboard write fails', async () => {
    await Copy('copyUrl');
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });
});

describe('Copy input sanitization', () => {
  beforeEach(() => {
    navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(),
    };
    document.execCommand = jest.fn().mockReturnValue(true);
    // Reset document and location to clean values
    document.title = 'Clean Title';
    location.href = 'https://example.com';
  });

  test('sanitizes malicious title with control characters', async () => {
    document.title = 'Title\x00\x01\x02with\x1F\x7F\x9Fcontrol\x0Achars';
    await Copy('copyTitle');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Titlewithcontrolchars');
  });

  test('sanitizes extremely long title', async () => {
    document.title = 'A'.repeat(2000);
    await Copy('copyTitle');
    const calledWith = navigator.clipboard.writeText.mock.calls[0][0];
    expect(calledWith.length).toBeLessThanOrEqual(1000);
  });

  test('sanitizes malicious URL with javascript protocol', async () => {
    location.href = 'javascript:alert("xss")';
    await Copy('copyUrl');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('');
  });

  test('allows valid HTTP URLs', async () => {
    location.href = 'https://valid.example.com/path?param=value';
    await Copy('copyUrl');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://valid.example.com/path?param=value');
  });

  test('allows valid HTTPS URLs', async () => {
    location.href = 'http://example.com';
    await Copy('copyUrl');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://example.com/');
  });

  test('allows file URLs', async () => {
    location.href = 'file:///path/to/file.html';
    await Copy('copyUrl');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('file:///path/to/file.html');
  });

  test('rejects data URLs', async () => {
    location.href = 'data:text/html,<script>alert("xss")</script>';
    await Copy('copyUrl');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('');
  });

  test('sanitizes both title and URL in markdown format', async () => {
    document.title = 'Title\x00with\x01control';
    location.href = 'javascript:alert("xss")';
    await Copy('copyUrlWithTitleAsMarkdown');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('[Titlewithcontrol]()');
  });

  test('sanitizes both title and URL in text format', async () => {
    document.title = 'Clean Title';
    location.href = 'https://example.com';
    await Copy('copyUrlWithTitleAsText');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Clean Title | https://example.com/');
  });

  test('handles non-string title input', async () => {
    document.title = null;
    await Copy('copyTitle');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('');
  });

  test('handles non-string URL input', async () => {
    location.href = undefined;
    await Copy('copyUrl');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('');
  });
});
