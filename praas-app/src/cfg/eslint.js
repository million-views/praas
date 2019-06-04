module.exports = (wpc) => {
  const test = /\.jsx?$/, exclude = /node_modules/;
  const rules = [{
    test, exclude, include: [wpc.app],
    // enables ESLint to run before anything else
    enforce: 'pre',
    use: [
      // eslint runs before babel
      {
        loader: 'eslint-loader',
      },
    ]
  }];

  return {
    module: { rules }
  };
};
