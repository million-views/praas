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

// Test request to fail pass-if-match
const testReq1body = {
  records: [{
    fields: {
      name: 'fname1 lname1',
      email: 'fname1@lname1.com',
    }
  }],
};

// Test request to pass pass-if-match and include=true
const testReq2body = {
  records: [{
    fields: {
      name: 'fname2 lname2',
      email: 'fname2@lname2.com',
      campaign: 'BOGO June2020',
    }
  }],
};

// Conduit hff to test include=false
const hff2 = {
  hiddenFormField: [{
    fieldName: 'campaign',
    policy: 'pass-if-match',
    include: false,
    value: 'CORONA 10',
  }],
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
    context.skip('validate allowList', () => {
      it('should reject requests from IPs not in AllowList');
      it('should allow requests from IPs in AllowList');
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
      it('Should reject if pass-if-match doesnt match', done => {
        proxyServer().post('/').send(testReq1body)
          .then(resp => {
            expect(resp.status).to.equal(200);
            done();
          })
          .catch(error => console.log('unexpected... ', error));
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
