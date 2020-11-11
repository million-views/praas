const fs = require('fs');
const path = require('path');
const inspect = require('util').inspect;

const chai = require('chai');
const expect = chai.expect;

const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const gatewayHost = 'localhost';
const gatewayPort = '5000';
const gatewayServerURL = `http://${gatewayHost}:${gatewayPort}`;
const gatewayServer = () => chai.request(gatewayServerURL);

const { boundHttpRequest, pickRandomlyFrom } = require('../../../lib/util');
const {
  testAllowedIpList,
  testDeniedIpList,
} = require('../../../lib/helpers');

// Test Data
const testConduits = JSON.parse(
  fs.readFileSync(path.resolve('.test-data-curi.json'))
);

const dropConduit = testConduits.dropConduit;
const passConduit = testConduits.passConduit;

// aor => accept or reject | based on client IP address
const aorConduit1 = testConduits.aorConduit1; // GET-single-active
const aorConduit2 = testConduits.aorConduit2; // GET-single-inactive | don't care
const aorConduit3 = testConduits.aorConduit3; // POST-multi-mixed

// create a record for submission with various fields that can be easily
// identified for testing purposes.
//
// `tdid` is an integer that is used decorate the generated data so that it
//  can be used to visually examined and also help in testing features such
//  as sort and search. The idea is similar to how react-testing-library
//  use `data-testid` prop.
const createRecord = (
  tdid,
  {
    multi = true,
    skipFields = [],
    template: {
      np = 'Jack L',
      ns = '',
      ep = 'jack',
      es = 'example.com',
      hp = 'hff',
      hs = '',
    } = {},
  } = {}
) => {
  const record = {
    fields: {
      name: `${np}${tdid}${ns}`,
      email: `${ep}.${tdid}@${es}`,
      hiddenFormField: `${hp}-${tdid}${hs}`,
    },
  };

  skipFields.forEach((f) => {
    delete record.fields[f];
  });

  if (multi) {
    return {
      records: [record],
    };
  } else {
    return record;
  }
};

// scratch area to hold record ids of all rows that were successfully inserted
const localStore = { writes: [], updates: [], replacements: [], deletes: [] };

function recordStore(shelf) {
  if (shelf in localStore) {
    return localStore[shelf];
  }

  console.log('bad call!, no such shelf: ', shelf);
  process.exit(-1);
}

const logR = (res, logit, match) => {
  // environment variable overrides logit
  if (process.env.DUMP_RESPONSE || logit) {
    if (match) {
      console.log(
        `<~~~ `,
        res.statusCode,
        inspect(res.body, { depth: 6 }),
        ' ~X~ ',
        inspect(match, { depth: 6 })
      );
    } else {
      console.log(`<~~~ `, res.statusCode, inspect(res.body, { depth: 6 }));
    }
  }
};

function storeIt(shelf, record) {
  if (shelf in localStore) {
    localStore[shelf].push(record);
  }
}

function checkSingleRowResponse(row, expected, storein) {
  expect(row).to.haveOwnProperty('id');
  expect(row).to.have.any.keys('deleted', 'fields');
  // expect(row).to.haveOwnProperty('fields').or.to.haveOwnProperty('deleted');

  if (expected) {
    // console.log('~~~~~~~~', row, expected);

    // eslint-disable-next-line no-prototype-builtins
    if (expected.hasOwnProperty('deleted')) {
      // console.log('$$$$$$$$$$$');
      delete expected.key;
      expect(row).to.deep.eql(expected);
    }

    // eslint-disable-next-line no-prototype-builtins
    if (expected.hasOwnProperty('fields')) {
      // console.log('%%%%%%%%');
      expect(row.fields).to.deep.eql(expected.fields);
    }
  }

  // TODO: fix gateway to not return 'createdTime'
  delete row.createdTime;
  storeIt(storein, row);
}

function checkMultiRowResponse(records, ref, storein) {
  if (!ref) {
    records.forEach((row) => {
      checkSingleRowResponse(row, undefined, storein);
    });
  } else {
    if (ref.key === undefined || !['id', 'name'].includes(ref.key)) {
      console.log(
        'bad call!, "key" in ref is required or invalid',
        inspect(ref, { depth: 6 })
      );
      process.exit(-2);
    }

    if (ref.records === undefined) {
      console.log(
        'bad call!, "records" in ref is required',
        inspect(ref, { depth: 6 })
      );
      process.exit(-3);
    }

    expect(records.length).to.equal(ref.records.length);

    if (ref.key === 'id') {
      records.forEach((row) => {
        const expected = ref.records.find((item) => item.id === row.id);
        expect(expected).to.be.an(
          'object',
          `when looking for ${inspect(row, { depth: 6 })} using '${ref.key}'`
        );
        checkSingleRowResponse(row, expected, storein);
      });
    }

    if (ref.key === 'name') {
      records.forEach((row) => {
        const expected = ref.records.find(
          (item) => item.fields.name === row.fields.name
        );

        expect(expected).to.be.an(
          'object',
          `when looking for ${inspect(row, { depth: 6 })} using '${ref.key}'`
        );
        checkSingleRowResponse(row, expected, storein);
      });
    }
  }
}

// tests for things we expect in a response to POST, PATCH, PUT request
// - set `storein` to the name of the local cache for all requests that you
//   think should be in the `base` and later want to consult in subsequent
//   tests. The value can be one off 'writes', 'updates', 'replacements',
//   'deletes' or left undefined
// - set `ref` to an object that includes record data submitted to the gatewya
//   and the name of key to lookup an entry the the record data; o keep the
//   logic simple, make sure `ref` data contains what will be transmitted by
//   the gateway, not what was received by it - since `hff` policy may drop
//   values and thus the response may not return the same.
// - set `multi` to false if the response format is for a single record
function checkSuccessResponse(
  res,
  { multi = true, storein = undefined, ref = undefined, logit = false } = {}
) {
  logR(res, logit, ref);

  expect(res.status).to.equal(200);
  if (multi) {
    expect(res.body).to.haveOwnProperty('records');
    checkMultiRowResponse(res.body.records, ref, storein);
  } else {
    checkSingleRowResponse(res.body, ref, storein);
  }
}

function checkErrorResponse(
  res,
  { ref = undefined, logit = false, expectedStatus = 422 } = {}
) {
  logR(res, logit, ref);
  expect(res.status).to.equal(expectedStatus);
}

// prettier-ignore
module.exports = {
  dropConduit, passConduit,
  aorConduit1,  aorConduit2, aorConduit3,
  createRecord, logR, checkSuccessResponse, checkErrorResponse, recordStore,
  expect, gatewayServer, gatewayHost, gatewayPort,
  boundHttpRequest, pickRandomlyFrom,
  testAllowedIpList, testDeniedIpList
};

if (require.main === module) {
  const record = createRecord(2, {
    multi: false,
    skipFields: ['name', 'email'],
    template: { hs: '-patched' },
  });

  console.log('~~~~~~~', record);
}
