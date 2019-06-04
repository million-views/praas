/* eslint: import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const webpack = require('webpack');

module.exports = (wpc) => {
  const plugins = [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
  ];

  return {
    devServer: {
      host: wpc.host,
      port: wpc.port,
      contentBase: wpc.build,
      inline: true,
      stats: 'errors-only',
      hot: true,
      historyApiFallback: true
    },
    plugins
  };
};
