const TerserJs = require('terser-webpack-plugin');
const OptimizeCSSAssets = require('optimize-css-assets-webpack-plugin');

const terserOptions = {
  warnings: false,
  output: {
    comments: false
  },
  compress: {
    unused: true,
    comparisons: true,
    conditionals: true,
    negate_iife: false, // <- for `LazyParseWebpackPlugin()`
    dead_code: true,
    if_return: true,
    join_vars: true,
    evaluate: true,
  },
  screw_ie8: true,
  ie8: false,
  ecma: 8,
  mangle: true,
  module: true,
  toplevel: true,
  drop_console: true,
  passes: 2,
};

module.exports = (wpc) => {
  const plugins = [];
  if (wpc.isProd) {
    plugins.push(
      new TerserJs({ terserOptions })
    );
    plugins.push(
      new OptimizeCSSAssets({})
    );
  }

  return {
    optimization: {
      minimize: (wpc.isProd === true),
      concatenateModules: (wpc.isProd === true),
      minimizer: plugins
    }
  };
};
