const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

// v.a:
// FIXME: minimize is a deprecated option of CSS-Loader now...
/*
const cssMinimizeOptions = {
  autoprefixer: {
    add: true,
    browsers: ['last 2 versions']
  },
  discardComments: {
    removeAll: true
  },
  discardUnused: {
    disable: false
  },
  mergeIdents: {
    disable: false
  },
  mergeRules: {
    disable: false
  }
};
*/

// v.a:
// - loader transform pipeline is last-in-first-out
// - the options:
//   - modules: true
//   - localIdentName: '[local]-[hash:base64:5]'
//   is how you setup and get going with CSS Modules
//
//   See https://blog.yipl.com.np/css-modules-with-react-the-complete-guide-a98737f79c7c
//
// - NOTE: importLoaders must be set to "2" so that sass-loader
//   is picked up by Webpack on @-imports.
//
//   See https://github.com/webpack-contrib/css-loader#importing-and-chained-loaders
const cssTransforms = [
  {
    loader: 'css-loader',
    options: {
      sourceMap: true,
      modules: true,
      importLoaders: 2,
      localIdentName: '[local]-[hash:base64:5]',
      // in the latest, minimize throws errors!
      // minimize: cssMinimizeOptions
    }
  },
];

// Keep each export to a single test
module.exports = (wpc) => {
  const test = /\.(css|scss)$/;
  const plugins = [];
  const loaders = cssTransforms;

  if (wpc.isProd) {
    plugins.push(
      new MiniCssExtractPlugin({
        filename: 'styles.[hash].css',
        allChunks: true
      })
    );
    // last step in the pipeline is minification
    loaders.unshift(MiniCssExtractPlugin.loader);
  } else {
    // last step in the pipeline is embed style in html
    loaders.unshift({ loader: 'style-loader' });
  }

  // NOTE: loaders are chained last-in-first-out
  // add sass transformer as the second step in the pipeline
  loaders.push({
    loader: 'sass-loader',
    options: {
      sourceMap: true, includePaths: [wpc.app, wpc.web, wpc.lib]
    }
  });

  // add sass resource loader as the first step in the pipeline
  loaders.push({
    loader: 'sass-resources-loader',
    options: {
      resources: require(path.join(wpc.lib, 'site-css/resources.js'))
    }
  });

  return {
    module: {
      rules: [{
        test,
        use: loaders
      }]
    },
    plugins
  };
};
