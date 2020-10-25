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

  const allowListData = {
    ip: '127.0.0.1',
    active: true,
    description: 'This is an allowed IP',
  };

  context('When not authenticated', () => {
    it('should not allow to create an allowlist', async () => {
      const res = await Api().post('/allowlist').send(allowListData);
      expect(res.status).to.equal(401);
      expect(res.body.errors.authorization).to.equal(
        'token not found or malformed'
      );
    });

    it('should not allow to get allowlist', async () => {
      const res = await Api().get('/allowlist');
      expect(res.status).to.equal(401);
      expect(res.body.errors.authorization).to.equal(
        'token not found or malformed'
      );
    });

    it('should not allow to update allowlist', async () => {
      const res = await Api().put('/allowlist/1').send(allowListData);
      expect(res.status).to.equal(401);
      expect(res.body.errors.authorization).to.equal(
        'token not found or malformed'
      );
    });

    it('should not allow to delete allowlist', async () => {
      const res = await Api().delete('/allowlist/1');
      expect(res.status).to.equal(401);
      expect(res.body.errors.authorization).to.equal(
        'token not found or malformed'
      );
    });
  });

  context('When authenticated', () => {
    let jakeUser;
    let savedAllowlist;
    before('login and add return token', async function () {
      await Api().post('/users').send(jake);
      const resUser = await Api().post('/users/login').send({
        username: jake.email,
        password: jake.password,
      });
      jakeUser = resUser.body;

      const resAllowlist = await Api()
        .post('/allowlist')
        .set('Authorization', `Token ${jakeUser.token}`)
        .send(allowListData);

      savedAllowlist = resAllowlist.body;
    });

    after('logout', async () => {
      jakeUser.token = '';
    });

    it('should have user credientials', async () => {
      expect(jakeUser).to.have.property('token');
    });

    it('should allow the user to create an allowlist', async function () {
      const res = await Api()
        .post('/allowlist')
        .set('Authorization', `Token ${jakeUser.token}`)
        .send({
          ip: '127.0.0.2',
          active: true,
          description: 'This is another entry',
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.all.keys(
        'id',
        'ip',
        'active',
        'description',
        'accountId',
        'createdAt',
        'updatedAt'
      );

      expect(res.body.ip).to.equal('127.0.0.2');
    });

    it('should allow the user to update an allowlist', async function () {
      const res = await Api()
        .put(`/allowlist/${savedAllowlist.id}`)
        .set('Authorization', `Token ${jakeUser.token}`)
        .send({ ip: '127.0.0.3', active: true, description: 'Test message' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.all.keys(
        'id',
        'ip',
        'active',
        'description',
        'accountId',
        'createdAt',
        'updatedAt'
      );

      expect(res.body.ip).to.equal('127.0.0.3');
    });

    it('should allow the user to delete an allowlist', async function () {
      const res = await Api()
        .delete(`/allowlist/${savedAllowlist.id}`)
        .set('Authorization', `Token ${jakeUser.token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.all.keys('id', 'status');

      expect(res.body.status).to.equal('Deleted');
    });
  });
});
