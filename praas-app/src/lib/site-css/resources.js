// See:
// https://github.com/shakacode/sass-resources-loader
// https://itnext.io/sharing-sass-resources-with-sass-resources-loader-and-webpack-ca470cd11746

const path = require('path');

const theme = 'default';

const resources = [
  '_extensions.scss',
  '_vars.scss',
  '_mixins.scss',
  '_colors.scss',
];

module.exports = resources.map(file => path.resolve(__dirname, theme, file));
