const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const config = require('./config');
const models = require('./models');
const helpers = require('./lib/helpers');
const snapshot = require('snap-shot-it');

const generateUsers = async (count = 5) => {
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

const generateConduits = async (user, count = 5) => {
  const cts = [];
  for (let i = 0; i < count; i++) {
    const fct = helpers.fakeConduit();
    const ct = models.Conduit.build({ ...fct });
    ct.userId = user.id;
    cts.push(await ct.save());
  }
  return cts;
};

/**
 * Unit tests for the database model
 * - order of tests as written is significant
 * - when adding new tests make sure the sequence of tests
 *   test the lifecycle of the model instances
 */
describe('PraaS', () => {
  before('running tests', async () => {
    await models.db.sync({ force: true });
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
        const fakeUserProfile2 = helpers.fakeUserProfile({ firstName: null, lastName: null, email: null, password: null });
        const user2 = models.User.build({ ...fakeUserProfile2 });
        await user2.save();
      } catch ({ name, ...rest }) {
        expect(name).to.match(/TypeError/);
        // v.a: Sequelize behaviour changed from throwing SequelizeValidationError
        // with a list of errors to throwing a single TypeError instead... moving
        // on for now but making sure that this behaviour doesn't change by
        // checking for an empty error list.
        expect(rest).to.be.empty;
      }
    });
  });

  context('User model', () => {
    const fup = helpers.fakeUserProfile();

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

    it('should validate if email is unique', async () => {
      const fup1 = helpers.fakeUserProfile();
      const user1 = models.User.build({ ...fup1 });
      user1.setPassword(fup.password);
      await user1.save();

      const fup2 = helpers.fakeUserProfile();
      const user2 = models.User.build({ ...fup2 });
      user2.email = user1.email;
      user2.setPassword(fup.password);

      try {
        await user2.save();
      } catch ({ name, errors }) {
        expect(name).to.equal('SequelizeUniqueConstraintError');
        for (const error of errors) {
          expect(error.message).to.match(/email must be unique/);
          expect(error.type).to.match(/unique violation/);
          expect(error.path).to.match(/^email$/);
        }
      }
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
    const ct = models.Conduit.build({ ...fct });

    let user = undefined;

    before(async () => {
      const gusr = await generateUsers(1);
      user = gusr[0];
      await models.Conduit.sync();
    });

    after('populate for integration test', async function () {
      this.timeout(10000); // <- needed to prevent timeout exceeded mocha error
      const fups = await generateUsers(10);
      const users = fups.map((fup, _i) => {
        return { id: fup.id, firstName: fup.firstName, lastName: fup.lastName };
      });

      for (let i = 0; i < users.length; i++) {
        await generateConduits(users[i]);
      }
    });

    it('should store conduit', async () => {
      const nct = await generateConduits(user, 1);

      expect(nct[0]).to.be.an('object');
      expect(nct[0]).to.have.property('suriApiKey');
      expect(nct[0]).to.have.property('suriType');
    });

    it('should validate if curi is unique', async () => {
      const fct2 = helpers.fakeConduit();
      const ct2 = models.Conduit.build({ ...fct2 });

      ct2.curi = ct.curi;
      ct2.userId = user.id;

      try {
        const nct = await ct2.save();
        expect(nct.suriType).to.equal(ct2.suriType);
      } catch ({ name, errors }) {
        expect(name).to.equal('SequelizeUniqueConstraintError');
        for (const error of errors) {
          expect(error.message).to.match(/curi must be unique/);
          expect(error.type).to.match(/unique violation/);
          expect(error.path).to.match(/^curi$/);
        }
      }
    });
  });
});
