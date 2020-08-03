const presets = (wpc) => [
  ['@babel/preset-env', {
    loose: true,
    modules: wpc.isTest ? 'commonjs' : false,   /* transpile ES6 for Jest */
    useBuiltIns: 'usage', /* disable polyfills; target the latest and greatest! */
    // debug: true,
    targets: {
      chrome: 71,
      esmodules: true,
      node: 'current',
    },
    corejs: {
      version: 3, proposals: true
    },
    // for uglify which we don't want to during development
    forceAllTransforms: wpc.isProd,
  }],
  ['@babel/preset-react', {
    useBuiltIns: 'usage'
  }],
];

const plugins = [
  ['@babel/plugin-transform-react-jsx'],
  ['@babel/plugin-proposal-object-rest-spread', { useBuiltins: true }],
  ['@babel/plugin-syntax-dynamic-import'],
];

module.exports = (wpc) => {
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

  return {
    presets: presets(wpc),
    plugins,
    babelrc: false,
    configFile: false,
  };
};
