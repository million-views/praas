const chai = require('chai');
const chaiHttp = require('chai-http');

const helpers = require('./lib/helpers');
const PraasAPI = require('./lib/praas');

const expect = chai.expect;
chai.use(chaiHttp);

const proxyServerURL = 'http://localhost:5000';
const proxyServer = () => chai.request(proxyServerURL);

// Test Data
let testConduitId;
const testConduit = {
  conduit: {
    description: 'Local proxy server for testing',
    racm: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
    status: 'active',
    suri: 'https://api.airtable.com/v0/appGy4fvzLsmR7vTX',
    suriApiKey: 'keyy97SC6NQE0uXJ8',
    suriObjectKey: 'Contacts',
    suriType: 'Airtable',
    throttle: '1',
    userId: '4',
  }
};

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
  let user;
  context('Creating Conduit...', () => {
    it('Should login to CRUD Server as Proxy User', done => {
      PraasAPI.user
        .login(helpers.getProxyServerCredentials())
        .then(async data => {
          user = data.user;
          global.localStorage.setItem('user', JSON.stringify({ ...user }));
          done();
        })
        .catch(error => console.log('unexpected... ', error));
    });
    it('Should setup test Conduit', done => {
      PraasAPI.conduit
        .list(user.id)
        .then(list => {
          return list.conduits.find(it => it.curi === proxyServerURL);
        })
        .then(cdt => {
          if (cdt && cdt.id) return ({ conduit: cdt });
          else return PraasAPI.conduit.add(testConduit);
        })
        .then(cdt => {
          return PraasAPI.conduit.update({
            conduit: {
              id: cdt.conduit.id,
              curi: proxyServerURL,
              ...testConduit,
            }
          });
        })
        .then(cdt => {
          expect(cdt.conduit).to.haveOwnProperty('id');
          expect(cdt.conduit.curi).to.equal(proxyServerURL);
          expect(cdt.conduit.suri).to.equal(testConduit.conduit.suri);
          expect(cdt.conduit.suriApiKey).to.equal(testConduit.conduit.suriApiKey);
          expect(cdt.conduit.suriObjectKey).to.equal(testConduit.conduit.suriObjectKey);
          testConduitId = cdt.conduit.id;
          done();
        })
        .catch(error => console.log('unexpected... ', error));
    });
  });

  context('Validate incoming request', () => {
    context('Validating RACM', () => {
      it('Should reject method not present in RACM list', done => {
        PraasAPI.conduit
          .update({
            conduit: {
              id: testConduitId,
              racm: ['PUT', 'POST', 'PATCH', 'DELETE'],
            }
          })
          .then(() => proxyServer().get('/').set('Host', 'http:1'))
          .then(resp => {
            expect(resp.status).to.equal(405);
            done();
          })
          .catch(error => console.log('unexpected... ', error));
      });
      it('Should allow method present in RACM list', done => {
        PraasAPI.conduit
          .update({
            conduit: {
              id: testConduitId,
              racm: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
            }
          })
          .then(() => proxyServer().get('/').set('Host', 'http:2'))
          .then(resp => {
            expect(resp.status).not.to.equal(405);
            done();
          })
          .catch(error => console.log('unexpected... ', error));
      });
    });
    context('Validating Hidden Form Field', () => {
      it('Should reject if pass-if-match doesnt match', done => {
        PraasAPI.conduit
          .update({
            conduit: {
              id: testConduitId,
              ...hff1,
            }
          })
          .then(() => proxyServer().post('/').send(testReq1body))
          .then(resp => {
            expect(resp.status).to.equal(200);

          })
          .then(() => {
            PraasAPI.conduit
              .update({
                conduit: {
                  id: testConduitId,
                  racm: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
                }
              });
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
