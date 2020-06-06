const chai = require('chai');
const chaiHttp = require('chai-http');

const helpers = require('./lib/helpers');
const PraasAPI = require('./lib/praas');

const expect = chai.expect;
chai.use(chaiHttp);

const proxyServerURL = 'http://localhost:5000';
const proxyServer = () => chai.request(proxyServerURL);

let testConduitId;
const testConduit = {
  conduit: {
    description: 'Local proxy server for testing',
    hiddenFormField: [{ fieldName: 'campaign', policy: 'pass-if-match', include: false, value: 'consequatur' }],
    racm: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
    status: 'active',
    suri: 'https://api.airtable.com/v0/appGy4fvzLsmR7vTX/',
    suriApiKey: 'keyy97SC6NQE0uXJ8',
    suriObjectKey: 'Contacts',
    suriType: 'Airtable',
    throttle: '1',
    userId: '4',
    whitelist: [{ ip: '765.654.543.432', status: 'inactive', comment: 'Sample whitelist for testing' }],
  }
};

describe('Testing Proxy Server...', async () => {
  let user;
  context('Creating Conduit...', () => {
    // Login to CRUD Server
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
    // Setup conduit with test values
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

  context('Validating Request', () => {
    it('Should validate RACM', done => {
      PraasAPI.conduit
        .update({
          conduit: {
            id: testConduitId,
            racm: ['PUT', 'POST', 'PATCH', 'DELETE'],
          }
        })
        .then(() => proxyServer().get('/'))
        .then(resp => expect(resp.status).to.equal(405))
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
    it('Should validate Hidden Form Field', async () => {
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
