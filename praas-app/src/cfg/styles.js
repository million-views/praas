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
//
// Issues worth understanding:
// - [single file configuration...](https://github.com/webpack-contrib/mini-css-extract-plugin/issues/85)
// - [support multiple instances of MiniCssExtractPlugin](https://github.com/webpack-contrib/mini-css-extract-plugin/issues/45)
//
const cssLoader = (cssModule, localIdentName = undefined) => {
  return {
    loader: 'css-loader',
    options: {
      sourceMap: true,
      modules: cssModule,
      importLoaders: 1,
      localIdentName
      // in the latest, minimize throws errors!
      // minimize: cssMinimizeOptions
    }
  };
};

const sassResourceLoader = (basePath) => {
  return {
    loader: 'sass-resources-loader',
    options: {
      resources: require(path.join(basePath, 'site-css/resources.js'))
    }
  };
};

const sassLoader = (includePaths) => {
  return {
    loader: 'sass-loader',
    options: {
      sourceMap: true, includePaths
    }
  };
};

// Keep each export to a single test
module.exports = (wpc) => {
  const test = /\.(css|scss)$/;
  const plugins = [];
  const localCss = [];
  const globalCss = [];

  if (wpc.isProd) {
    plugins.push(
      new MiniCssExtractPlugin({
        filename: '[name][hash].css',
        chunkFileName: '[name].css',
      })
    );
    // last step in the pipeline is minification
    localCss.push(MiniCssExtractPlugin.loader);
    globalCss.push(MiniCssExtractPlugin.loader);
  } else {
    // last step in the pipeline is to embed style in html
    localCss.push({ loader: 'style-loader' });
    globalCss.push({ loader: 'style-loader' });
  }

  localCss.push(cssLoader(true, '[local]-[hash:base64:5]'));
  globalCss.push(cssLoader('global'));
  // NOTE: loaders are chained last-in-first-out
  // add sass transformer as the second step in the pipeline
  localCss.push(sassLoader([wpc.app]));
  globalCss.push(sassLoader([wpc.web, wpc.lib]));

  // add sass resource loader as the first step in the pipeline
  localCss.push(sassResourceLoader(wpc.lib));
  globalCss.push(sassResourceLoader(wpc.lib));

  return {
    module: {
      rules: [
        {
          oneOf: [
            {
              test,
              include: [wpc.web, wpc.lib],
              exclude: /node_modules/,
              use: globalCss
            },
            {
              test,
              include: [wpc.app],
              exclude: /node_modules/,
              use: localCss
            },
          ]
        },
      ]
    },
    plugins
  };
};
