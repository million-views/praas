const chai = require('chai');
const chaiHttp = require('chai-http');
const allowlist = require('../src/models/allowlist');
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

  const conduitData = {
    resourceType: 'airtable',
    objectPath: 'hello2',
    active: true,
    description: 'Test',
    accessToken: 1,
    racm: ['GET'],
    allowlist: [5, 3, 2],
  };

  context('When not authenticated', () => {
    it('should not allow to create a conduit', async () => {
      const res = await Api().post('/conduits').send(conduitData);
      expect(res.status).to.equal(401);
      expect(res.body.errors.authorization).to.equal(
        'token not found or malformed'
      );
    });

    it('should not allow to get conduits', async () => {
      const res = await Api().get('/conduits');
      expect(res.status).to.equal(401);
      expect(res.body.errors.authorization).to.equal(
        'token not found or malformed'
      );
    });

    it('should not allow to update conduits', async () => {
      const res = await Api().put('/conduits/1').send(conduitData);
      expect(res.status).to.equal(401);
      expect(res.body.errors.authorization).to.equal(
        'token not found or malformed'
      );
    });

    it('should not allow to delete conduits', async () => {
      const res = await Api().delete('/conduits/1');
      expect(res.status).to.equal(401);
      expect(res.body.errors.authorization).to.equal(
        'token not found or malformed'
      );
    });
  });

  context('When authenticated', () => {
    let jakeUser;
    let savedConduit;
    let savedSecret;
    let savedAllowlist;
    before('login and add return token', async function () {
      try {
        await Api().post('/users').send(jake);
        const resUser = await Api().post('/users/login').send({
          username: jake.email,
          password: jake.password,
        });
        jakeUser = resUser.body;

        const resSecret = await Api()
          .post('/secrets')
          .set('Authorization', `Token ${jakeUser.token}`)
          .send({
            alias: 'Test secret',
            token: 'THISISSECRET',
          });

        const resAllowlist = await Api()
          .post('/allowlist')
          .set('Authorization', `Token ${jakeUser.token}`)
          .send({
            ip: '127.0.0.1',
            active: true,
            description: 'This is an allowlist entry',
          });

        savedSecret = resSecret.body;
        savedAllowlist = resAllowlist.body;

        const resConduit = await Api()
          .post('/conduits')
          .set('Authorization', `Token ${jakeUser.token}`)
          .send({
            ...conduitData,
            allowlist: [savedAllowlist.id],
            accessToken: savedSecret.id,
          });

        savedConduit = resConduit.body;
      } catch (err) {}
    });

    after('logout', async () => {
      jakeUser.token = '';
    });

    it('should have user credientials', async () => {
      expect(jakeUser).to.have.property('token');
    });

    it('should get all conduits', async () => {
      const res = await Api()
        .get('/conduits')
        .set('Authorization', `Token ${jakeUser.token}`);

      expect(res.status).to.equal(200);
    });

    it('should allow the user to create a conduit', async function () {
      const res = await Api()
        .post('/conduits')
        .set('Authorization', `Token ${jakeUser.token}`)
        .send({
          resourceType: 'airtable',
          objectPath: 'hello1',
          active: true,
          description: 'Test 0',
          accessToken: savedSecret.id,
          racm: ['GET'],
          allowlist: [savedAllowlist.id],
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.all.keys(
        'id',
        'curi',
        'objectPath',
        'resourceType',
        'racm',
        'accessToken',
        'allowlist',
        'active',
        'description',
        'accountId',
        'createdAt',
        'updatedAt'
      );

      expect(res.body.objectPath).to.equal('hello1');
    });

    it('should allow the user to update a conduit', async function () {
      const res = await Api()
        .put(`/conduits/${savedConduit.id}`)
        .set('Authorization', `Token ${jakeUser.token}`)
        .send({
          ...conduitData,
          objectPath: 'test',
          allowlist: [savedAllowlist.id],
          accessToken: savedSecret.id,
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.all.keys(
        'id',
        'curi',
        'objectPath',
        'resourceType',
        'racm',
        'accessToken',
        'allowlist',
        'active',
        'description',
        'accountId',
        'createdAt',
        'updatedAt'
      );

      expect(res.body.objectPath).to.equal('test');
    });

    it('should allow the user to delete a conduit', async function () {
      const res = await Api()
        .delete(`/conduits/${savedConduit.id}`)
        .set('Authorization', `Token ${jakeUser.token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.all.keys('id', 'status');

      expect(res.body.status).to.equal('Deleted');
    });
  });
});
