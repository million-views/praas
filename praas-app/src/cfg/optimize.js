const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const uglifyOptions = {
  output: {
    comments: false
  },
  compress: {
    unused: true,
    warnings: false,
    comparisons: true,
    conditionals: true,
    negate_iife: false, // <- for `LazyParseWebpackPlugin()`
    dead_code: true,
    if_return: true,
    join_vars: true,
    evaluate: true,
  },
  screw_ie8: true,
  ecma: 6,
  mangle: true
};

/**
 *
 * @param {wpc} weppack based project configuration
 *
 * Module that does last in the pipeline optimizations to reduce size
 */
module.exports = (wpc) => {
  const plugins = [];

  if (wpc.isProd) {
    plugins.push(
      new UglifyJsPlugin({ uglifyOptions })
    );
    plugins.push(
      new OptimizeCSSAssetsPlugin()
    );
  }

  return {
    optimization: {
      minimizer: plugins
    }
  };
};
