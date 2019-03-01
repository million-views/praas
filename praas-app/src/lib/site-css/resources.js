// See:
// https://github.com/shakacode/sass-resources-loader
// https://itnext.io/sharing-sass-resources-with-sass-resources-loader-and-webpack-ca470cd11746

const path = require('path');

const resources = [
  'mini/_core.scss',
  'mini/_layout_mixins.scss',
  'mini/_layout.scss',
  'mini/_input_control_mixins.scss',
  'mini/_input_control.scss',
  'mini/_navigation.scss',
  'mini/_table.scss',
  'mini/_contextual_mixins.scss',
  'mini/_contextual.scss',
  'mini/_progress_mixins.scss',
  'mini/_progress.scss',
  'mini/_icon.scss',
  'mini/_utility.scss',
];

module.exports = resources.map(file => path.resolve(__dirname, file));
