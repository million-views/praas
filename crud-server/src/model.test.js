const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const config = require('./config');
const models = require('./models');
const helpers = require('./lib/helpers');
const snapshot = require('snap-shot-it');

const fakeUsers = async (count = 5) => {
  const fups = [];
  for (let i = 0; i < count; i++) {
    const fup = helpers.fakeUserProfile();
    let user = models.User.build({ ...fup });
    user.setPassword(fup.password);
    user = await user.save();
    fups.push(user);
  }

  return fups;
};

/**
 * Unit tests for the database model
 * - order of tests as written is significant
 * - when adding new tests make sure the sequence of tests
 *   test the lifecycle of the model instances
 */
describe('PraaS Model', () => {
  before('running tests', async () => {
    await models.db.sync({ force: true });
  });

  after('populate for integration test', async function () {
    this.timeout(10000); // <- needed to prevent timeout exceeded mocha error
    const fups = await fakeUsers(10);
    /* const userIds = */ fups.map((fup, _i) => fup.id);
  });

  context('Non-functional requirements', () => {
    it('includes validation of critical fields', async () => {
      const fakeUserProfile = helpers.fakeUserProfile();
      // replace with bad field values to check if the model catches
      // these errors... NOTE: not exhaustive, we are only testing to
      // see if the validation at the model layer is triggered
      fakeUserProfile.email = 'none@anystreet';
      try {
        const user = models.User.build({ ...fakeUserProfile });
        await user.validate({ fields: ['email'] });
      } catch ({ name, errors }) {
        expect(name).to.equal('SequelizeValidationError');
        for (const error of errors) {
          expect(error.message).to.match(/Validation is on email failed/);
          expect(error.path).to.match(/^email$/);
        }
      }
    });

    it('includes checks for not null constraints of critical fields', async () => {
      try {
        const fakeUserProfile2 = helpers.fakeUserProfile({ firstName: undefined, lastName: undefined, email: undefined, password: undefined });
        const user2 = models.User.build({ ...fakeUserProfile2 });
        await user2.save();
      } catch ({ name, errors }) {
        expect(name).to.equal('SequelizeValidationError');
        for (const error of errors) {
          expect(error.type).to.match(/notNull Violation/);
          expect(error.path).to.match(/^firstName$|^lastName$|^email$|^hash$/);
        }
      }
    });
  });

  context('User model', () => {
    const fup = helpers.fakeUserProfile();

    afterEach(async () => {
      await models.User.sync();
    });

    it('should store new user(s)', async () => {
      const user = models.User.build({ ...fup });

      user.setPassword(fup.password);
      expect(user.passwordValid(fup.password)).to.be.true;
      const newUser = await user.save();

      expect(newUser).to.be.an('object');
      expect(newUser).to.have.property('firstName');
      expect(newUser).to.have.property('email');
      expect(newUser.firstName).to.equal(fup.firstName);
    });

    it('should validate passwords', async () => {
      const user = await models.User.findOne({ where: { email: fup.email } });
      user.setPassword(fup.password);
      // positive test case
      expect(user.passwordValid(fup.password)).to.be.true;
      // negative test case
      expect(user.passwordValid('bad password')).to.be.false;
    });

    it('should generate profile JSON', async () => {
      const user = await models.User.findOne({ where: { email: fup.email } });
      const profileJSON = user.toProfileJSONFor();
      snapshot(profileJSON);
    });

    it('should generate auth JSON', async () => {
      const user = await models.User.findOne({ where: { email: fup.email } });
      const authJSON = user.toAuthJSON();
      expect(authJSON).to.have.property('token');

      const jwtDecoded = jwt.verify(authJSON.token, config.secret);
      expect(jwtDecoded.email).to.equal(user.email);
      expect(jwtDecoded.id).to.equal(user.id);
    });
  });

  context('Conduit model', () => {
    const fct = helpers.fakeConduit();
    let user = undefined;

    before(async () => {
      const fup = helpers.fakeUserProfile();
      user = models.User.build({ ...fup });
      user.setPassword(fup.password);
      user = await user.save();
      await models.Conduit.sync();
    });

    afterEach(async () => {
      await models.Conduit.sync();
    });

    it('should store conduit', async () => {
      const ct = models.Conduit.build({ ...fct });
      ct.userId = user.id;
      const nep = await ct.save();

      expect(nep).to.be.an('object');
      expect(nep).to.have.property('apiKey');
      expect(nep).to.have.property('type');
      expect(nep.type).to.equal(ct.type);
    });
  });
});
