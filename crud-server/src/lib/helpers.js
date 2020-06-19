const faker = require('faker');
const config = require('../config');
const models = require('../models');

const customAlphabet = require('nanoid/async').customAlphabet;

// premature optimization is the root of all evil
// ...
// some time ago we decided to eliminate a few lines  of code by using
// the setter method for 'curi' field in a conduit which at that point
// in time seemed like a 'cool' idea. But now nanoid broke backward
// compatibility by making the generate function a promise.
//
// Sequelize has no intent of supporting async getters
// and setters. See:
// - https://github.com/sequelize/sequelize/issues/1821#issuecomment-347801702
// - https://stackoverflow.com/questions/50641526/async-getter-setter-in-sequelize-as-part-of-a-property
// - https://stackoverflow.com/questions/14220321/how-do-i-return-the-response-from-an-asynchronous-call
//
// Now we have to twist and bend to make the whole thing work again.
// Moral of the story, don't waste time eliminating a few lines of code
// unless those few lines happen in a thousand different places!
//

const nanoid = customAlphabet(
  models.System.cconf.settings.alphabet,
  models.System.cconf.settings.uccount
);
const domain = models.System.cconf.settings.domain;

// Construct a custom uri...
// Note once a low level function is asynchronous there is no reasonable way
// to become synchronous to the caller; here nanoid is async so this function
// also has to be async; the caller has to await or use a promise to resolve
// using a callback.
const makeCuri = async (prefix) => {
  // use immediately invoked async function pattern to make this
  // function usable by the caller which cannot declare itself
  // to be async
  const id = await nanoid();
  const uri = prefix.concat('-', id, '.', domain);
  // console.log('prefix, id, domain, uri:', prefix, id, domain, uri);
  return uri;
};

const generateUsers = async (count = 5) => {
  const fups = [];
  for (let i = 0; i < count; i++) fups.push(fakeUserProfile());
  return models.User.bulkCreate(fups);
};

const generateConduits = async (userId, count = 50) => {
  const fcts = [];
  for (let i = 0; i < count; i++) {
    const curi = await makeCuri('td');
    fcts.push(fakeConduit({ curi }));
  }
  for (const fct of fcts) fct.userId = userId;
  return models.Conduit.bulkCreate(fcts);
};

const fakeUserProfile = (overrides = {}) => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const email = faker.internet.email();

  const baseUser = {
    firstName,
    lastName,
    email: email.toLowerCase(),
    ...overrides,
  };

  const password = baseUser.password || firstName + config.testPwdSuffix;

  return {
    ...baseUser, password
  };
};

const fakeConduit = (overrides = {}) => {
  const typesArr = ['Google Sheets', 'Airtable', 'Smart Sheet'];
  const ipstatArr = ['active', 'inactive'];
  const hfffieldArr = ['partner', 'campaign', 'userName', 'department', 'accountName'];
  const hffPolicyArr = ['drop-if-filled', 'pass-if-match'];
  const accessArrSrc = [
    ['GET'], ['POST'], ['DELETE'], ['PUT'], ['PATCH'],
    ['GET', 'POST'], ['GET', 'DELETE'], ['GET', 'PUT'], ['GET', 'PATCH'],
    ['POST', 'DELETE'], ['POST', 'PUT'], ['POST', 'PATCH'],
    ['DELETE', 'PUT'], ['DELETE', 'PATCH'], ['PUT', 'PATCH'],
    ['GET', 'POST', 'DELETE'], ['GET', 'POST', 'PUT'], ['GET', 'POST', 'PATCH'],
    ['GET', 'DELETE', 'PUT'], ['GET', 'DELETE', 'PATCH'], ['GET', 'PUT', 'PATCH'],
    ['POST', 'DELETE', 'PUT'], ['POST', 'DELETE', 'PATCH'], ['POST', 'PUT', 'PATCH'],
    ['DELETE', 'PUT', 'PATCH'], ['GET', 'POST', 'DELETE', 'PUT'],
    ['GET', 'POST', 'DELETE', 'PATCH'], ['GET', 'POST', 'PUT', 'PATCH'],
    ['GET', 'DELETE', 'PUT', 'PATCH'], ['POST', 'DELETE', 'PUT', 'PATCH'],
    ['GET', 'POST', 'DELETE', 'PUT', 'PATCH']];
  const accessArr = accessArrSrc[Math.floor(Math.random() * accessArrSrc.length)];
  const conduit = {
    suriApiKey: faker.random.uuid(),
    suriType: typesArr[Math.floor(Math.random() * typesArr.length)],
    suriObjectKey: faker.lorem.word(),
    suri: faker.internet.url(),
    // curi: 'td',
    whitelist: [{
      ip: faker.internet.ip(),
      status: ipstatArr[Math.floor(Math.random() * ipstatArr.length)],
      comment: faker.lorem.words()
    }],
    racm: accessArr,
    throttle: faker.random.boolean(),
    status: ipstatArr[Math.floor(Math.random() * ipstatArr.length)],
    description: faker.lorem.sentence(),
    hiddenFormField: [{
      fieldName: hfffieldArr[Math.floor(Math.random() * hfffieldArr.length)],
      policy: hffPolicyArr[Math.floor(Math.random() * hffPolicyArr.length)],
      include: faker.random.boolean(),
      value: faker.lorem.word(),
    }],
    ...overrides,
  };

  return conduit;
};

const processInput = (inp, req, opt, out, err) => {
  if (!inp) {
    err.conduit = 'Conduit object not provided';
    return;
  }
  for (let i = 0; i < req.length; i++) {
    if (typeof inp[req[i]] === 'undefined' || inp[req[i]] === null ||
      ('' + inp[req[i]]).trim() === '') {
      err[req[i]] = `${req[i]} can't be blank`;
    } else {
      out[req[i]] = inp[req[i]];
    };
  };
  for (let i = 0; i < opt.length; i++) {
    if (typeof inp[opt[i]] !== 'undefined') {
      out[opt[i]] = inp[opt[i]];
    };
  };
};

module.exports = {
  fakeUserProfile, fakeConduit, generateUsers, generateConduits, processInput, makeCuri
};
