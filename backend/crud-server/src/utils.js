const conf = require('../../config');
const customAlphabet = require('nanoid').customAlphabet;

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

module.exports = { generateCuri };
