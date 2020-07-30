const jwt = require('express-jwt');
const conf = require('../../../config').system.settings;

function getTokenFromHeader(req) {
  let token = null;
  const tokenPresent = (
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token')
    || (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
  );

  if (tokenPresent) {
    token = req.headers.authorization.split(' ')[1];
  }

  return token;
}

const auth = {
  required: jwt({
    secret: conf.secret,
    userProperty: 'payload',
    algorithms: ['HS256'],
    getToken: getTokenFromHeader
  }),
  optional: jwt({
    secret: conf.secret,
    userProperty: 'payload',
    credentialsRequired: false,
    algorithms: ['HS256'],
    getToken: getTokenFromHeader
  })
};

module.exports = auth;
