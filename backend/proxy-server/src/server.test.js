const fs = require('fs');
const path = require('path');

const chai = require('chai');
const chaiHttp = require('chai-http');

const {
  boundHttpRequest,
  randomlyPickFrom,
  testAllowedIpList,
  testDeniedIpList,
} = require('../../lib/helpers');

const expect = chai.expect;
chai.use(chaiHttp);

const proxyHost = 'localhost';
const proxyPort = '5000';
const proxyServerURL = `http://${proxyHost}:${proxyPort}`;
const proxyServer = () => chai.request(proxyServerURL);

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

const noIncludeConduit = testConduits.noIncludeConduit;

const request1 = {
  records: [
    {
      fields: {
        name: 'first last',
        email: 'first@last.com',
      },
    },
  ],
};

// non-compliant hiddenFormField
const request2 = {
  records: [
    {
      fields: {
        name: 'first last',
        email: 'first@last.com',
        hiddenFormField: 'hiddenFormFieldValue',
      },
    },
  ],
};

// valid hiddenFormField
// the value for hiddenFormField comes from `../crud-server/src/routes.test.js`
// validate it against the value in `testConduit2`
const request3 = {
  records: [
    {
      fields: {
        name: 'first last',
        email: 'first@last.com',
        hiddenFormField: 'hidden-form-field-value',
      },
    },
  ],
};

