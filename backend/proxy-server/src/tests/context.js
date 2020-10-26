const fs = require('fs');
const path = require('path');
const inspect = require('util').inspect;

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
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

// tests for things we expect in a response to POST, PATCH, PUT request
// - set `storein` to the name of the local cache for all requests that you
//   think should be in the `base` and later want to consult in subsequent
//   tests. The value can be one off 'writes', 'updates', 'replacements',
//   'deletes' or left undefined
// - set `ref` to the record data that was submitted to confirm all fields
//   were inserted; to keep the logic simple, make sure `ref` contains what
//   will be transmitted by the gateway, not what was received by it - since
//   `hff` policy may drop values.
// - set `multi` to false if the response format is for a single record
function checkSuccessResponse(
  res,
  { multi = true, storein = undefined, ref = undefined, logit = false } = {}
) {
  logR(res, logit, ref);

  expect(res.status).to.equal(200);
  if (multi) {
    expect(res.body).to.haveOwnProperty('records');
    if (ref) {
      expect(res.body.records.length).to.equal(ref.records.length);
    }

    res.body.records.forEach((r, i) => {
      expect(r).to.haveOwnProperty('id');
      expect(r).to.haveOwnProperty('fields');

      if (ref) {
        expect(r.fields).to.eql(ref.records[i].fields);
      }

      storeIt(storein, { id: r.id, fields: r.fields });
    });
  } else {
    expect(res.body).to.haveOwnProperty('id');
    expect(res.body).to.haveOwnProperty('fields');
    if (ref) {
      expect(res.body.fields).to.eql(ref.fields);
    }

    storeIt(storein, { id: res.body.id, fields: res.body.fields });
  }
}

// prettier-ignore
module.exports = {
  dropConduit, passConduit,
  aorConduit1,  aorConduit2, aorConduit3,
  createRecord, logR, checkSuccessResponse, recordStore,
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
