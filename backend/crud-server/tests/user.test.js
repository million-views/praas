const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const server = require('../src/server');
const systemSettings = require('../../config').system.settings;

const expect = chai.expect;
chai.use(chaiHttp);

const jake = {
  firstName: 'Jake',
  lastName: 'Jacob',
  email: 'jake1000@jake.jake',
  password: 'jakejake',
};

const apiServer = server.app.listen(server.port);
const Api = () => chai.request(apiServer);

describe('Praas REST API', () => {
  before(async () => {
    // Create database with required tables
    await require('../src/createdb').dbSync;
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
          expect(workingCorsResponse).to.have.header(
            'access-control-allow-methods',
            'GET,HEAD,PUT,PATCH,POST,DELETE'
          );
        }
      }
    });
  });

  context('When not authenticated', () => {
    it('should allow registration of a new user', async () => {
      const res = await Api().post('/users').send(jake);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.all.keys([
        'id',
        'firstName',
        'lastName',
        'email',
        'token',
        'type',
        'expiresAt',
      ]);
      expect(res.body.email).to.equal(jake.email.toLowerCase());
    });

    it('should disallow user registration with e-mail that is already in use', async () => {
      const { firstName, lastName, email, password } = jake;
      const res = await Api().post('/users').send({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
      });
      expect(res.status).to.equal(422);
      const errors = res.body.errors;
      for (const error of Object.keys(errors)) {
        expect(errors[error]).to.match(/^email.*$|^unknown.*$/);
      }
    });

    it('should return errors for bad registration data of user', async () => {
      let res = await Api().post('/users').send({});
      expect(res.status).to.equal(422);

      res = await Api().post('/users').send({ firstName: '', email: '' });
      expect(res.status).to.equal(422);

      // empty body
      res = await Api().post('/users').send();
      expect(res.status).to.equal(422);
    });

    it('should not authenticate when user credentials are missing', async function () {
      const { email } = jake;
      const loginData = {
        username: email,
      };
      const res = await Api().post('/users/login').send(loginData);
      expect(res.status).to.equal(422);
      /* TODO: imporve express-validator errors */
      expect(res.body.errors[0].msg).to.equal('Passsword is required');
    });

    it('should not authenticate without valid user credentials', async function () {
      const { email } = jake;
      const loginData = {
        username: email,
        password: 'jake',
      };
      let res = await Api().post('/users/login').send(loginData);
      expect(res.status).to.equal(422);
      expect(res.body.errors[0].msg).to.equal(
        'Password should be atleast 8 characters long'
      );

      loginData.password = 'jake12345';

      res = await Api().post('/users/login').send(loginData);
      expect(res.status).to.equal(422);
      expect(res.body.errors.credentials).to.equal(
        'email or password is invalid'
      );
    });

    it('should authenticate with valid user credentials', async function () {
      const { email, password } = jake;
      const loginData = {
        username: email,
        password,
      };
      const res = await Api().post('/users/login').send(loginData);
      expect(res.status).to.equal(200);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.all.keys([
        'id',
        'firstName',
        'lastName',
        'email',
        'token',
        'type',
        'expiresAt',
      ]);
      expect(res.body.email).to.equal(email.toLowerCase());
    });
  });

  context('When authenticated', () => {
    let jakeUser;

    before('login and add return token', async function () {
      await Api().post('/users').send(jake);

      const res = await Api().post('/users/login').send({
        username: jake.email,
        password: jake.password,
      });
      jakeUser = res.body;

      const jwtDecoded = jwt.verify(jakeUser.token, systemSettings.secret);
      expect(jwtDecoded.email).to.equal(jakeUser.email);
      expect(jwtDecoded.id).to.equal(jakeUser.id);
    });

    after('logout', async () => {
      jakeUser.token = '';
    });

    it('should return logged in user information', async () => {
      const res = await Api()
        .get('/me')
        .set('Authorization', `Bearer ${jakeUser.token}`);
      expect(res.status).to.equal(200);
      expect(res.body.email).to.equal(jake.email);
    });

    it('should allow the user to update their information', async function () {
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: jake.email,
      };
      const res = await Api()
        .put(`/users/${jakeUser.id}`)
        .set('Authorization', `Token ${jakeUser.token}`)
        .send(user);
      expect(res.body).to.have.property('firstName');
      expect(res.body.firstName).to.equal(user.firstName);
      expect(res.body).to.have.property('lastName');
      expect(res.body.lastName).to.equal(user.lastName);
    });
  });
});
