// See https://github.com/facebook/jest/issues/1468
// ^^^ solution provided by @nfarina
//
// Custom Jest transform implementation that wraps babel-jest and injects our
// babel presets, so we don't have to use .babelrc.
//

// Try to be DRY, reused babel.conf for test setup
const babel = require('./babel.config')({ isTest: true });

const transformer = require('babel-jest')
  .createTransformer(babel);

module.exports = transformer;
