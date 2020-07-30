const path = require('path');
const http = require('http');
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
    for (let j = 0; j < listSize; j++) {
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
const status = ['active', 'inactive'];
const hiddenFields = ['partner', 'campaign', 'department', 'account'];
const hiddenFieldPolicy = ['drop-if-filled', 'pass-if-match'];
const racmCombo = powerset(['GET', 'POST', 'DELETE', 'PUT', 'PATCH']);
const supportedEndpoints = [
  { type: 'Google Sheets', base: 'https://docs.google.com/spreadsheets/d/' },
  { type: 'Airtable', base: 'https://api.airtable.com/v0/' },
  { type: 'Smartsheet', base: 'https://api.smartsheet.com/2.0/sheets' },
];
const {
  allowed: testAllowedIpList, denied: testDeniedIpList
} = require('../lib/fake-ips');

const randomlyPickFrom = (choices) => {
  const rollDice = Math.floor(Math.random() * choices.length);
  return choices[rollDice];
};

const fakeConduit = (overrides = {}) => {
  const endpoint = randomlyPickFrom(supportedEndpoints);
  const conduit = {
    suriApiKey: faker.random.uuid(),
    suriType: endpoint.type,
    suri: endpoint.base,
    suriObjectKey: faker.lorem.word(),
    allowlist: [{
      ip: randomlyPickFrom(testAllowedIpList),
      status: randomlyPickFrom(status),
      comment: faker.lorem.words()
    }],
    racm: randomlyPickFrom(racmCombo),
    throttle: faker.random.boolean(),
    status: randomlyPickFrom(status),
    description: faker.lorem.sentence(),
    hiddenFormField: [{
      fieldName: randomlyPickFrom(hiddenFields),
      policy: randomlyPickFrom(hiddenFieldPolicy),
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
      err[req[i]] = 'cannot be blank';
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

// Low level HTTP request exclusively meant for testing
// WARNING: DO NOT USE IN PRODUCTION CODE
//
// This function exists so that we can bind a specific local ip
// address in order to be able to test ip allow/deny list filtering.
//
// The local ip address is passed in options. A sample options looks
// as below. Note: headers is optional.
//
// const options = {
//  hostname: 'localhost',
//  port: 5000,
//  path: '/upload',
//  method: 'POST',
//  localAddress: '52.95.116.115',
//  headers: {
//    // 'Content-Type': 'application/x-www-form-urlencoded',
//    // 'Content-Length': Buffer.byteLength(postData)
//  }
// };

function boundHttpRequest(options, body = null) {
  const methods = ['OPTIONS', 'HEAD', 'GET', 'POST', 'PUT', 'PATCH'];
  options.method = options.method ? options.method.toUpperCase() : 'GET';

  if (!methods.includes(options.method)) {
    throw new Error(`Invalid method: ${options.method}`);
  }

  if (body && options.method !== 'POST') {
    throw new Error(`Body not allowed in ${options.method}.`);
  }

  if (body) {
    options.headers = {
      ...options.headers,
      'Content-Length': Buffer.byteLength(body)
    };
  }

  return new Promise((resolve, reject) => {
    const clientRequest = http.request(options, incomingMessage => {
      // response object.
      const response = {
        statusCode: incomingMessage.statusCode,
        headers: incomingMessage.headers,
        body: []
      };

      // collect response body data.
      incomingMessage.on('data', chunk => {
        response.body.push(chunk);
      });

      // resolve on end.
      incomingMessage.on('end', () => {
        if (response.body.length) {
          response.body = response.body.join();

          try {
            response.body = JSON.parse(response.body);
          } catch (error) {
            // silently fail if response is not JSON.
          }
        }

        resolve(response);
      });
    });

    // reject on request error.
    clientRequest.on('error', error => {
      reject(error);
    });

    if (body) {
      // write request body if present and close
      clientRequest.end(body);
    } else {
      // close HTTP connection.
      clientRequest.end();
    }
  });
}

module.exports = {
  fakeUserProfile, fakeConduit, processInput,
  makeCuri, getProxyServerCredentials,
  testAllowedIpList, testDeniedIpList,
  randomlyPickFrom, boundHttpRequest
};
