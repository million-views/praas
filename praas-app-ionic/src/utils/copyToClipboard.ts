const copyToClipboard = (url: string) => {
  navigator.clipboard.writeText(url);
};

export default copyToClipboard;
