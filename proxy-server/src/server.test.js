const fs = require('fs');
const path = require('path');

const chai = require('chai');
const chaiHttp = require('chai-http');

const helpers = require('./lib/helpers');
const PraasAPI = require('./lib/praas');

const expect = chai.expect;
chai.use(chaiHttp);

const proxyServerURL = 'http://localhost:5000';
const proxyServer = () => chai.request(proxyServerURL);

// Test Data
const testConduits = JSON.parse(fs.readFileSync(path.resolve('../.test-data-curi.json')));
const dropConduit = testConduits.dropConduit;
const passConduit = testConduits.passConduit;

// Conduit hff to test pass-if-match and include=true
const hff1 = {
  hiddenFormField: [{
    fieldName: 'campaign',
    policy: 'pass-if-match',
    include: true,
    value: 'BOGO June2020',
  }],
};

const request1 = {
  records: [{
    fields: {
      name: 'first last',
      email: 'first@last.com',
    }
  }]
};

// non-compliant hiddenFormField
const request2 = {
  records: [{
    fields: {
      name: 'first last',
      email: 'first@last.com',
      hiddenFormField: 'hiddenFormFieldValue',
    }
  }]
};

// valid hiddenFormField
// the value for hiddenFormField comes from `../crud-server/src/routes.test.js`
// validate it against the value in `testConduit2`
const request3 = {
  records: [{
    fields: {
      name: 'first last',
      email: 'first@last.com',
      hiddenFormField: 'hidden-form-field-value',
    }
  }]
};

