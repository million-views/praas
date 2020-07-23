const path = require('path');
const dotenv = require('dotenv-safe');
const faker = require('faker');

const config = require('../config');

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
  config.conduit.settings.alphabet,
  config.conduit.settings.uccount
);
const domain = config.conduit.settings.domain;

// Given an array of strings, this function returns all unique combinations
// of the input array elements. More generally this is a powerset generator
// minus the empty subset.
//
// See:
// - https://www.mathsisfun.com/sets/power-set.html
// - https://codereview.stackexchange.com/questions/7001/generating-all-combinations-of-an-array
//
// function powerset(array) {
//   const result = [];
//   const f = function(prefix=[], array) {
//     for (var i = 0; i < array.length; i++) {
//       result.push([...prefix,array[i]]);
//       f([...prefix,array[i]], array.slice(i + 1));
//     }
//    }
//    f('', array);
//    return result;
// }

function powerset(list) {
  const set = [],
    listSize = list.length,
    combinationsCount = (1 << listSize);

  for (let i = 1; i < combinationsCount; i++) {
    const combination = [];
    for (let j=0; j<listSize; j++) {
      if ((i & (1 << j))) {
        combination.push(list[j]);
      }
    }
    set.push(combination);
  }
  return set;
}

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

  const password = baseUser.password || firstName + config.passwordSuffix;

  return {
    ...baseUser, password
  };
};

// frequently used
// const typesArr = ['Google Sheets', 'Airtable', 'Smartsheet'];
// const baseUrl = ['https://docs.google.com/spreadsheets/d/', 'https://api.airtable.com/v0/', 'https://api.smartsheet.com/2.0/sheets'];
const ipstatArr = ['active', 'inactive'];
const hfffieldArr = ['partner', 'campaign', 'userName', 'department', 'accountName'];
const hffPolicyArr = ['drop-if-filled', 'pass-if-match'];
const accessArrSrc = powerset(['GET', 'POST', 'DELETE', 'PUT', 'PATCH']);
const suriTypeBase = [['Google Sheets', 'https://docs.google.com/spreadsheets/d/'], ['Airtable', 'https://api.airtable.com/v0/'], ['Smartsheet', 'https://api.smartsheet.com/2.0/sheets']];

const fakeConduit = (overrides = {}) => {
  const accessArr = accessArrSrc[Math.floor(Math.random() * accessArrSrc.length)];
  const randomSuriTypeBase = suriTypeBase[Math.floor(Math.random() * suriTypeBase.length)];
  // console.log('multidimientional array value 1:', randomSuriTypeBase[0]);
  // console.log('multidimientional array value 2:', randomSuriTypeBase[1]);
  const conduit = {
    suriApiKey: faker.random.uuid(),
    // suriType: typesArr[Math.floor(Math.random() * typesArr.length)],
    // suri: faker.internet.url(),
    // suri: baseUrl[Math.floor(Math.random() * baseUrl.length)],
    suriType: randomSuriTypeBase[0],
    suri: randomSuriTypeBase[1],
    suriObjectKey: faker.lorem.word(),
    allowlist: [{
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
    err.conduit = 'is required';
    return;
  }
  for (let i = 0; i < req.length; i++) {
    if (typeof inp[req[i]] === 'undefined' || inp[req[i]] === null ||
      ('' + inp[req[i]]).trim() === '') {
      err[req[i]] = `${req[i]} cannot be blank`;
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

// Returns proxy server user object (with credentials filled in from .env
// file). Aborts on error by design. NOTE: do not fix to recover!
function getProxyServerCredentials() {
  let proxy_credentials = undefined;
  try {
    // add proxy-server user... this is temporary and will go away when we
    // integrate with OAuth2 and support client credentials grant flow...
    proxy_credentials = dotenv.config({
      allowEmptyValues: true,
      example: path.resolve('.env-example'),
      path: path.resolve('.env'),
    });
    // console.log(proxy_credentials);
  } catch (e) {
    console.log('unexpected... ', e);
    process.exit(100);
  }

  return {
    user: {
      firstName: 'Proxy',
      lastName: 'Server',
      email: proxy_credentials.parsed.PROXY_SERVER_EMAIL,
      password: proxy_credentials.parsed.PROXY_SERVER_PASSWORD
    }
  };
}

module.exports = {
  fakeUserProfile, fakeConduit, processInput,
  makeCuri, getProxyServerCredentials
};
