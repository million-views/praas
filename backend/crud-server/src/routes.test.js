const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const server = require('./server');
const helpers = require('../../lib/helpers');
const conf = require('../../config').test.settings;

const expect = chai.expect;
chai.use(chaiHttp);

const jake = {
  user: {
    firstName: 'Jake',
    lastName: 'Jacob',
    email: 'jake1000@jake.jake',
    password: 'jakejake',
  }
};

const apiServer = server.app.listen(server.port);
const Api = () => chai.request(apiServer);

// NOTE:
// reword/rephrase resource-error messages to fit this pattern
const ERROR_PATTERN =
  /^invalid.*$|^missing.*$|^unsupported.*$|cannot be blank|cannot be null/;

describe('Praas REST API', () => {
  before(async () => {
    console.log(`Praas API server is listening on port ${server.port}`);
  });

  after(async () => {
    console.log('Shutting down app server');
    apiServer.close();
  });

  context('Non-functional requirements', () => {
    it('include support for CORS', async () => {
      // NOTE: tests that you expect to fail require some dance
      // with chai-http at the moment in order to use async/await;
      // it is worth the trouble since writing positive test cases
      // using async/await is so much better than promise chaining...
      //
      // See:
      //   - https://github.com/chaijs/chai/issues/415
      //   - https://github.com/chaijs/chai-http/issues/75
      // and also contrast the positive test cases below from those
      // written for kanban-express-api using promise chaining.
      let workingCorsResponse = undefined;
      try {
        workingCorsResponse = await Api().options('/');
        expect(true).to.be.false; // fail here ...
      } catch ({ response }) {
        // ... in order to test here!
        if (workingCorsResponse) {
          expect(workingCorsResponse).to.have.status(204);
          expect(workingCorsResponse)
            .to.have
            .header(
              'access-control-allow-methods',
              'GET,HEAD,PUT,PATCH,POST,DELETE'
            );
        }
      }
    });
  });

  context('When not authenticated', () => {
    it('should allow registration of a new user', async () => {
      const { firstName, lastName, email, password } = jake.user;
      const res = await Api()
        .post('/users')
        .send({
          user: { firstName, lastName, email: email.toLowerCase(), password }
        });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('user');
      expect(res.body.user.email).to.equal(email.toLowerCase());
    });

    it('should disallow user registration with e-mail that is already in use', async () => {
      const { firstName, lastName, email, password } = jake.user;
      const res = await Api()
        .post('/users')
        .send({
          user: { firstName, lastName, email: email.toLowerCase(), password }
        });
      expect(res.status).to.equal(422);
      const errors = res.body.errors;
      for (const error of Object.keys(errors)) {
        expect(errors[error]).to.match(/^email.*$|^unknown.*$/);
      }
    });

    it('should return errors for bad registration data of user', async () => {
      let res = await Api()
        .post('/users')
        .send({ user: {} });
      expect(res.status).to.equal(422);

      // empty field values
      res = await Api()
        .post('/users')
        .send({ user: { firstName: '', email: '' } });
      expect(res.status).to.equal(422);

      // empty body
      res = await Api()
        .post('/users')
        .send();
      expect(res.status).to.equal(422);
    });
    it('should not authenticate when user credentials are missing', async function () {
      const user = { ...jake.user };
      delete user.password;
      const res = await Api()
        .post('/users/login')
        .send({ user: user });
      expect(res.status).to.equal(422);
      expect(res.body.errors.message).to.equal('Missing credentials');
    });
    it('should not authenticate without valid user credentials', async function () {
      const user = { ...jake.user };
      user.password = 'jake';
      const res = await Api()
        .post('/users/login')
        .send({ user: user });
      expect(res.status).to.equal(422);
      expect(res.body).to.have.property('errors');
      expect(res.body.errors.credentials).to.equal('email or password is invalid');
    });
    it('should authenticate with valid user credentials', async function () {
      const res = await Api()
        .post('/users/login')
        .send(jake);
      expect(res.status).to.equal(200);
      expect(res.body.user).to.have.property('firstName');
      expect(res.body.user).to.have.property('lastName');
      expect(res.body.user).to.have.property('email');
      expect(res.body.user).to.have.property('token');
    });
  });

  context('When authenticated', () => {
    let jakeUser, ctId1, ctId2 = undefined;

    before('login and add new service endpoints for PUT, PATCH and DELETE', async function () {
      // login
      const res = await Api()
        .post('/users/login')
        .send({
          user: {
            email: jake.user.email,
            password: jake.user.password
          }
        });
      jakeUser = res.body.user;
      // console.log('jakeUser: ', jakeUser);
      // WARN: this is only for debugging, real code should use
      // jwt.verify(...) in order to validate the signature with
      // a known secret.
      const jwtDecoded = jwt.decode(jakeUser.token);
      expect(jwtDecoded.email).to.equal(jakeUser.email);
      expect(jwtDecoded.id).to.equal(jakeUser.id);

      // create two conduits service endpoints
      const ct1 = helpers.fakeConduit();
      const res1 = await Api()
        .post('/conduits')
        .set('Authorization', `Token ${jakeUser.token}`)
        .send({ conduit: ct1 });
      expect(res1.status).to.equal(201);
      expect(res1.body).to.have.property('conduit');
      expect(res1.body.conduit).to.have.property('id');
      ctId1 = res1.body.conduit.id;
      expect(ctId1).to.be.not.null;

      const ct2 = helpers.fakeConduit();
      const res2 = await Api()
        .post('/conduits')
        .set('Authorization', `Token ${jakeUser.token}`)
        .send({ conduit: ct2 });
      expect(res2.status).to.equal(201);
      expect(res2.body).to.have.property('conduit');
      expect(res2.body.conduit).to.have.property('id');
      ctId2 = res2.body.conduit.id;
      expect(ctId2).to.be.not.null;
    });

    after('logout', async () => {
      jakeUser.token = '';
    });

    it('should return logged in user information', async () => {
      const res = await Api()
        .get('/user')
        .set('Authorization', `Token ${jakeUser.token}`);
      expect(res.body.user.email).to.equal(jake.user.email);
    });

    it('should allow the user to update their information', async function () {
      const userName = {
        firstName: 'John',
        lastName: 'Doe'
      };
      const res = await Api()
        .put('/user')
        .set('Authorization', `Token ${jakeUser.token}`)
        .send({ user: userName });
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('firstName');
      expect(res.body.user.firstName).to.equal(userName.firstName);
      expect(res.body.user).to.have.property('lastName');
      expect(res.body.user.lastName).to.equal(userName.lastName);
    });

    context('testing conduit creation (POST)...', () => {
      it('should not allow creating conduit when unauthorized', async function () {
        const res = await Api()
          .post(`/conduits`)
          .send(helpers.fakeConduit());
        expect(res.status).to.equal(401);
      });

      it('should reject requests with an empty body', async function () {
        const res = await Api()
          .post('/conduits')
          .set('Authorization', `Token ${jakeUser.token}`)
          .send();
        expect(res.status).to.equal(422);
        expect(res.error).to.not.be.false;
      });

      it('should reject requests without a conduit', async function () {
        const res = await Api()
          .post('/conduits')
          .set('Authorization', `Token ${jakeUser.token}`)
          .send({ conduit: {} });
        expect(res.status).to.equal(422);
        expect(res.error).to.not.be.false;
      });

      it('should reject requests without required fields', async function () {
        // check for Service URI ( SURI )
        const withoutSuri = helpers.fakeConduit();
        delete withoutSuri.suri;
        const res1 = await Api()
          .post('/conduits')
          .set('Authorization', `Token ${jakeUser.token}`)
          .send({ conduit: withoutSuri });
        expect(res1.status).to.equal(422);
        expect(res1.error).to.not.be.false;
        expect(Object.keys(res1.body.errors)).to.include('suri');
        expect(res1.body.errors.suri).to.match(ERROR_PATTERN);

        // check for Service Type ( suriType )
        const withoutSuriType = helpers.fakeConduit();
        delete withoutSuriType.suriType;
        const res2 = await Api()
          .post('/conduits')
          .set('Authorization', `Token ${jakeUser.token}`)
          .send({ conduit: withoutSuriType });
        expect(res2.status).to.equal(422);
        expect(res2.error).to.not.be.false;
        expect(Object.keys(res2.body.errors)).to.include('suriType');
        expect(res2.body.errors.suriType).to.match(ERROR_PATTERN);

        // check for Service API Key ( suriApiKey )
        const withoutSuriApiKey = helpers.fakeConduit();
        delete withoutSuriApiKey.suriApiKey;
        const res3 = await Api()
          .post('/conduits')
          .set('Authorization', `Token ${jakeUser.token}`)
          .send({ conduit: withoutSuriApiKey });
        expect(res3.status).to.equal(422);
        expect(res3.error).to.not.be.false;
        expect(Object.keys(res3.body.errors)).to.include('suriApiKey');
        expect(res3.body.errors.suriApiKey).to.match(ERROR_PATTERN);
      });

      it('should reject invalid SURI', async function () {
        const withInvalidSuri = helpers.fakeConduit();
        withInvalidSuri.suri = 'not-a-url';
        const res = await Api()
          .post(`/conduits`)
          .set('Authorization', `Token ${jakeUser.token}`)
          .send({ conduit: withInvalidSuri });
        expect(res.status).to.equal(422);
        expect(res.error).to.not.be.false;
        expect(res.body.errors[0].suri).to.match(ERROR_PATTERN);
      });

      it('should reject unsupported service types', async function () {
        const forUnsupportedService = helpers.fakeConduit();
        forUnsupportedService.suriType = 'random-service';
        const res = await Api()
          .post(`/conduits`)
          .set('Authorization', `Token ${jakeUser.token}`)
          .send({ conduit: forUnsupportedService });
        expect(res.status).to.equal(422);
        expect(res.error).to.not.be.false;
        expect(res.body.errors[0].suriType).to.match(ERROR_PATTERN);
      });

      it('should allow only valid HTTP methods in RACM', async function () {
        const withInvalidRacm = helpers.fakeConduit();
        withInvalidRacm.racm = ['HEAD', 'OPTIONS', 'CONNECT', 'TRACE'];
        const res = await Api()
          .post(`/conduits`)
          .set('Authorization', `Token ${jakeUser.token}`)
          .send({ conduit: withInvalidRacm });
        expect(res.status).to.equal(422);
        expect(res.error).to.not.be.false;
        expect(res.body.errors[0].racm).to.match(ERROR_PATTERN);
      });

      it('should reject invalid allowlist', async function () {
        const withInvalidAllowList = helpers.fakeConduit();
        withInvalidAllowList.allowlist = [{ ip: '123.456.789.0' }];
        const res = await Api()
          .post(`/conduits`)
          .set('Authorization', `Token ${jakeUser.token}`)
          .send({ conduit: withInvalidAllowList });
        expect(res.status).to.equal(422);
        expect(res.error).to.not.be.false;
        expect(res.body.errors[0].allowlist).to.match(ERROR_PATTERN);
      });

      it('should allow user to add new service endpoint', async () => {
        // Add 25 conduits for testing: update, delete and pagination.. since
        // a REST layer test should be isolated from the DATA layer, we don't
        // directly access the model to insert these records.
        const conduits = [];
        for (let i = 0, imax=conf.conduitsCount; i < imax; i++) {
          const res = await Api()
            .post('/conduits')
            .set('Authorization', `Token ${jakeUser.token}`)
            .send({ conduit: helpers.fakeConduit() });
          expect(res.status).to.equal(201);
          expect(res.body).to.have.property('conduit');
          expect(res.body.conduit).to.have.property('id');
          expect(res.body.conduit.id).to.be.not.null;
          conduits.push(res.body.conduit.id);
        }
      });
    });

    context('testing conduit fetch (GET)...', () => {
      it('should allow user to fetch a service endpoint', async () => {
        const res = await Api()
          .get(`/conduits/${ctId1}`)
          .set('Authorization', `Token ${jakeUser.token}`);
        expect(res.status).to.equal(200);
        expect(res.body.conduit).to.have.property('suriApiKey');
        expect(res.body.conduit).to.have.property('suriType');
        expect(res.body.conduit).to.have.property('suri');
        expect(res.body.conduit).to.have.property('curi');
        expect(res.body.conduit).to.have.property('allowlist');
        expect(res.body.conduit).to.have.property('racm');
        expect(res.body.conduit).to.have.property('throttle');
        expect(res.body.conduit).to.have.property('status');
      });

      it('should allow user to fetch multiple service endpoints', async () => {
        const res = await Api()
          .get('/conduits')
          .query({ start: ctId2+1, count: conf.conduitsPerPage })
          .set('Authorization', `Token ${jakeUser.token}`);
        expect(res.status).to.equal(200);
        expect(res.body.conduits.length).to.equal(conf.conduitsPerPage);
      });
    });

    context('the PUT method', async function () {
      it('should overwrite an existing record', async function () {
        const conduit = await Api()
          .get('/conduits/' + ctId1)
          .set('Authorization', `Token ${jakeUser.token}`);
        expect(conduit.body).to.haveOwnProperty('conduit');

        const putData = await helpers.fakeConduit();

        const res = await Api()
          .put('/conduits/' + ctId1)
          .set('Authorization', `Token ${jakeUser.token}`)
          .send({ conduit: putData });
        expect(res.status).to.equal(200);
        expect(res.body.conduit).to.not.eql(conduit.body.conduit);
        expect(res.body.conduit.suri).to.equal(putData.suri);
        expect(res.body.conduit.suriApiKey).to.equal(putData.suriApiKey);
        expect(res.body.conduit.suriObjectKey).to.equal(putData.suriObjectKey);
        expect(res.body.conduit.suriType).to.equal(putData.suriType);
        expect(res.body.conduit.allowlist).to.eql(putData.allowlist);
        expect(res.body.conduit.racm).to.eql(putData.racm);
        expect(res.body.conduit.hiddenFormField).to.eql(putData.hiddenFormField);
      });

      it('should not allow CURI to be updated', async function () {
        const conduit = { conduit: { curi: 'td-12345.trickle.cc' } };
        const res = await Api()
          .put(`/conduits/${ctId1}`)
          .set('Authorization', `Token ${jakeUser.token}`)
          .send(conduit);
        expect(res.status).to.equal(403);
      });
    });

    context('testing conduit update (PATCH)...', () => {
      it('should allow user to update service endpoint', async () => {
        const ctinactive = { conduit: { status: 'inactive' } };
        const res = await Api()
          .patch(`/conduits/${ctId2}`)
          .set('Authorization', `Token ${jakeUser.token}`)
          .send(ctinactive);
        expect(res.status).to.equal(200);

        const res2 = await Api()
          .get(`/conduits/${ctId2}`)
          .set('Authorization', `Token ${jakeUser.token}`);
        expect(res2.status).to.equal(200);
        expect(res2.body.conduit.status).to.equal('inactive');

        const ctactive = { conduit: { status: 'active' } };
        const res3 = await Api()
          .patch(`/conduits/${ctId1}`)
          .set('Authorization', `Token ${jakeUser.token}`)
          .send(ctactive);
        expect(res3.status).to.equal(200);

        const res4 = await Api()
          .get(`/conduits/${ctId1}`)
          .set('Authorization', `Token ${jakeUser.token}`);
        expect(res4.status).to.equal(200);
        expect(res4.body.conduit.status).to.equal('active');
      });

      it('should not allow curi to be updated by the service end point', async () => {
        const ct = { conduit: { curi: 'td-12345.trickle.cc' } };
        const res = await Api()
          .patch(`/conduits/${ctId1}`)
          .set('Authorization', `Token ${jakeUser.token}`)
          .send(ct);
        expect(res.status).to.equal(403);
      });
    });

    context('testing conduit removal (DELETE)...', () => {
      it('should allow user to remove inactive service endpoint', async () => {
        const res = await Api()
          .delete(`/conduits/${ctId2}`)
          .set('Authorization', `Token ${jakeUser.token}`);
        expect(res.status).to.equal(200);

        const res2 = await Api()
          .get(`/conduits/${ctId2}`)
          .set('Authorization', `Token ${jakeUser.token}`);
        expect(res2.status).to.equal(404);
      });
      it('should not allow user to remove active service endpoint', async () => {
        const res = await Api()
          .delete(`/conduits/${ctId1}`)
          .set('Authorization', `Token ${jakeUser.token}`);
        expect(res.status).to.equal(403);
      });
      it('should not be able to DELETE non-existant conduits', async () => {
        const res = await Api()
          .delete('/conduits/non-existant')
          .set('Authorization', `Token ${jakeUser.token}`);
        expect(res.status).to.equal(404);
      });
    });
  });
});
