import liveServer from 'live-server';
const port = 4000;

// Map of resource-server routes that need to be proxied in order to be
// be able to test and/or demo web app via ngrok tunnel. We obviously need
// a better solution than this since, it's not practical to keep editing
// this file as new routes get added or old ones change. Also we need
// to have a similar idea done with webpack as well.

const proxy = [
  ['/user', `http://localhost:${port}/user`],
  ['/users', `http://localhost:${port}/users`],
  ['/users/login', `http://localhost:${port}/users/login`],
  ['/conduits', `http://localhost:${port}/conduits`],
  ['/conduits', `http://localhost:${port}/conduits`],
  ['/conduits/:id', `http://localhost:${port}/conduits/:id`],
];

const params = {
  port: 8080, // Set the server port. Defaults to 8080.
  root: 'build', // Set root directory that's being served. Defaults to cwd.
  open: false, // When false, it won't load your browser by default.
  file: 'index.html', // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
  wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
  logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
  proxy,
};

liveServer.start(params);
