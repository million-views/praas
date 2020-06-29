const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const server = require('./server');
const helpers = require('./lib/helpers');

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

    it('should disallow user registration with e-mail that is already in use', async () => {
      const { firstName, lastName, email, password } = jake.user;
      const res = await Api()
        .post('/users')
        .send({ user: { firstName, lastName, email: email.toLowerCase(), password } });
      expect(res.status).to.equal(422);
      const errors = res.body.errors;
      for (const error of Object.keys(errors)) {
        expect(errors[error]).to.match(/^email.*$|^unknown.*$/);
      }
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
            expect(res.body.error.errors[0].path).to.equal('suri');
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
            expect(res.body.error.errors[0].path).to.equal('suriType');
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

        context('testing suriObjectKey field...', () => {
          it('should not allow no suriObjectKey', async () => {
            const ct = await helpers.fakeConduit();
            delete ct.suriObjectKey;
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body.errors)).to.include('suriObjectKey');
          });

          it('should not allow undefined suriObjectKey', async () => {
            const ct = await helpers.fakeConduit();
            ct.suriObjectKey = undefined;
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body.errors)).to.include('suriObjectKey');
          });

          it('should not allow null suriObjectKey', async () => {
            const ct = await helpers.fakeConduit();
            ct.suriObjectKey = null;
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body.errors)).to.include('suriObjectKey');
          });

          it('should not allow empty suriObjectKey', async () => {
            const ct = await helpers.fakeConduit();
            ct.suriObjectKey = '';
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body.errors)).to.include('suriObjectKey');
          });

          it('should not allow blank suriObjectKey', async () => {
            const ct = await helpers.fakeConduit();
            ct.suriObjectKey = '    ';
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(Object.keys(res.body.errors)).to.include('suriObjectKey');
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
            expect(res.body.error.errors[0].path).to.equal('status');
          });

          it('should not allow empty status', async () => {
            const ct = await helpers.fakeConduit();
            ct.status = '';
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.error.errors[0].path).to.equal('status');
          });

          it('should allow only \'active\' or \'inactive\'', async () => {
            const ct = await helpers.fakeConduit();
            ct.status = 'random';
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.error.errors[0].path).to.equal('status');
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
            expect(res.body.error.errors[0].path).to.equal('throttle');
          });

          it('should not allow empty throttle', async () => {
            const ct = await helpers.fakeConduit();
            ct.throttle = '';
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.error.errors[0].path).to.equal('throttle');
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
            expect(res.body.error.errors[0].path).to.equal('racm');
          });

          it('should not allow empty racm', async () => {
            const ct = await helpers.fakeConduit();
            ct.racm = '';
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.error.errors[0].path).to.equal('racm');
          });

          it('should allow only valid HTTP methods', async () => {
            const ct = await helpers.fakeConduit();
            ct.racm = ['HEAD', 'OPTIONS', 'CONNECT', 'TRACE'];
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.error.errors[0].path).to.equal('racm');
          });
        });

        context('testing whitelist field...', () => {
          it('should not allow null whitelist', async () => {
            const ct = await helpers.fakeConduit();
            ct.whitelist = null;
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.error.errors[0].path).to.equal('whitelist');
          });

          it('should not allow empty whitelist', async () => {
            const ct = await helpers.fakeConduit();
            ct.whitelist = '';
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.error.errors[0].path).to.equal('whitelist');
          });

          it('should allow only valid whitelist properties', async () => {
            const ct = await helpers.fakeConduit();
            ct.whitelist = [{ random: 'random' }];
            const res = await Api()
              .post(`/conduits`)
              .set('Authorization', `Token ${jakeUser.token}`)
              .send({ conduit: ct });
            expect(res.status).to.equal(422);
            expect(res.body.error.errors[0].path).to.equal('whitelist');
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

        it('should set default racm to [] if no racm is set', async () => {
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
          expect(res2.body.conduit.racm).to.eql([]);
        });

        it('should set default racm to [] if racm is undefined', async () => {
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
          expect(res2.body.conduit.racm).to.eql([]);
        });

        it('should set default whitelist to [] if no whitelist is set', async () => {
          const ct = await helpers.fakeConduit();
          delete ct.whitelist;
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
          expect(res2.body.conduit.whitelist).to.eql([]);
        });

        it('should set default whitelist to [] if whitelist is undefined', async () => {
          const ct = await helpers.fakeConduit();
          ct.whitelist = undefined;
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
          expect(res2.body.conduit.whitelist).to.eql([]);
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

      it('should allow user to add new service endpoint', async () => {
        // Create two conduits, one for update and one for delete
        // as tests are running async, update fails if record is deleted ahead
        const ct1 = helpers.fakeConduit();
        const res1 = await Api()
          .post('/conduits')
          .set('Authorization', `Token ${jakeUser.token}`)
          .send({ conduit: ct1 });
        expect(res1.status).to.equal(201);
        expect(res1.body.conduit).to.have.property('id');
        ctId1 = res1.body.conduit.id;
        expect(ctId1).to.be.not.null;

        const ct2 = helpers.fakeConduit();
        const res2 = await Api()
          .post('/conduits')
          .set('Authorization', `Token ${jakeUser.token}`)
          .send({ conduit: ct2 });
        expect(res2.status).to.equal(201);
        expect(res2.body.conduit).to.have.property('id');
        ctId2 = res2.body.conduit.id;
        expect(ctId2).to.be.not.null;
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
        expect(res.body.conduit).to.have.property('whitelist');
        expect(res.body.conduit).to.have.property('racm');
        expect(res.body.conduit).to.have.property('throttle');
        expect(res.body.conduit).to.have.property('status');
      });

      it('should allow user to fetch multiple service endpoints', async () => {
        await helpers.generateConduits(jakeUser.id, 20);
        const res = await Api()
          .get('/conduits')
          .query({ start: '520', count: '10' })
          .set('Authorization', `Token ${jakeUser.token}`);
        expect(res.status).to.equal(200);
        expect(res.body.conduits.length).to.equal(10);
      });
    });

    context('testing conduit update (PATCH)...', () => {
      it('should allow user to update service endpoint', async () => {
        const ct = { conduit: { status: 'inactive' } };
        const res = await Api()
          .patch(`/conduits/${ctId1}`)
          .set('Authorization', `Token ${jakeUser.token}`)
          .send(ct);
        expect(res.status).to.equal(200);

        const res2 = await Api()
          .get(`/conduits/${ctId1}`)
          .set('Authorization', `Token ${jakeUser.token}`);
        expect(res2.status).to.equal(200);
        expect(res2.body.conduit.status).to.equal('inactive');
      });

      it('should not allow curi to be updated by the service end point', async () => {
        const ct = { conduit: { curi: 'td-12345.trickle.cc' } };
        const res = await Api()
          .patch(`/conduits/${ctId1}`)
          .set('Authorization', `Token ${jakeUser.token}`)
          .send(ct);
        expect(res.status).to.equal(400);
      });
    });

    context('testing conduit removal (DELETE)...', () => {
      it('should allow user to remove service endpoint', async () => {
        const res = await Api()
          .delete(`/conduits/${ctId2}`)
          .set('Authorization', `Token ${jakeUser.token}`);
        expect(res.status).to.equal(200);

        const res2 = await Api()
          .get(`/conduits/${ctId2}`)
          .set('Authorization', `Token ${jakeUser.token}`);
        expect(res2.status).to.equal(404);
      });
    });
  });
});
