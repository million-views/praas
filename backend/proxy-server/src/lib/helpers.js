const path = require('path');
const dotenv = require('dotenv-safe');

function padLeft(val, len=2, padChar='0') {
  return (''+val).padStart(len, padChar);
}

function printTime() {
  const now = new Date();
  return now.getFullYear() +
  '-' + padLeft((now.getMonth() + 1)) +
  '-' + padLeft(now.getDate()) +
  ' ' + padLeft(now.getHours()) +
  ':' + padLeft(now.getMinutes()) +
   ':' + padLeft(now.getSeconds());
}

// Returns proxy server user object (with credentials filled in from .env file)
// TODO: move this to a common library accessible to both proxy and crud servers
function getProxyServerCredentials() {
  let proxy_credentials = undefined;
  try {
    // add proxy-server user... this is temporary and will go away when we
    // integrate with OAuth2 and support client credentials grant flow...
    proxy_credentials = dotenv.config({
      allowEmptyValues: true,
      example: path.resolve('../.env-example'),
      path: path.resolve('../.env'),
    });
    // console.log(proxy_credentials);
  } catch (e) {
    console.log('unexpected...', e);
    process.exit(1);
  }

  return {
    user: {
      firstName: 'Proxy',
      lastName: 'Server',
      email: proxy_credentials.parsed.PROXY_SERVER_EMAIL,
      password: proxy_credentials.parsed.PROXY_SERVER_PASSWORD,
    },
  };
}

module.exports = { printTime, getProxyServerCredentials };
