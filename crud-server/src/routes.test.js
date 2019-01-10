const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
// const snapshot = require('snap-shot-it');
const server = require('./server');
const helpers = require('./lib/helpers');

const expect = chai.expect;
chai.use(chaiHttp);

const jake = {
  'user': {
    'firstName': 'Jake',
    'lastName': 'Jacob',
    'email': 'jake1000@jake.jake',
    'password': 'jakejake',
  }
};

let curi, curiId;

const addConduit = helpers.fakeConduit();
const updConduit = {
  status: 'Inactive',
};

const User = (res) => res.body.user;

const apiServer = server.app.listen(server.port);
const Api = () => chai.request(apiServer);

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
          // expect(workingCorsResponse).to.have.header('access-control-allow-credentials', 'true');
          expect(workingCorsResponse).to.have.header('access-control-allow-methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
        }
      }
    });
  });

  context('When not authenticated', () => {
    it('should allow registration of a new user', async () => {
      const { firstName, lastName, email, password } = jake.user;
      const res = await Api()
        .post('/users')
        .send({ user: { firstName, lastName, email: email.toLowerCase(), password } });
      expect(User(res).email).to.equal(email.toLowerCase());
    });

    it('should return errors for bad registration data of user', async () => {
      // TODO:
      // - add a test case for empty body submission
      // - add test case variations for empty fields vs fields with
      //   undefined values
      const res = await Api()
        .post('/users')
        .send({ user: {} });
      expect(res.status).to.equal(422);
    });
  });

  context('When authenticated', () => {
    let jakeUser = undefined;

    before('login', async () => {
      const res = await Api()
        .post('/users/login')
        .send({
          user: {
            email: jake.user.email,
            password: jake.user.password
          }
        });
      jakeUser = User(res);
      // WARN: this is only for debugging, real code should use
      // jwt.verify(...) in order to validate the signature with
      // a known secret.
      const jwtDecoded = jwt.decode(jakeUser.token);
      expect(jwtDecoded.email).to.equal(jakeUser.email);
      expect(jwtDecoded.id).to.equal(jakeUser.id);
    });

    after('logout', async () => {
      jakeUser.token = '';
    });

    it('should return logged in user information', async () => {
      const res = await Api()
        .get('/user')
        .set('Authorization', `Token ${jakeUser.token}`);
      expect(User(res).email).to.equal(jake.user.email);
    });

    it('should allow user to add new service endpoint', async () => {
      const res = await Api()
        .post('/conduits')
        .set('Authorization', `Token ${jakeUser.token}`)
        .send(addConduit);
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('curi');
      curi = res.body.curi;
      curiId = curi.match(/(?:(?!\/).(?!\/))+$/);
    });

    it('should allow user to fetch a service endpoint', async () => {
      const res = await Api()
        .get(`/conduits/${curiId}`)
        .set('Authorization', `Token ${jakeUser.token}`);
      expect(res.status).to.equal(200);
      expect(res.body.curi).to.equal(curi);
      expect(res.body).to.have.property('suriApiKey');
      expect(res.body).to.have.property('suriType');
      expect(res.body).to.have.property('suri');
      expect(res.body).to.have.property('whitelist');
      expect(res.body).to.have.property('racm');
      expect(res.body).to.have.property('throttle');
      expect(res.body).to.have.property('status');
    });

    it('should allow user to remove service endpoint', async () => {
      const res = await Api()
        .delete(`/conduits/${curiId}`)
        .set('Authorization', `Token ${jakeUser.token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.null;
    });

    it('should allow user to update service endpoint', async () => {
      const res = await Api()
        .patch(`/conduits/${curiId}`)
        .set('Authorization', `Token ${jakeUser.token}`)
        .send(updConduit);
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('Inactive');
      expect(res.body).to.have.property('suriApiKey');
      expect(res.body).to.have.property('suriType');
      expect(res.body).to.have.property('suri');
      expect(res.body).to.have.property('whitelist');
      expect(res.body).to.have.property('racm');
      expect(res.body).to.have.property('throttle');
      expect(res.body).to.have.property('status');
    });
  });
});
