/* eslint: import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const webpack = require('webpack');

module.exports = (wpc) => {
  const plugins = [
    new webpack.HotModuleReplacementPlugin(),
  ];

  return {
    devServer: {
      host: wpc.host,
      port: wpc.port,
      contentBase: wpc.build,
      inline: true,
      stats: 'errors-only',
      hot: true,
      historyApiFallback: true,
      disableHostCheck: true,
      proxy: [{
        context: ['/user', '/users', '/conduits'],
        target: 'http://localhost:4000',
      }]
    },
    plugins
  };
};
