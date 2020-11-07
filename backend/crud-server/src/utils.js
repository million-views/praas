const crypto = require('crypto');
const customAlphabet = require('nanoid').customAlphabet;
const conf = require('../../config');

const nanoid = customAlphabet(
  conf.conduit.settings.alphabet,
  conf.conduit.settings.uccount
);

const generateCuri = (Model) => {
  const domain = conf.conduit.settings.domain;
  const prefix = conf.conduit.settings.prefix;
  const id = nanoid();
  const uri = prefix.concat('-', id, '.', domain);
  console.log(uri);
  return uri;
};

const generateHash = (val, salt) => {
  return crypto.pbkdf2Sync(val, salt, 10000, 512, 'sha512').toString('hex');
};

const generateSalt = () => {
  return crypto.randomBytes(16).toString('hex');
};

module.exports = { generateCuri, generateHash, generateSalt };