describe('Testing Gateway Server...', async () => {
  context('Validate incoming request', () => {
    it('should reject requests to inactive conduits', async function () {
      const res = await proxyServer().get('/');
      expect(res.status).to.equal(404);
    });

    it('should have a body for PUT / PATCH / POST requests', async function () {
      const res = await proxyServer().post('/').set('Host', dropConduit.host);
      expect(res.status).to.equal(422);
    });

    context('validate allowList', function () {
      const postData = JSON.stringify(request1);
      const optionsBase = {
        hostname: proxyHost,
        port: proxyPort,
        path: '/',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      it('should accept requests from * when ip is inactive', async function () {
        const options2 = {
          ...optionsBase,
          localAddress: randomlyPickFrom(testDeniedIpList),
          headers: { ...optionsBase.headers, Host: aorConduit2.host },
        };
        boundHttpRequest(options2).then(
          (success) => {
            // console.log('success ---> ', success);
            expect(success.statusCode).to.equal(200);
          },
          (error) => {
            console.log('error --->', error);
            expect(true).to.equal(false); // This is not expected
          }
        );

        options2.localAddress = randomlyPickFrom(testAllowedIpList);
        boundHttpRequest(options2).then(
          (success) => {
            // console.log('success ---> ', success);
            expect(success.statusCode).to.equal(200);
          },
          (error) => {
            console.log('error --->', error);
            expect(true).to.equal(false); // This is not expected
          }
        );
      });

      it('should reject requests from IPs not in AllowList', async function () {
        const options1 = {
          ...optionsBase,
          localAddress: randomlyPickFrom(testDeniedIpList),
          headers: { ...optionsBase.headers, Host: aorConduit1.host },
        };
        boundHttpRequest(options1).then(
          (success) => {
            // console.log('success ---> ', success);
            expect(success.statusCode).to.equal(403);
          },
          (error) => {
            console.log('error --->', error);
            expect(true).to.equal(false); // This is not expected
          }
        );

        const options3 = {
          ...optionsBase,
          method: 'POST',
          localAddress: randomlyPickFrom(testDeniedIpList),
          headers: { ...optionsBase.headers, Host: aorConduit3.host },
        };
        boundHttpRequest(options3, postData).then(
          (success) => {
            // console.log('success ---> ', success);
            expect(success.statusCode).to.equal(403);
          },
          (error) => {
            console.log('error --->', error);
            expect(true).to.equal(false); // This is not expected
          }
        );
      });

      it('should allow requests from IPs in AllowList', async function () {
        const options1 = {
          ...optionsBase,
          localAddress: randomlyPickFrom(aorConduit1.allowlist).ip,
          headers: { ...optionsBase.headers, Host: aorConduit1.host },
        };
        boundHttpRequest(options1).then(
          (success) => {
            // console.log('success ---> ', success);
            expect(success.statusCode).to.equal(200);
          },
          (error) => {
            console.log('error --->', error);
            expect(true).to.equal(false); // This is not expected
          }
        );

        const options2 = {
          ...optionsBase,
          localAddress: randomlyPickFrom(aorConduit2.allowlist).ip,
          headers: { ...optionsBase.headers, Host: aorConduit2.host },
        };
        boundHttpRequest(options2).then(
          (success) => {
            // console.log('success ---> ', success);
            expect(success.statusCode).to.equal(200);
          },
          (error) => {
            console.log('error --->', error);
            expect(true).to.equal(false); // This is not expected
          }
        );

        const activeOnly = aorConduit3.allowlist.filter(
          (ip) => ip.status === 'active'
        );
        const options3 = {
          ...optionsBase,
          method: 'POST',
          localAddress: randomlyPickFrom(activeOnly).ip,
          headers: { ...optionsBase.headers, Host: aorConduit3.host },
        };
        boundHttpRequest(options3, postData).then(
          (success) => {
            // console.log('success ---> ', success);
            expect(success.statusCode).to.equal(200);
          },
          (error) => {
            console.log('error --->', error);
            expect(true).to.equal(false); // This is not expected
          }
        );
      });
    });

    context('Validating RACM', () => {
      it('Should reject method not present in RACM list', async function () {
        const res = await proxyServer().get('/').set('Host', dropConduit.host);
        expect(res.status).to.equal(405);
      });
      it('Should allow method present in RACM list', async function () {
        const res = await proxyServer().get('/').set('Host', passConduit.host);
        expect(res.status).to.not.equal(405);
      });
    });

    context('Validating Hidden Form Field', () => {
      context('when hiddenFormField.policy is pass-if-match', () => {
        it('should silently drop if value is not filled', async function () {
          const res = await proxyServer()
            .post('/')
            .set('Host', passConduit.host)
            .send(request1);
          expect(res.status).to.equal(200);
        });

        it('should silently drop if value does not match', async function () {
          const res = await proxyServer()
            .post('/')
            .set('Host', passConduit.host)
            .send(request2);
          expect(res.status).to.equal(200);
        });

        it('should process a valid request with value', async function () {
          const res = await proxyServer()
            .post('/')
            .set('Host', passConduit.host)
            .send(request3);
          expect(res.status).to.equal(200);
        });
      });

      context('when hiddenFormField.policy is drop-if-filled', () => {
        it('should process a request if value is not filled', async function () {
          const res = await proxyServer()
            .post('/')
            .set('Host', dropConduit.host)
            .send(request1);
          expect(res.status).to.equal(200);
        });

        it('should silently drop request if hiddenFormField is filled', async function () {
          const res = await proxyServer()
            .post('/')
            .set('Host', dropConduit.host)
            .send(request2);
          expect(res.status).to.equal(200);
        });
      });

      context('for hiddenFormField.include', async function () {
        it('should send hiddenFormField if include = true', async function () {
          const res = await proxyServer()
            .post('/')
            .set('Host', passConduit.host)
            .send(request3);
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('records');
          expect(res.body.records.length).to.equal(request3.records.length);
          for (let i = 0; i < res.body.records.length; i++) {
            expect(res.body.records[i].fields).to.eql(
              request3.records[i].fields
            );
          }
        });

        it('should not send hiddenFormField if include = false', async function () {
          const res = await proxyServer()
            .post('/')
            .set('Host', noIncludeConduit.host)
            .send(request3);
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('records');
          expect(res.body.records.length).to.equal(request3.records.length);
          for (let i = 0; i < res.body.records.length; i++) {
            expect(res.body.records[i].fields).to.not.eql(
              request3.records[i].fields
            );
          }
        });
      });
    });
  });

  context('Testing Airtable Gateway', () => {
    let recordId;
    before('create an arbitrary record', async function () {
      const res = await proxyServer()
        .post('/')
        .set('Host', passConduit.host)
        .send(request3);
      if (res.body.records) {
        recordId = res.body.records[0].id;
      } else {
        throw new Error('could not create arbitrary record');
      }
    });

    it('should POST a new entry', async function () {
      const res = await proxyServer()
        .post('/')
        .set('Host', passConduit.host)
        .send(request3);
      expect(res.status).to.equal(200);
      expect(res.body).to.haveOwnProperty('records');
    });

    it('should GET all entries', async function () {
      const res = await proxyServer().get('/').set('Host', passConduit.host);
      expect(res.status).to.equal(200);
      expect(res.body).to.haveOwnProperty('records');
    });

    it('should GET entry by ID', async function () {
      const res = await proxyServer()
        .get('/' + recordId)
        .set('Host', passConduit.host);
      expect(res.status).to.equal(200);
      expect(res.body).to.haveOwnProperty('fields');
      expect(res.body.fields).to.eql(request3.records[0].fields);
    });

    it('should PATCH entries (partial update)', async function () {
      const req = {
        records: [
          {
            id: recordId,
            fields: {
              email: 'flast@last.com',
            },
          },
        ],
      };
      const res = await proxyServer()
        .patch('/')
        .set('Host', passConduit.host)
        .send(req);
      expect(res.status).to.equal(200);
      expect(res.body).to.haveOwnProperty('records');
    });

    it('should PUT into an existing entry (full update)', async function () {
      const req = {
        records: [
          {
            id: recordId,
            fields: {
              name: 'last, first',
            },
          },
        ],
      };
      const res = await proxyServer()
        .put('/')
        .set('Host', passConduit.host)
        .send(req);
      expect(res.status).to.equal(200);
      expect(res.body).to.haveOwnProperty('records');
    });

    it('should DELETE a single entry', async function () {
      const res = await proxyServer()
        .delete('/' + recordId)
        .set('Host', passConduit.host);
      expect(res.status).to.equal(200);
      expect(res.body.deleted).to.be.true;
      expect(res.body.id).to.equal(recordId);
    });

    it('should DELETE multiple entries', async function () {
      // add some extra records to delete
      const req = {
        records: [
          {
            fields: {
              name: 'first last',
              email: 'first@last.com',
              hiddenFormField: 'hidden-form-field-value',
            },
          },
          {
            fields: {
              name: 'second last',
              email: 'second@last.com',
              hiddenFormField: 'hidden-form-field-value',
            },
          },
          {
            fields: {
              name: 'third last',
              email: 'third@last.com',
              hiddenFormField: 'hidden-form-field-value',
            },
          },
        ],
      };
      const res = await proxyServer()
        .post('/')
        .set('Host', passConduit.host)
        .send(req);

      // create list of records to be deleted
      const records = [];
      if (res.body.records) {
        for (let i = 0; i < res.body.records.length; i++) {
          records.push(res.body.records[i].id);
        }
      } else {
        throw new Error('response.body does not have any `records`');
      }

      // actually send the `DELETE` request
      const del = await proxyServer()
        .delete('/')
        .set('Host', passConduit.host)
        .query({ records });
      expect(del.status).to.equal(200);
      expect(del.body).to.haveOwnProperty('records');
      expect(del.body.records.length).to.equal(records.length);
      for (let i = 0; i < del.body.records.length; i++) {
        expect(del.body.records[i].deleted).to.be.true;
        expect(del.body.records[i].id).to.equal(records[i]);
      }
    });
  });
});
