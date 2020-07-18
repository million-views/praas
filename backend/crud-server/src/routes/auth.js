const jwt = require('express-jwt');
const conf = require('../config');

function getTokenFromHeader(req) {
  let token = null;
  const tokenPresent = (
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
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
    getToken: getTokenFromHeader
  }),
  optional: jwt({
    secret: conf.secret,
    userProperty: 'payload',
    credentialsRequired: false,
    getToken: getTokenFromHeader
  })
};

module.exports = auth;
