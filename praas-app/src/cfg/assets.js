module.exports = (wpc) => {
  const test = /\.(woff|woff2|ttf|eot|svg)(\?[\s\S]+)?$/;
  const exclude = /(node_modules|bower_components)/;

  // url-loader builds on top of file-loader to optionally convert
  // assets into data url based on limit... TODO: needs more play time
  const loaders = [
    {
      loader: 'url-loader',
      options: {
        name: 'assets/fonts/[name].[ext]',
        // outputPath: 'assets/fonts',
        limit: wpc.options.inlineBelow
      }
    },
  ];

  const module = {
    rules: [
      {
        test, exclude, use: loaders
      },
    ]
  };

  return { module };
};
