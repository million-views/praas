/**
 * Webpack configuration that is mostly common for both production and
 * development builds.
 */
const webpack = require('webpack');
const Analyze = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const Clean = require('clean-webpack-plugin');
const Copy = require('copy-webpack-plugin');
const HTML = require('html-webpack-plugin');

const AnalyzerOptions = {
  analyzerMode: 'static',
  openAnalyzer: false,
  reportFilename: 'bundle-analysis.html'
};

const HtmlOptions = {
  minify: {
    removeComments: true,
    collapseWhitespace: true,
    removeRedundantAttributes: true,
    useShortDoctype: true,
    removeEmptyAttributes: true,
    removeStyleLinkTypeAttributes: true,
    keepClosingSlash: true,
    minifyJS: true,
    minifyCSS: true,
    minifyURLs: true,
  },
  manifest: {
    // TODO: figure out a better a way to manage this
    theme_color: '#673AB8'
  }
};

// see https://webpack.js.org/configuration/ for bail
// see https://webpack.js.org/configuration/stats/ for stats

// function recursiveIssuer(m) {
//   if (m.issuer) {
//     return recursiveIssuer(m.issuer);
//   } else if (m.name) {
//     return m.name;
//   } else {
//     return false;
//   }
// }

/**
 *
 * @param {wpc} weppack based project configuration
 */
module.exports = (wpc) => {
  // v.a:
  // avoid relative path imports in children; use aliases to import
  // using absolute path relative to the project root.
  const alias = {
    // alias to api
    api: `${wpc.root}/api`,
    // alias to components
    components: `${wpc.app}/components`,
    // alias to store
    store: `${wpc.root}/store`,
    // we keep web assets here
    web: wpc.web,
    // we keep site wide css/scss frameworks here
    'site-css': `${wpc.lib}/site-css`,
    // we keep internal widgets and 3rd party libs here
    tiny: `${wpc.lib}/tiny`,
    // modal component
    modal: `${wpc.lib}/modal`,
  };

  const extensions = ['.jsx', '.js', '.json', '.scss', '.css', '.html'];

  return {
    mode: wpc.mode,
    bail: true, /* fail on first error instead of tolerating it */
    stats: {
      children: false
    },
    entry: {
      app: `${wpc.app}/main.js`,
      // local: `${wpc.app}`,
      // global: `${wpc.web}`,
    },
    output: {
      path: wpc.build,
      filename: '[name].[hash].js',
      publicPath: '/'
    },
    resolve: {
      extensions, alias
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        name: 'vendors',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10
          },
          // globalStyle: {
          //   test: (m, c, entry) => {
          //     ({ name, type, context, buildInfo, ...rest } = (c && c[0]) ? c[0] : {});
          //     console.log('global', m.constructor.name, typeof (c), name, rest);
          //     return (m.constructor.name !== 'CssModule' && recursiveIssuer(m) === entry);
          //   },
          //   name: 'site',
          //   chunks: 'all',
          //   enforce: false
          // },
          // extractAppStyle: {
          //   test: (m, c, entry) => {
          //     ({ name, type, context, buildInfo, ...rest } = (c && c[0]) ? c[0] : {});
          //     console.log('local', m.constructor.name, typeof (c), name, rest);
          //     return (m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry);
          //   },
          //   name: 'app',
          //   chunks: 'all',
          //   enforce: false
          // },
          default: {
            minChunks: 20,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      }
    },
    plugins: [
      new webpack.ProvidePlugin({ React: 'react' }),
      new Clean([wpc.build], { root: wpc.root, verbose: true, allowExternal: true }),
      new HTML({ template: `${wpc.web}/index.html`, ...HtmlOptions }),
      new Copy([{ context: wpc.web, from: '**/*.*', ignore: ['*.ejs', '*.html', '*.scss'] }]),
      new Analyze(AnalyzerOptions),
    ]
  };
};
