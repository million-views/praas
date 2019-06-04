module.exports = (wpc) => {
  const test = /\.jsx?$/;
  const exclude = /(node_modules|bower_components)/;
  const babel = require('./babel.config')(wpc);

  const loaders = [
    {
      loader: 'babel-loader',
      options: { presets: babel.presets, plugins: babel.plugins }
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
