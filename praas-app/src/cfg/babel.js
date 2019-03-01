// v.a:
//   hacky way to prevent babel from converting ES6 to ES5 is to choose a
//   browser that fully supports ES6... we just need to convert jsx to
//   vdom, and leave rest of the ES6 code intact.
const presets = (wpc) => [
  ['@babel/preset-env', {
    loose: true,
    modules: false,       /* don't transpile ES6 modules */
    useBuiltIns: 'usage', /* polyfill based on usage */
    debug: false,
    targets: {
      chrome: 71,
      esmodules: true
    },
    // for uglify which we don't want
    forceAllTransforms: wpc.isProd,
  }],
];

const plugins = [
  ['@babel/plugin-transform-react-jsx'],
  ['@babel/plugin-proposal-object-rest-spread', { useBuiltins: true }],
  ['@babel/plugin-syntax-dynamic-import'],
];

/**
 *
 * @param {wpc} weppack based project configuration
 *
 */
module.exports = (wpc) => {
  const test = /\.jsx?$/;
  const exclude = /(node_modules|bower_components)/;

  if (wpc.isProd) {
    plugins.push([
      'transform-react-remove-prop-types',
      {
        mode: 'remove',
        removeImport: true,
        additionalLibraries: ['react', 'react-dom'],
      },
    ]);
  }

  const loaders = [
    {
      loader: 'babel-loader',
      options: { presets: presets(wpc), plugins }
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
