// This is a custom Jest transformer turning file imports into filenames.
// http://facebook.github.io/jest/docs/en/webpack.html
//
// Copied from create-react-app

const path = require('path');

module.exports = {
  process(_src, filename) {
    const assetFilename = JSON.stringify(path.basename(filename));
    console.log('============>', assetFilename);
    if (filename.match(/\.svg$/)) {
      return `module.exports = {
        __esModule: true,
        default: ${assetFilename},
        ReactComponent: () => ${assetFilename},
      };`;
    }

    return `module.exports = ${assetFilename};`;
  },
};