describe('Testing Proxy Server...', async () => {
  context('Validate incoming request', () => {
    it('should reject requests to inactive conduits', async function () {
      const res = await proxyServer().get('/');
      expect(res.status).to.equal(404)
    });
    it('should have a body for PUT / PATCH / POST requests', async function () {
      const res = await proxyServer().post('/').set('Host', dropConduit);
      expect(res.status).to.equal(422);
    });
    context('validate allowList', () => {
      it('should reject requests from IPs not in AllowList', async function () {
        const res = await proxyServer()
                            .post('/')
                            .set('Host', dropConduit)
                            .send(request1);
        expect(res.status).to.equal(403);
      });
      it('should allow requests from IPs in AllowList', async function () {
        const res = await proxyServer()
                            .post('/')
                            .set('Host', passConduit)
                            .send(request1);
        expect(res.status).to.equal(201);
      });
    });
    context('Validating RACM', () => {
      it('Should reject method not present in RACM list', async function () {
        const res = await proxyServer().get('/').set('Host', dropConduit);
        expect(res.status).to.equal(405);
      });
      it('Should allow method present in RACM list', async function () {
        const res = await proxyServer().get('/').set('Host', passConduit);
        expect(res.status).to.not.equal(405);
      });
    });
    context('Validating Hidden Form Field', () => {
      context('when hiddenFormField.policy is pass-if-match', () => {
        it('should silently drop if value is not filled', async function () {
          const res = await proxyServer()
                        .post('/')
                        .set('Host', passConduit)
                        .send(request1);
          expect(res.status).to.equal(200);
        });
        it('should silently drop if value does not match', async function () {
          const res = await proxyServer()
                        .post('/')
                        .set('Host', passConduit)
                        .send(request2);
          expect(res.status).to.equal(200);
        });
        it('should process a valid request with value', async function () {
          const res = await proxyServer()
                        .post('/')
                        .set('Host', passConduit)
                        .send(request3);
          expect(res.status).to.equal(200);
        });
      });
      context('when hiddenFormField.policy is drop-if-filled', () => {
        it('should process a request if value is not filled', async function () {
          const res = await proxyServer()
                        .post('/')
                        .set('Host', dropConduit)
                        .send(request1);
          expect(res.status).to.equal(200);
        });
        it('should silently drop request if hiddenFormField is filled', async function () {
          const res = await proxyServer()
                        .post('/')
                        .set('Host', dropConduit)
                        .send(request2);
          expect(res.status).to.equal(200);
        });
      });
    });
  });
  context('Testing Airtable Gateway', () => {
    let recordId;
    before('create an arbitrary record', async function () {
      const res = await proxyServer()
                          .post('/')
                          .set('Host', passConduit)
                          .send(request1);
      recordId = res.body.records[0].id;
    });
    it('should POST a new entry', async function () {
      const res = await proxyServer()
                    .post('/')
                    .set('Host', passConduit)
                    .send(request1);
      expect(res.status).to.equal(200);
      expect(res.body).to.haveOwnProperty('records');
    });
    it('should GET all entries', async function () {
      const res = await proxyServer().get('/').set('Host', passConduit);
      expect(res.status).to.equal(200)
      expect(res.body).to.haveOwnProperty('records');
    });
    it('should GET entry by ID', async function () {
      const res = await proxyServer().get('/' + recordId).set('Host', passConduit);
      expect(res.status).to.equal(200);
      expect(res.body).hasOwnProperty('fields');
      expect(res.body.fields).to.eql(request1.records[0].fields);
    });
    it('should PATCH entries (partial update)', async function () {
      const req = {
        records: [{
          id: recordId,
          fields: {
            email: 'flast@last.com',
          }
        }]
      };
      const res = await proxyServer()
                    .patch('/')
                    .set('Host', passConduit)
                    .send(req);
      expect(res.status).to.equal(200);
      expect(res.body).to.haveOwnProperty('records');
    });
    it('should PUT into an existing entry (full update)', async function () {
      const req = {
        records: [{
          id: recordId,
          fields: {
            name: 'last, first',
        }]
      };
      const res = await proxyServer()
                    .put('/')
                    .set('Host', passConduit)
                    .send(req);
      expect(res.status).to.equal(200);
      expect(res.body).to.haveOwnProperty('records');
    });
    it('should DELETE a single entry', async function () {
      const res = await proxyServer().delete('/' + recordId).set('Host', passConduit);
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
            }
          },
          {
            fields: {
              name: 'second last',
              email: 'second@last.com',
              hiddenFormField: 'hidden-form-field-value',
            }
          },
          {
            fields: {
              name: 'third last',
              email: 'third@last.com',
              hiddenFormField: 'hidden-form-field-value',
            }
          }
        ]
      };
      const res = await proxyServer()
                  .post('/')
                  .set('Host', passConduit)
                  .send(req);

      // create list of records to be deleted
      let records = [];
      for( let i = 0; i < res.body.records.length; i++ ) {
        records.push(res.body.records[i].id);
      }

      // actually send the `DELETE` request
      const del = await proxyServer()
                    .delete('/')
                    .set('Host', passConduit)
                    .query({records});
      expect(del.status).to.equal(200);
      expect(del.body).to.haveOwnProperty('records');
      expect(del.body.records.length).to.equal(records.length);
      for( let i = 0; i < del.body.records.length; i++ ) {
        expect(del.body.records[i].deleted).to.be.true;
        expect(del.body.records[i].id).to.equal(records[i]);
      }
    });
  });
  context('Testing Google Sheets Gateway', () => {
    it('Should create Contacts (POST)', async () => {
    });
    it('Should get Contact by id (GET)', async () => {
    });
    it('Should list all Contacts (GET)', async () => {
    });
    it('Should update Contacts - partial (PATCH)', async () => {
    });
    it('Should update Contacts - full (PUT)', async () => {
    });
    it('Should delete contacts (DELETE)', async () => {
    });
  });
  context('Testing SmartSheets Gateway', () => {
    it('Should create Contacts (POST)', async () => {
    });
    it('Should get Contact by id (GET)', async () => {
    });
    it('Should list all Contacts (GET)', async () => {
    });
    it('Should update Contacts - partial (PATCH)', async () => {
    });
    it('Should update Contacts - full (PUT)', async () => {
    });
    it('Should delete contacts (DELETE)', async () => {
    });
  });
});
