/**
 * Collection of routines and algorithms that are application independent
 *
 * NOTE:
 *  - do not add functions in this module having dependency to the application
 *    domain
 *  - if the origins of the code is from online sources then you *MUST*
 *    provide attribution by pointing to the source from where either the
 *    code was copied or served as a basis for inspiration
 *  - DO *NOT* copy copy-left licensed code functions since it is not
 *    compatible with this project's MIT license
 */
const http = require('http');

// Given an array of strings, this function returns all unique combinations
// of the input array elements. More generally this is a powerset generator
// minus the empty subset.
//
// See:
// - https://www.mathsisfun.com/sets/power-set.html
// - https://codereview.stackexchange.com/questions/7001/generating-all-combinations-of-an-array
function powerset(list) {
  const set = [],
    listSize = list.length,
    combinationsCount = 1 << listSize;

  for (let i = 1; i < combinationsCount; i++) {
    const combination = [];
    for (let j = 0; j < listSize; j++) {
      if (i & (1 << j)) {
        combination.push(list[j]);
      }
    }
    set.push(combination);
  }
  return set;
}

// Given an array of integers, return a range set that consists of an array (of
// arrays) such that each element represents a range (sequential integers)
// that were found in the input array. The default format of the sequence
// array item is to include the start and end of the sequence. The default
// format can be overridden by providing a callback that receives two integers
// (start, end) and returns a formatted element that can be anything. The
// return value is pushed into the final rangeset array that is returned to
// the caller.
//
// NOTE: If halfopen is true then the end given to the callback is one beyond
//       the range; defaults to false.
//
// See:
// - https://stackoverflow.com/questions/2270910/how-to-reduce-consecutive-integers-in-an-array-to-hyphenated-range-expressions
function rangeset(array, callback, halfopen = false) {
  if (!callback) {
    callback = (start, end) =>
      start === end ? `${start}` : `${start}-${end}`;
  }
  const sequence = array.sort().map((v) => Number.parseInt(v));
  const ranges = [];
  for (let i = 0; i < sequence.length; i += 1) {
    const rstart = sequence[i];
    let rend = rstart;
    while (sequence[i + 1] - sequence[i] === 1) {
      rend = sequence[i + 1]; // sequential...
      i += 1;
    }
    ranges.push(callback(rstart, halfopen ? rend + 1 : rend));
  }

  return ranges;
}

// Freeze all props recursively. Freeze Map and Set props by removing mutating
// methods.
//
// See:
// - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
function freezeall(object) {
  if (object instanceof Map) {
    object.clear = object.delete = object.set = function () {
      throw new Error('map is read-only');
    };
  } else if (object instanceof Set) {
    object.add = object.clear = object.delete = function () {
      throw new Error('set is read-only');
    };
  }

  // retrieve the property names defined on object
  const propNames = Object.getOwnPropertyNames(object);

  // freeze properties before freezing self
  for (const name of propNames) {
    const value = object[name];

    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      freezeall(value);
    }
  }

  // freeze self
  return Object.freeze(object);
}

function pickRandomlyFrom(choices) {
  const rollDice = Math.floor(Math.random() * choices.length);
  return choices[rollDice];
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
//
// REFERENCES:
// - https://blog.bearer.sh/node-http-request/
// - https://stackoverflow.com/questions/38533580/nodejs-how-to-promisify-http-request-reject-got-called-two-times
const methods = ['OPTIONS', 'HEAD', 'GET', 'POST', 'PUT', 'PATCH'];

function boundHttpRequest(options, body = null) {
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
      'Content-Length': Buffer.byteLength(body),
    };
  }

  return new Promise((resolve, reject) => {
    const clientRequest = http.request(options, (incomingMessage) => {
      // response object.
      const response = {
        status: incomingMessage.statusCode,
        headers: incomingMessage.headers,
        body: [],
      };

      // collect response body data.
      incomingMessage.on('data', (chunk) => {
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
    clientRequest.on('error', (error) => {
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

function validateEmail(emailAddr) {
  if (
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
      emailAddr
    )
  ) {
    return true;
  }
  return false;
}

// Group by time period - By 'seconds' | 'day' | 'week' | 'month' | 'year'
// -----------------------------------------------------------------------
function groupByTimePeriod(obj, createdtimestamp, period) {
  const objPeriod = {};
  const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
  for (let i = 0; i < obj.length; i++) {
    const timestamp = obj[i][createdtimestamp];
    let d = new Date(timestamp);
    // pretend this can group by second, day, week, month but for now we just
    // use the seconds for grouping
    if (period === 'seconds') {
      d = d.getSeconds();
    } else if (period === 'day') {
      // console.log('>>>findDate:', d.getDate());
      d = Math.floor(d.getTime() / oneDay);
    } else if (period === 'week') {
      d = Math.floor(d.getTime() / (oneDay * 7));
    } else if (period === 'month') {
      // console.log('>>>findMonth:', d.getMonth() + 1);
      d = (d.getFullYear() - 1970) * 12 + d.getMonth();
    } else if (period === 'year') {
      d = d.getFullYear();
    } else {
      console.log(
        'groupByTimePeriod: You have to set a period! seconds | day | week | month | year'
      );
    }
    // define object key and check for validity
    objPeriod[d] = objPeriod[d] || { valid: 0, invalid: 0, unverified: 0 };
    const stats = objPeriod[d];
    if (obj[i].fields.validity === 'valid') {
      stats.valid += 1;
    } else if (obj[i].fields.validity === 'invalid') {
      stats.invalid += 1;
    } else if (obj[i].fields.validity === undefined) {
      stats.unverified += 1;
    }
  }
  return objPeriod;
}

module.exports = {
  powerset,
  rangeset,
  freezeall,
  pickRandomlyFrom,
  boundHttpRequest,
  validateEmail,
  groupByTimePeriod,
};

if (require.main === module) {
  const combinations = powerset([
    'deleted',
    'undeleted',
    'duplicates',
    'unique',
  ]);
  console.table(combinations);
}
