const path = require('path');
const dotenv = require('dotenv-safe');
const faker = require('faker');
const util = require('./util');
const conf = require('../config');

const customAlphabet = require('nanoid/async').customAlphabet;
const nanoid = customAlphabet(
  conf.conduit.settings.alphabet,
  conf.conduit.settings.uccount
);
const domain = conf.conduit.settings.domain;

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

  const password = baseUser.password || firstName + conf.passwordSuffix;

  return {
    ...baseUser,
    password,
  };
};

// frequently used
const statuses = ['active', 'inactive'];
const hiddenFields = ['partner', 'campaign', 'department', 'account'];
const hiddenFieldPolicy = ['drop-if-filled', 'pass-if-match'];
const racmCombo = util.powerset(['GET', 'POST', 'DELETE', 'PUT', 'PATCH']);
const supportedServiceTargets = conf.targets.settings.map((i) => i.type);

const {
  allowed: testAllowedIpList,
  inactive: testInactiveIpList,
  denied: testDeniedIpList,
} = require('../lib/fake-ips');

const fakeConduit = (overrides = {}) => {
  const status = util.pickRandomlyFrom(statuses);
  const ip =
    status === 'inactive'
      ? util.pickRandomlyFrom(testInactiveIpList)
      : util.pickRandomlyFrom(testAllowedIpList);

  const conduit = {
    suriApiKey: faker.random.uuid(),
    suriType: util.pickRandomlyFrom(supportedServiceTargets),
    suriObjectKey: faker.lorem.word(),
    allowlist: [
      {
        ip,
        status,
        comment: faker.lorem.words(),
      },
    ],
    racm: util.pickRandomlyFrom(racmCombo),
    throttle: faker.random.boolean(),
    status: util.pickRandomlyFrom(statuses),
    description: faker.lorem.sentence(),
    hiddenFormField: [
      {
        fieldName: util.pickRandomlyFrom(hiddenFields),
        policy: util.pickRandomlyFrom(hiddenFieldPolicy),
        include: faker.random.boolean(),
        value: faker.lorem.word(),
      },
    ],
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
    if (
      typeof inp[req[i]] === 'undefined' ||
      inp[req[i]] === null ||
      ('' + inp[req[i]]).trim() === ''
    ) {
      err[req[i]] = 'cannot be blank';
    } else {
      out[req[i]] = inp[req[i]];
    }
  }
  for (let i = 0; i < opt.length; i++) {
    if (typeof inp[opt[i]] !== 'undefined') {
      out[opt[i]] = inp[opt[i]];
    }
  }
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
      password: proxy_credentials.parsed.PROXY_SERVER_PASSWORD,
    },
  };
}

module.exports = {
  fakeUserProfile,
  fakeConduit,
  processInput,
  makeCuri,
  getProxyServerCredentials,
  testAllowedIpList,
  testInactiveIpList,
  testDeniedIpList,
};
