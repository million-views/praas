const merge = require('webpack-merge');
const path = require('path');

// v.a:
// Entry point for webpack, for more details see:
//  - https://webpack.js.org/configuration/configuration-types/#exporting-a-function
//
// We pack what we get in argv and env variables to an configuration object that
// is by various plugins and loaders so that they remain location and path
// agnostic.
module.exports = (env, argv) => {
  const isProd = env && env.production;
  const mode = isProd ? 'production' : 'development';

  // many dependencies make decisions based on NODE_ENV, so set it here.
  process.env.NODE_ENV = mode;

  const root = path.join(__dirname, '../');
  const app = path.join(root, 'app');
  const cfg = path.join(root, 'cfg');
  const web = path.join(root, 'web');
  const lib = path.join(root, 'lib');
  const build = path.join(root, '../', 'build');

  // webpack based project configuration
  const wpc = { isProd, argv, mode, root, app, cfg, web, lib, build };
  // console.table(wpc);

  // bring in the parts of the build pipeline
  const Base = require('./setup')(wpc);
  const Styles = require('./styles')(wpc);
  const Lint = require('./eslint')(wpc);
  const Babel = require('./babel')(wpc);

  // NOTE: webpack configuration is code as well, so include Lint early on.
  let merged = merge(Base, Lint, Babel, Styles, { devtool: 'source-map' });

  if (isProd) {
    // production
    const Optimize = require('./optimize')(wpc);
    merged = merge(merged, Optimize);
  } else {
    // development
    const Development = require('./development')({
      ...wpc,
      host: process.env.HOST || 'localhost',
      port: process.env.PORT || 3000,
    });

    merged = merge(merged, Development);
  }

  return merged;
};
