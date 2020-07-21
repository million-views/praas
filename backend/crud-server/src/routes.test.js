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

const User = (res) => res.body.user;

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
      expect(User(res).email).to.equal(email.toLowerCase());
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
      // console.log('jakeUser: ', jakeUser);
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

    let ctId1, ctId2;

    context('testing conduit creation (POST)...', () => {
      context('testing 401 authentication error', () => {
        it('should not allow creating conduit when unauthorized', async () => {
          const ct = await helpers.fakeConduit();
          const res = await Api()
            .post(`/conduits`)
            .send(ct);
          expect(res.status).to.equal(401);
        });
      });

      context('testing 422 Unprocessable Entity errors', () => {
        context('testing conduit body...', () => {
          it('should not allow no conduit', async () => {
            const ct = {};
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send(ct);
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body)).to.include('errors');
          });

          it('should not allow empty conduit', async () => {
            const ct = { conduit: {} };
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send(ct);
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body)).to.include('errors');
          });

          it('should not allow undefined body', async () => {
            const ct = undefined;
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send(ct);
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body)).to.include('errors');
          });

          it('should not allow undefined conduit', async () => {
            const ct = { conduit: undefined };
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send(ct);
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body)).to.include('errors');
          });

          it('should not allow null body', async () => {
            const ct = null;
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send(ct);
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body)).to.include('errors');
          });

          it('should not allow null conduit', async () => {
            const ct = { conduit: null };
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send(ct);
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body)).to.include('errors');
          });
        });

        context('testing suri field...', () => {
          it('should not allow no suri', async () => {
            const ct = await helpers.fakeConduit();
            delete ct.suri;
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body.errors)).to.include('suri');
          });

          it('should not allow undefined suri', async () => {
            const ct = await helpers.fakeConduit();
            ct.suri = undefined;
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body.errors)).to.include('suri');
          });

          it('should not allow null suri', async () => {
            const ct = await helpers.fakeConduit();
            ct.suri = null;
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body.errors)).to.include('suri');
          });

          it('should not allow empty suri', async () => {
            const ct = await helpers.fakeConduit();
            ct.suri = '';
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body.errors)).to.include('suri');
          });

          it('should not allow non-url suri', async () => {
            const ct = await helpers.fakeConduit();
            ct.suri = 'not-in-url-format';
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.errors[0].suri).to.match(ERROR_PATTERN);
          });
        });

        context('testing suriType field...', () => {
          it('should not allow no suriType', async () => {
            const ct = await helpers.fakeConduit();
            delete ct.suriType;
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body.errors)).to.include('suriType');
          });

          it('should not allow undefined suriType', async () => {
            const ct = await helpers.fakeConduit();
            ct.suriType = undefined;
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body.errors)).to.include('suriType');
          });

          it('should not allow null suriType', async () => {
            const ct = await helpers.fakeConduit();
            ct.suriType = null;
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body.errors)).to.include('suriType');
          });

          it('should not allow empty suriType', async () => {
            const ct = await helpers.fakeConduit();
            ct.suriType = '';
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body.errors)).to.include('suriType');
          });

          it('should reject unsupported service types', async () => {
            const ct = await helpers.fakeConduit();
            ct.suriType = 'random';
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.errors[0].suriType).to.match(ERROR_PATTERN);
          });
        });

        context('testing suriApiKey field...', () => {
          it('should not allow no SuriAPIKey', async () => {
            const ct = await helpers.fakeConduit();
            delete ct.suriApiKey;
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body.errors)).to.include('suriApiKey');
          });

          it('should not allow undefined SuriAPIKey', async () => {
            const ct = await helpers.fakeConduit();
            ct.suriApiKey = undefined;
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body.errors)).to.include('suriApiKey');
          });

          it('should not allow null SuriAPIKey', async () => {
            const ct = await helpers.fakeConduit();
            ct.suriApiKey = null;
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body.errors)).to.include('suriApiKey');
          });

          it('should not allow empty SuriAPIKey', async () => {
            const ct = await helpers.fakeConduit();
            ct.suriApiKey = '';
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body.errors)).to.include('suriApiKey');
          });

          it('should not allow blank SuriAPIKey', async () => {
            const ct = await helpers.fakeConduit();
            ct.suriApiKey = '    ';
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body.errors)).to.include('suriApiKey');
          });
        });

        context('testing status field...', () => {
          it('should not allow null status', async () => {
            const ct = await helpers.fakeConduit();
            ct.status = null;
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.errors[0].status).to.match(ERROR_PATTERN);
          });

          it('should not allow empty status', async () => {
            const ct = await helpers.fakeConduit();
            ct.status = '';
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.errors[0].status).to.match(ERROR_PATTERN);
          });

          it('should allow only \'active\' or \'inactive\'', async () => {
            const ct = await helpers.fakeConduit();
            ct.status = 'random';
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.errors[0].status).to.match(ERROR_PATTERN);
          });
        });

        context('testing throttle field...', () => {
          it('should not allow null throttle', async () => {
            const ct = await helpers.fakeConduit();
            ct.throttle = null;
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.errors[0].throttle).to.match(ERROR_PATTERN);
          });

          it('should not allow empty throttle', async () => {
            const ct = await helpers.fakeConduit();
            ct.throttle = '';
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.errors[0].throttle).to.match(ERROR_PATTERN);
          });

          it('should allow only \'true\' or \'false\'', async () => {
            const ct = await helpers.fakeConduit();
            ct.throttle = 'random';
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
          });
        });

        context('testing racm field...', () => {
          it('should not allow null racm', async () => {
            const ct = await helpers.fakeConduit();
            ct.racm = null;
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.errors[0].racm).to.match(ERROR_PATTERN);
          });

          it('should not allow empty racm', async () => {
            const ct = await helpers.fakeConduit();
            ct.racm = '';
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.errors[0].racm).to.match(ERROR_PATTERN);
          });

          it('should allow only valid HTTP methods', async () => {
            const ct = await helpers.fakeConduit();
            ct.racm = ['HEAD', 'OPTIONS', 'CONNECT', 'TRACE'];
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.errors[0].racm).to.match(ERROR_PATTERN);
          });
        });

        context('testing allowlist field...', () => {
          it('should not allow null allowlist', async () => {
            const ct = await helpers.fakeConduit();
            ct.allowlist = null;
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.errors[0].allowlist).to.match(ERROR_PATTERN);
          });

          it('should not allow empty allowlist', async () => {
            const ct = await helpers.fakeConduit();
            ct.allowlist = '';
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.errors[0].allowlist).to.match(ERROR_PATTERN);
          });

          it('should not allow invalid IP in allowlist', async function () {
            const conduit = await helpers.fakeConduit();
            conduit.allowlist = [{
              ip: '123.456.789.0',
              status: 'active'
            }];
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: conduit });
            expect(res.status).to.equal(422);
            expect(res.body.errors[0].allowlist).to.match(ERROR_PATTERN);
          });

          it('should allow only valid allowlist properties', async () => {
            const ct = await helpers.fakeConduit();
            ct.allowlist = [{ random: 'random' }];
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.errors[0].allowlist).to.match(ERROR_PATTERN);
          });
        });

        context('testing hiddenFormField field...', () => {
        });
      });

      context('testing default values', () => {
        it('should set default status to \'inactive\' if no status is set', async () => {
          const ct = await helpers.fakeConduit();
          delete ct.status;
          const res = await Api()
            .post(`/conduits`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send({ conduit: ct });
          expect(res.status).to.equal(201);
          const res2 = await Api()
            .get(`/conduits/${res.body.conduit.id}`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send();
          expect(res2.status).to.equal(200);
          expect(res2.body.conduit.status).to.equal('inactive');
        });

        it('should set default status to \'inactive\' if status is undefined', async () => {
          const ct = await helpers.fakeConduit();
          ct.status = undefined;
          const res = await Api()
            .post(`/conduits`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send({ conduit: ct });
          expect(res.status).to.equal(201);
          const res2 = await Api()
            .get(`/conduits/${res.body.conduit.id}`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send();
          expect(res2.status).to.equal(200);
          expect(res2.body.conduit.status).to.equal('inactive');
        });

        it('should set default throttle to \'true\' if no throttle is set', async () => {
          const ct = await helpers.fakeConduit();
          delete ct.throttle;
          const res = await Api()
            .post(`/conduits`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send({ conduit: ct });
          expect(res.status).to.equal(201);
          const res2 = await Api()
            .get(`/conduits/${res.body.conduit.id}`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send();
          expect(res2.status).to.equal(200);
          expect(res2.body.conduit.throttle).to.equal(true);
        });

        it('should set default throttle to \'true\' if throttle is undefined', async () => {
          const ct = await helpers.fakeConduit();
          ct.throttle = undefined;
          const res = await Api()
            .post(`/conduits`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send({ conduit: ct });
          expect(res.status).to.equal(201);
          const res2 = await Api()
            .get(`/conduits/${res.body.conduit.id}`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send();
          expect(res2.status).to.equal(200);
          expect(res2.body.conduit.throttle).to.equal(true);
        });

        it('should set default racm to ["GET"] if no racm is set', async () => {
          const ct = await helpers.fakeConduit();
          delete ct.racm;
          const res = await Api()
            .post(`/conduits`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send({ conduit: ct });
          expect(res.status).to.equal(201);
          const res2 = await Api()
            .get(`/conduits/${res.body.conduit.id}`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send();
          expect(res2.status).to.equal(200);
          expect(res2.body.conduit.racm).to.eql(['GET']);
        });

        it('should set default racm to ["GET"] if racm is undefined', async () => {
          const ct = await helpers.fakeConduit();
          ct.racm = undefined;
          const res = await Api()
            .post(`/conduits`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send({ conduit: ct });
          expect(res.status).to.equal(201);
          const res2 = await Api()
            .get(`/conduits/${res.body.conduit.id}`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send();
          expect(res2.status).to.equal(200);
          expect(res2.body.conduit.racm).to.eql(['GET']);
        });

        it('should set default allowlist to [] if no allowlist is set', async () => {
          const ct = await helpers.fakeConduit();
          delete ct.allowlist;
          const res = await Api()
            .post(`/conduits`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send({ conduit: ct });
          expect(res.status).to.equal(201);
          const res2 = await Api()
            .get(`/conduits/${res.body.conduit.id}`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send();
          expect(res2.status).to.equal(200);
          expect(res2.body.conduit.allowlist).to.eql([]);
        });

        it('should set default allowlist to [] if allowlist is undefined', async () => {
          const ct = await helpers.fakeConduit();
          ct.allowlist = undefined;
          const res = await Api()
            .post(`/conduits`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send({ conduit: ct });
          expect(res.status).to.equal(201);
          const res2 = await Api()
            .get(`/conduits/${res.body.conduit.id}`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send();
          expect(res2.status).to.equal(200);
          expect(res2.body.conduit.allowlist).to.eql([]);
        });

        it('should set default HFF to [] if no HFF is set', async () => {
          const ct = await helpers.fakeConduit();
          delete ct.hiddenFormField;
          const res = await Api()
            .post(`/conduits`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send({ conduit: ct });
          expect(res.status).to.equal(201);
          const res2 = await Api()
            .get(`/conduits/${res.body.conduit.id}`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send();
          expect(res2.status).to.equal(200);
          expect(res2.body.conduit.hiddenFormField).to.eql([]);
        });

        it('should set default HFF to [] if HFF is undefined', async () => {
          const ct = await helpers.fakeConduit();
          ct.hiddenFormField = undefined;
          const res = await Api()
            .post(`/conduits`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send({ conduit: ct });
          expect(res.status).to.equal(201);
          const res2 = await Api()
            .get(`/conduits/${res.body.conduit.id}`)
            .set('Authorization', `Token ${jakeUser.token}`)
            .send();
          expect(res2.status).to.equal(200);
          expect(res2.body.conduit.hiddenFormField).to.eql([]);
        });
      });

      it('should allow user to add new conduits', async () => {
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
          expect(res.body.conduit).to.have.property('id');
          expect(res.body.conduit.id).to.be.not.null;
          conduits.push(res.body.conduit.id);
        }

        [ctId1, ctId2] = conduits;
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
