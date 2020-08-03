const UglifyJs = require('uglifyjs-webpack-plugin');
const TerserJs = require('terser-webpack-plugin');
const OptimizeCSSAssets = require('optimize-css-assets-webpack-plugin');

const uglifyOptions = {
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
  ecma: 6,
  mangle: true
};

module.exports = (wpc) => {
  const plugins = [];

  if (wpc.isProd) {
    plugins.push(
      new UglifyJs({ test: /\.js(\?.*)?$/i, uglifyOptions })
    );
    plugins.push(
      new TerserJs({})
    );
    plugins.push(
      new OptimizeCSSAssets({})
    );
  }

  return {
    optimization: {
      minimizer: plugins
    }
  };
};
