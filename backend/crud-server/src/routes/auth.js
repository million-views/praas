const jwt = require('express-jwt');
const conf = require('../../../config').system.settings;

function getTokenFromHeader(req) {
  let token = null;
  const tokens = req.headers.authorization?.split(' ');
  const tokenPresent = tokens?.[0] === 'Token' || tokens?.[0] === 'Bearer';

  if (tokenPresent) {
    token = tokens[1];
  }

  return token;
}

const auth = {
  required: jwt({
    secret: conf.secret,
    userProperty: 'payload',
    algorithms: ['HS256'],
    getToken: getTokenFromHeader,
  }),
  optional: jwt({
    secret: conf.secret,
    userProperty: 'payload',
    credentialsRequired: false,
    algorithms: ['HS256'],
    getToken: getTokenFromHeader,
  }),
};

module.exports = auth;
