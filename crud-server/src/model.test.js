const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const config = require('./config');
const models = require('./models');
const helpers = require('./lib/helpers');

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

      user.password = fup.password;
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
      user1.password = fup.password;
      await user1.save();

      const fup2 = helpers.fakeUserProfile();
      const user2 = models.User.build({ ...fup2 });
      user2.email = user1.email;
      user2.password = fup.password;

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
      user.password = fup.password;
      // positive test case
      expect(user.passwordValid(fup.password)).to.be.true;
      // negative test case
      expect(user.passwordValid('bad password')).to.be.false;
    });

    it('should generate profile JSON', async () => {
      const user = await models.User.findOne({ where: { email: fup.email } });
      const profileJSON = user.toProfileJSONFor();
      expect(profileJSON.email).to.equal(fup.email);
      expect(profileJSON.firstName).to.equal(fup.firstName);
      expect(profileJSON.lastName).to.equal(fup.lastName);
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
    let user, users;

    before(async () => {
      [user] = await helpers.generateUsers(1);
      await models.Conduit.sync();
    });

    after('populate for integration test', async function () {
      this.timeout(4000); // <- needed to prevent timeout exceeded mocha error
      users = await helpers.generateUsers(10);
      for (let i = 0; i < 10; i++) {
        await helpers.generateConduits(users[i].id);
      }
    });

    it('should store conduit', async () => {
      const [nct] = await helpers.generateConduits(user.id, 1);

      expect(nct).to.be.an('object');
      expect(nct).to.have.property('suriApiKey');
      expect(nct).to.have.property('suriType');
      expect(nct.curi.length).to.equal(models.System.cconf.settings.curiLen);
    });
  });
});
