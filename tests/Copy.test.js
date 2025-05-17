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
