const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/server');

const expect = chai.expect;
chai.use(chaiHttp);

const jake = {
  firstName: 'Jake',
  lastName: 'Jacob',
  email: 'jake1000@jake.jake',
  password: 'jakejake',
};

const Api = () => chai.request(server.app);

/** TODO:
 * Error cases
 * Cross account access
 */
describe('Praas REST API', () => {
  before(async () => {
    // Create database with required tables
    await require('../src/createdb').dbSync;
    console.log(`Praas API server is listening on port ${server.port}`);
  });

  after(async () => {
    console.log('Shutting down app server');
    // server.app.close();
  });

  const secretData = {
    alias: 'Sample Secret',
    token: 'THISISHIGLYSECRET',
  };

  context('When not authenticated', () => {
    it('should not allow to create a secret', async () => {
      const res = await Api().post('/secrets').send(secretData);
      expect(res.status).to.equal(401);
      expect(res.body.errors.authorization).to.equal(
        'token not found or malformed'
      );
    });

    it('should not allow to get secrets', async () => {
      const res = await Api().get('/secrets');
      expect(res.status).to.equal(401);
      expect(res.body.errors.authorization).to.equal(
        'token not found or malformed'
      );
    });

    it('should not allow to update secrets', async () => {
      const res = await Api().put('/secrets/1').send(secretData);
      expect(res.status).to.equal(401);
      expect(res.body.errors.authorization).to.equal(
        'token not found or malformed'
      );
    });

    it('should not allow to delete secrets', async () => {
      const res = await Api().delete('/secrets/1');
      expect(res.status).to.equal(401);
      expect(res.body.errors.authorization).to.equal(
        'token not found or malformed'
      );
    });
  });

  context('When authenticated', () => {
    let jakeUser;
    let savedSecret;
    before('login and add return token', async function () {
      await Api().post('/users').send(jake);
      const resUser = await Api().post('/users/login').send({
        username: jake.email,
        password: jake.password,
      });
      jakeUser = resUser.body;

      const resSecret = await Api()
        .post('/secrets')
        .set('Authorization', `Token ${jakeUser.token}`)
        .send(secretData);

      savedSecret = resSecret.body;
    });

    after('logout', async () => {
      jakeUser.token = '';
    });

    it('should have user credientials', async () => {
      expect(jakeUser).to.have.property('token');
    });

    it('should allow the user to create a secret', async function () {
      const res = await Api()
        .post('/secrets')
        .set('Authorization', `Token ${jakeUser.token}`)
        .send({
          alias: 'Test',
          token: 'Test',
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.all.keys(
        'id',
        'alias',
        'accountId',
        'createdAt',
        'updatedAt'
      );

      expect(res.body.alias).to.equal('Test');
    });

    it('should allow the user to update a secret', async function () {
      const res = await Api()
        .put(`/secrets/${savedSecret.id}`)
        .set('Authorization', `Token ${jakeUser.token}`)
        .send({ alias: 'Test secret', token: '1234' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.all.keys(
        'id',
        'alias',
        'accountId',
        'createdAt',
        'updatedAt'
      );

      expect(res.body.alias).to.equal('Test secret');
    });

    it('should allow the user to delete a secret', async function () {
      const resw = await Api()
        .post('/secrets')
        .set('Authorization', `Token ${jakeUser.token}`)
        .send(secretData);

      savedSecret = resw.body;

      const res = await Api()
        .delete(`/secrets/${savedSecret.id}`)
        .set('Authorization', `Token ${jakeUser.token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.all.keys('id', 'status');

      expect(res.body.status).to.equal('Deleted');
    });
  });
});
