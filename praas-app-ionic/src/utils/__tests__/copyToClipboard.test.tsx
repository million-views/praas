import copyToClipboard from '../copyToClipboard';

describe('copyToClipboard', () => {
  it('copies the text to clipboard', () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: () => {},
      },
    });
    jest.spyOn(navigator.clipboard, 'writeText');
    copyToClipboard('text');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('text');
  });
});
