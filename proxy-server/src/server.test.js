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

// Conduit hff to test policy drop-if-filled
const hff3 = {
  hiddenFormField: [{
    fieldName: 'department',
    policy: 'drop-if-filled',
    include: false,
  }],
};

// Test request to fail drop-if-filled
const testReq3body = {
  records: [{
    fields: {
      name: 'fname2 lname2',
      email: 'fname2@lname2.com',
      department: 'Marketing'
    }
  }],
};

describe('Testing Proxy Server...', async () => {
  context('Validate incoming request', () => {
    it('should reject requests of inactive conduits', async function () {
      const res = await proxyServer().get('/');
      expect(res.status).to.equal(404)
    });
    it('should have a body for PUT / PATCH / POST requests', async function () {
      const res = await proxyServer().put('/').set('Host', dropConduit);
      expect(res.status).to.equal(422);
    });
    context('validate allowList', () => {
      it('should reject requests from IPs not in AllowList', async function () {
        const res = await proxyServer()
                            .put('/')
                            .set('Host', dropConduit)
                            .send(request1);
        expect(res.status).to.equal(403);
      });
      it('should allow requests from IPs in AllowList', async function () {
        const res = await proxyServer()
                            .put('/')
                            .set('Host', dropConduit)
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
        it('should silently drop if value does not match', async function () {
          const res = await proxyServer()
                        .post('/')
                        .set('Host', passConduit)
                        .send(request2);
          expect(res.status).to.equal(200);
        });
      });
    });
  });
  context('Testing Airtable Gateway', () => {
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
