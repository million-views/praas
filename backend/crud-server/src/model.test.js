const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const config = require('../../config');
const models = require('./models');
const util = require('../../lib/util');
const helpers = require('../../lib/helpers');
const dotEnv = require('dotenv-safe');

const dotEnvValues = dotEnv.config({
  allowEmptyValues: true,
  example: path.resolve('.env.conduit-user.example'),
  path: path.resolve('.env.conduit-user'),
});

const generateUsers = async (count = 5) => {
  const fups = [];
  for (let i = 0; i < count; i++) fups.push(helpers.fakeUserProfile());
  return models.User.bulkCreate(fups);
};

const generateConduits = async (userId, count = 50) => {
  const fcts = [];
  for (let i = 0; i < count; i++) {
    const curi = await helpers.makeCuri('td');
    fcts.push(helpers.fakeConduit({ curi }));
  }
  for (const fct of fcts) fct.userId = userId;
  return models.Conduit.bulkCreate(fcts);
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
        const fakeUserProfile2 = helpers.fakeUserProfile({
          firstName: null,
          lastName: null,
          email: null,
          password: null,
        });
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

    it('should validate whether user exists', async function () {
      // valid user
      const validUser = await models.User.exists(fup.email, fup.password);
      expect(validUser).to.be.an('object');
      expect(validUser).to.have.property('email');
      expect(validUser.email).to.equal(fup.email);

      // non-existent user
      const nonExistentUser = await models.User.exists(
        'test.user@example.com',
        't3$TP@ssw0rd'
      );
      expect(nonExistentUser).to.be.undefined;
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

      const jwtDecoded = jwt.verify(
        authJSON.token,
        config.system.settings.secret
      );
      expect(jwtDecoded.email).to.equal(user.email);
      expect(jwtDecoded.id).to.equal(user.id);
    });
  });

  context('Conduit model', () => {
    let cdt, user, users;

    before(async () => {
      const userObj = await models.User.create({
        firstName: dotEnvValues.parsed.USER_FIRST_NAME,
        lastName: dotEnvValues.parsed.USER_LAST_NAME,
        email: dotEnvValues.parsed.USER_EMAIL,
        password: dotEnvValues.parsed.USER_PASSWORD,
      });
      user = userObj.toJSON();
      await models.Conduit.sync();
    });

    after('populate for integration test', async function () {
      this.timeout(4000); // <- needed to prevent timeout exceeded mocha error

      // create test conduits for proxy server
      const curis = {}; // <- store the conduits for proxy test

      const proxyBaseConduit = {
        userId: user.id,
        suriType: dotEnvValues.parsed.CONDUIT_SERVICE_TYPE,
        suriApiKey: dotEnvValues.parsed.CONDUIT_SERVICE_API_KEY,
        suriObjectKey: dotEnvValues.parsed.CONDUIT_SERVICE_OBJECT_KEY,
        throttle: false,
        status: 'active',
      };

      const proxyDropConduit = await models.Conduit.create({
        ...proxyBaseConduit,
        description: 'test conduit with drop-if-filled HFF policy',
        curi: await helpers.makeCuri('td'),
        racm: ['POST'],
        hiddenFormField: [
          {
            fieldName: 'hiddenFormField',
            policy: 'drop-if-filled',
            include: false,
            value: 'hiddenFormFieldValue',
          },
        ],
      });
      curis.dropConduit = { host: proxyDropConduit.curi };

      const proxyPassConduit = await models.Conduit.create({
        ...proxyBaseConduit,
        description: 'test conduit with pass-if-match HFF policy',
        curi: await helpers.makeCuri('td'),
        racm: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
        hiddenFormField: [
          {
            fieldName: 'hiddenFormField',
            policy: 'pass-if-match',
            include: true,
            value: 'hidden-form-field-value',
          },
        ],
      });
      curis.passConduit = { host: proxyPassConduit.curi };

      const proxyNoIncludeConduit = await models.Conduit.create({
        ...proxyBaseConduit,
        description: 'test conduit with HFF include = false',
        curi: await helpers.makeCuri('td'),
        racm: ['POST'],
        hiddenFormField: [
          {
            fieldName: 'hiddenFormField',
            policy: 'pass-if-match',
            include: false,
            value: 'hidden-form-field-value',
          },
        ],
      });
      curis.noIncludeConduit = { host: proxyNoIncludeConduit.curi };

      // loopback-network needs to be setup to test allow-list feature
      // aor => accept or reject | based on client ip address
      const proxyAorConduit1 = await models.Conduit.create({
        ...proxyBaseConduit,
        description: 'test allow-list with one active ip checked',
        curi: await helpers.makeCuri('td'),
        racm: ['GET'],
        allowlist: [
          {
            ip: util.pickRandomlyFrom(helpers.testAllowedIpList),
            status: 'active',
            comment: 'clients with ip matching me should be be accepted',
          },
        ],
      });
      curis.aorConduit1 = {
        host: proxyAorConduit1.curi,
        allowlist: proxyAorConduit1.allowlist,
      };

      const proxyAorConduit2 = await models.Conduit.create({
        ...proxyBaseConduit,
        description: 'test allow-list with one inactive ip',
        curi: await helpers.makeCuri('td'),
        racm: ['GET'],
        allowlist: [
          {
            ip: util.pickRandomlyFrom(helpers.testInactiveIpList),
            status: 'inactive',
            comment: 'I am practically not there coz I am inactive',
          },
        ],
      });
      curis.aorConduit2 = {
        host: proxyAorConduit2.curi,
        allowlist: proxyAorConduit2.allowlist,
      };

      const proxyAorConduit3 = await models.Conduit.create({
        ...proxyBaseConduit,
        description: 'test allow-list with multiple ip addresses',
        curi: await helpers.makeCuri('td'),
        racm: ['POST'],
        allowlist: [
          {
            ip: util.pickRandomlyFrom(helpers.testAllowedIpList),
            status: 'active',
            comment: 'clients with ip matching me should be be accepted',
          },
          {
            ip: util.pickRandomlyFrom(helpers.testAllowedIpList),
            status: 'active',
            comment: 'clients with ip matching me should be be accepted',
          },
          {
            ip: util.pickRandomlyFrom(helpers.testInactiveIpList),
            status: 'inactive',
            comment: 'I am practically not there coz I am inactive',
          },
        ],
      });
      curis.aorConduit3 = {
        host: proxyAorConduit3.curi,
        allowlist: proxyAorConduit3.allowlist,
      };

      fs.writeFileSync(
        path.resolve('.test-data-curi.json'),
        JSON.stringify(curis, null, 2)
      );

      // flood user with random conduits
      generateConduits(user.id, 200);

      // generate random users and conduits for integration test
      users = await generateUsers(10);
      for (let i = 0; i < 10; i++) {
        await generateConduits(users[i].id);
      }
    });

    it('should store conduit', async () => {
      const curi = await helpers.makeCuri('td');
      cdt = helpers.fakeConduit({ userId: user.id, curi });
      const objCdt = models.Conduit.build(cdt);
      await objCdt.save();
      const createdConduit = objCdt.toJSON();

      expect(createdConduit).to.be.an('object');
      expect(createdConduit).to.have.property('suriApiKey');
      expect(createdConduit).to.have.property('suriType');
      expect(createdConduit.curi.length).to.equal(
        config.conduit.settings.curiLen
      );
    });

    context('testing curi field...', () => {
      it('should not allow no curi', (done) => {
        const cdt = helpers.fakeConduit({ userId: user.id });
        const objCdt = models.Conduit.build(cdt);
        objCdt
          .save()
          .then(() => {
            done(Error('Conduit was saved without a curi'));
          })
          .catch((e) => {
            expect(e.name).to.equal('SequelizeValidationError');
            expect(e.errors[0].path).to.equal('curi');
            done();
          });
      });

      it('should not allow undefined curi', (done) => {
        const cdt = helpers.fakeConduit({ userId: user.id, curi: undefined });
        const objCdt = models.Conduit.build(cdt);
        objCdt
          .save()
          .then(() => {
            done(Error('Conduit was saved with undefined curi'));
          })
          .catch((e) => {
            expect(e.name).to.equal('SequelizeValidationError');
            expect(e.errors[0].path).to.equal('curi');
            done();
          });
      });

      it('should not allow null curi', (done) => {
        const cdt = helpers.fakeConduit({ userId: user.id, curi: null });
        const objCdt = models.Conduit.build(cdt);
        objCdt
          .save()
          .then(() => {
            done(Error('Conduit was saved with null curi'));
          })
          .catch((e) => {
            expect(e.name).to.equal('SequelizeValidationError');
            expect(e.errors[0].path).to.equal('curi');
            done();
          });
      });

      it('should not allow empty curi', (done) => {
        const cdt = helpers.fakeConduit({ userId: user.id, curi: '' });
        const objCdt = models.Conduit.build(cdt);
        objCdt
          .save()
          .then(() => {
            done(Error('Conduit was saved with empty curi'));
          })
          .catch((e) => {
            expect(e.name).to.equal('SequelizeValidationError');
            expect(e.errors[0].path).to.equal('curi');
            done();
          });
      });

      it('should not allow blank curi', (done) => {
        const cdt = helpers.fakeConduit({ userId: user.id, curi: '    ' });
        const objCdt = models.Conduit.build(cdt);
        objCdt
          .save()
          .then(() => {
            done(Error('Conduit was saved with blank curi'));
          })
          .catch((e) => {
            expect(e.name).to.equal('SequelizeValidationError');
            expect(e.errors[0].path).to.equal('curi');
            done();
          });
      });

      it('should not allow duplicate curi', (done) => {
        const objCdt = models.Conduit.build(cdt);
        objCdt
          .save()
          .then(() => {
            done(Error('Conduit with duplicate curi was saved'));
          })
          .catch((e) => {
            expect(e.name).to.equal('SequelizeUniqueConstraintError');
            done();
          });
      });

      it('should not allow non-url curi', (done) => {
        const cdt = helpers.fakeConduit({
          userId: user.id,
          curi: 'not-in-url-format',
        });
        const objCdt = models.Conduit.build(cdt);
        objCdt
          .save()
          .then(() => {
            done(Error('Conduit was saved with non-url curi'));
          })
          .catch((e) => {
            expect(e.name).to.equal('SequelizeValidationError');
            expect(e.errors[0].path).to.equal('curi');
            done();
          });
      });
    });

    context('testing suriType field...', () => {
      it('should not allow no suriType', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            delete cdt.suriType;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit was saved with no suriType'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriType');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow undefined suriType', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.suriType = undefined;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit was saved with undefined suriType'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriType');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow null suriType', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.suriType = null;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit was saved with null suriType'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriType');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow empty suriType', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.suriType = '';
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit was saved with empty suriType'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriType');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should reject unsupported service types', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.suriType = 'random';
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error("Conduit was saved with 'random' suriType"));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriType');
                done();
              });
          })
          .catch((e) => done(e));
      });
    });

    context('testing suriApiKey field...', () => {
      it('should not allow no suriApiKey', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            delete cdt.suriApiKey;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit saved without required suriApiKey'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriApiKey');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow undefined suriApiKey', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.suriApiKey = undefined;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit saved with undefined suriApiKey'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriApiKey');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow null suriApiKey', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.suriApiKey = null;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit saved with null suriApiKey'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriApiKey');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow empty suriApiKey', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.suriApiKey = '';
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit saved with empty suriApiKey'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriApiKey');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow blank suriApiKey', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.suriApiKey = '    ';
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit saved with blank suriApiKey'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriApiKey');
                done();
              });
          })
          .catch((e) => done(e));
      });
    });

    context('testing suriObjectKey field...', () => {
      it('should not allow no suriObjectKey', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            delete cdt.suriObjectKey;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit saved without required suriObjectKey'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriObjectKey');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow undefined suriObjectKey', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.suriObjectKey = undefined;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit saved with undefined suriObjectKey'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriObjectKey');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow null suriObjectKey', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.suriObjectKey = null;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit saved with null suriObjectKey'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriObjectKey');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow empty suriObjectKey', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.suriObjectKey = '';
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit saved with empty suriObjectKey'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriObjectKey');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow blank suriObjectKey', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.suriObjectKey = '    ';
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit saved with blank suriObjectKey'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriObjectKey');
                done();
              });
          })
          .catch((e) => done(e));
      });
    });

    context('testing status field...', () => {
      it("should set default status to 'inactive' if no status is set", (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            delete cdt.status;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then((objCdt) => {
                expect(objCdt.status).to.equal('inactive');
                done();
              })
              .catch((_err) => {
                done(Error('status was not saved with default value'));
              });
          })
          .catch((e) => done(e));
      });

      it("should set default status to 'inactive' if status is undefined", (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.status = undefined;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then((objCdt) => {
                expect(objCdt.status).to.equal('inactive');
                done();
              })
              .catch((_err) => {
                done(Error('status was not saved with default value'));
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow null status', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.status = null;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('null value was saved successfully'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('status');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow empty status', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.status = '';
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('empty value was saved successfully'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('status');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it("should allow only 'active' or 'inactive'", (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.status = 'random';
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error("'random' value was saved successfully"));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('status');
                done();
              });
          })
          .catch((e) => done(e));
      });
    });

    context('testing throttle field...', () => {
      it('should set default throttle to true if no throttle is set', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            delete cdt.throttle;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then((objCdt) => {
                expect(objCdt.throttle).to.equal(true);
                done();
              })
              .catch((_err) => {
                done(Error('throttle was not saved with default value'));
              });
          })
          .catch((e) => done(e));
      });

      it('should set default throttle to true if throttle is undefined', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.throttle = undefined;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then((objCdt) => {
                expect(objCdt.throttle).to.equal(true);
                done();
              })
              .catch((_err) => {
                done(Error('throttle was not saved with default value'));
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow null throttle', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.throttle = null;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('null value was saved successfully'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('throttle');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow empty throttle', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.throttle = '';
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('null value was saved successfully'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('throttle');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it("should allow only 'true' or 'false' values", (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.throttle = 'random';
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error("Conduit saved with 'random' throttle"));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('throttle');
                done();
              });
          })
          .catch((e) => done(e));
      });
    });

    context('testing racm field...', () => {
      it('should set default racm to ["GET"] if no racm is set', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            delete cdt.racm;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then((objCdt) => {
                expect(objCdt.racm).to.eql(['GET']);
                done();
              })
              .catch((_err) => {
                done(Error('racm was not saved with default value'));
              });
          })
          .catch((e) => done(e));
      });

      it('should set default racm to ["GET"] if racm is undefined', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.racm = undefined;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then((objCdt) => {
                expect(objCdt.racm).to.eql(['GET']);
                done();
              })
              .catch((_err) => {
                done(Error('racm was not saved with default value'));
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow empty string', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.racm = '';
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('empty string was saved successfully'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('racm');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow blanks', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.racm = '    ';
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('blank string was saved successfully'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('racm');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow null racm', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.racm = null;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('null value was saved successfully'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('racm');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow invalid methods in racm list', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.racm = ['HEAD', 'OPTIONS', 'CONNECT', 'TRACE'];
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('invalid values saved successfully'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('racm');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should allow valid methods in racm list', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.racm = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then((objCdt) => {
                expect(objCdt.racm).to.eql([
                  'GET',
                  'POST',
                  'PUT',
                  'PATCH',
                  'DELETE',
                ]);
                done();
              })
              .catch((_err) => {
                done(Error('racm was not saved with valid values'));
              });
          })
          .catch((e) => done(e));
      });
    });

    context('testing allowlist field...', () => {
      it('should set default allowlist to [] if allowlist is not specified', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            delete cdt.allowlist;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then((objCdt) => {
                expect(objCdt.allowlist).to.eql([]);
                done();
              })
              .catch((_err) => {
                done(Error('allowlist was not saved with default value'));
              });
          })
          .catch((e) => done(e));
      });

      it('should set default allowlist to [] if allowlist is undefined', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.allowlist = undefined;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then((objCdt) => {
                expect(objCdt.allowlist).to.eql([]);
                done();
              })
              .catch((_err) => {
                done(Error('allowlist was not saved with default value'));
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow empty allowlist', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.allowlist = '';
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit saved with empty allowlist'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('allowlist');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow blank allowlist', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.allowlist = '    ';
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit saved with blank allowlist'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('allowlist');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow null allowlist', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.allowlist = null;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit saved with null allowlist'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('allowlist');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow non-specified allowlist properties', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.allowlist = [
              {
                ip: '123.234.345.456',
                comment: 'test',
                status: 'active',
                unspecified: 'random',
              },
            ];
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Saved with non-specified allowlist properties'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('allowlist');
                done();
              });
          })
          .catch((e) => done(e));
      });

      context('testing ip address property', () => {
        it('should not allow no ip address in allowlist', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.allowlist = [
                {
                  comment: 'test',
                  status: 'active',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error('Saved with no ip address'));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('allowlist');
                  done();
                });
            })
            .catch((e) => done(e));
        });

        it('should not allow undefined ip address in allowlist', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.allowlist = [
                {
                  ip: undefined,
                  comment: 'test',
                  status: 'active',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error('Saved with undefined ip address'));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('allowlist');
                  done();
                });
            })
            .catch((e) => done(e));
        });

        it('should not allow null ip address in allowlist', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.allowlist = [
                {
                  ip: null,
                  comment: 'test',
                  status: 'active',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error('Saved with null ip address'));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('allowlist');
                  done();
                });
            })
            .catch((e) => done(e));
        });

        it('should not allow empty ip address in allowlist', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.allowlist = [
                {
                  ip: '',
                  comment: 'test',
                  status: 'active',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error('Saved with empty ip address'));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('allowlist');
                  done();
                });
            })
            .catch((e) => done(e));
        });

        it('should not allow maligned ip address in allowlist', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.allowlist = [
                {
                  ip: '123.234.345',
                  comment: 'test',
                  status: 'active',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error('Saved with maligned ip address'));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('allowlist');
                  done();
                });
            })
            .catch((e) => done(e));
        });

        it('should not allow out-of-range ip address in allowlist', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.allowlist = [
                {
                  ip: '123.234.345.456',
                  comment: 'test',
                  status: 'active',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error('Saved with out-of-range ip address'));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('allowlist');
                  done();
                });
            })
            .catch((e) => done(e));
        });
      });

      context('testing status property', () => {
        it('should not allow no status', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.allowlist = [
                {
                  ip: '127.0.0.1',
                  comment: 'test',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error('Conduit saved with no allowlist status'));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('allowlist');
                  done();
                });
            })
            .catch((e) => done(e));
        });

        it('should not allow undefined status', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.allowlist = [
                {
                  ip: '127.0.0.1',
                  comment: 'test',
                  status: undefined,
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(
                    Error('Conduit saved with undefined allowlist status')
                  );
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('allowlist');
                  done();
                });
            })
            .catch((e) => done(e));
        });

        it('should not allow null status', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.allowlist = [
                {
                  ip: '127.0.0.1',
                  comment: 'test',
                  status: null,
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error('Conduit saved with null allowlist status'));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('allowlist');
                  done();
                });
            })
            .catch((e) => done(e));
        });

        it('should not allow empty status', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.allowlist = [
                {
                  ip: '127.0.0.1',
                  comment: 'test',
                  status: '',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error('Conduit saved with null allowlist status'));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('allowlist');
                  done();
                });
            })
            .catch((e) => done(e));
        });

        it("should allow only 'active' or 'inactive' status", (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.allowlist = [
                {
                  ip: '123.234.345.456',
                  comment: 'test',
                  status: 'random',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error("Conduit saved with 'random' allowlist status"));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('allowlist');
                  done();
                });
            })
            .catch((e) => done(e));
        });
      });
    });

    context('testing hidden form field...', () => {
      it('should set default hff to [] if hff is not specified', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            delete cdt.hiddenFormField;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then((objCdt) => {
                expect(objCdt.hiddenFormField).to.eql([]);
                done();
              })
              .catch((_err) => {
                done(Error('HFF was not saved with default value'));
              });
          })
          .catch((e) => done(e));
      });

      it('should set default hff to [] if hff is undefined', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.hiddenFormField = undefined;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then((objCdt) => {
                expect(objCdt.hiddenFormField).to.eql([]);
                done();
              })
              .catch((_err) => {
                done(Error('HFF was not saved with default value'));
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow empty hff', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.hiddenFormField = '';
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit saved with empty HFF'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('hiddenFormField');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow blank hff', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.hiddenFormField = '    ';
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit saved with blank HFF'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('hiddenFormField');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow null hff', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.hiddenFormField = null;
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Conduit saved with null HFF'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('hiddenFormField');
                done();
              });
          })
          .catch((e) => done(e));
      });

      it('should not allow non-specified hff properties', (done) => {
        helpers
          .makeCuri('td')
          .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
          .then((cdt) => {
            cdt.hiddenFormField = [
              {
                fieldName: 'campaign',
                policy: 'pass-if-match',
                include: true,
                value: 'black friday sale',
                unspecified: 'random',
              },
            ];
            return models.Conduit.build(cdt);
          })
          .then((objCdt) => {
            objCdt
              .save()
              .then(() => {
                done(Error('Saved with non-specified HFF properties'));
              })
              .catch((e) => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('hiddenFormField');
                done();
              });
          })
          .catch((e) => done(e));
      });

      context('testing fieldname property', () => {
        it('should not allow no fieldName', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.hiddenFormField = [
                {
                  policy: 'pass-if-match',
                  include: true,
                  value: 'black friday sale',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error('Saved without HFF fieldName property'));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('hiddenFormField');
                  done();
                });
            })
            .catch((e) => done(e));
        });

        it('should not allow undefined fieldName', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.hiddenFormField = [
                {
                  fieldName: undefined,
                  policy: 'pass-if-match',
                  include: true,
                  value: 'black friday sale',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error('Saved with undefined fieldName'));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('hiddenFormField');
                  done();
                });
            })
            .catch((e) => done(e));
        });

        it('should not allow null fieldName', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.hiddenFormField = [
                {
                  fieldName: null,
                  policy: 'pass-if-match',
                  include: true,
                  value: 'black friday sale',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error('Saved with null fieldName'));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('hiddenFormField');
                  done();
                });
            })
            .catch((e) => done(e));
        });

        it('should not allow empty fieldName', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.hiddenFormField = [
                {
                  fieldName: '',
                  policy: 'pass-if-match',
                  include: true,
                  value: 'black friday sale',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error('Saved with empty fieldName'));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('hiddenFormField');
                  done();
                });
            })
            .catch((e) => done(e));
        });

        it('should not allow blank fieldName', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.hiddenFormField = [
                {
                  fieldName: '    ',
                  policy: 'pass-if-match',
                  include: true,
                  value: 'black friday sale',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error('Saved with blank fieldName'));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('hiddenFormField');
                  done();
                });
            })
            .catch((e) => done(e));
        });
      });

      context('testing policy property', () => {
        it('should not allow no policy', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.hiddenFormField = [
                {
                  fieldName: 'campaign',
                  include: true,
                  value: 'black friday sale',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error('Saved without HFF policy property'));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('hiddenFormField');
                  done();
                });
            })
            .catch((e) => done(e));
        });

        it('should not allow undefined policy', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.hiddenFormField = [
                {
                  fieldName: 'campaign',
                  policy: undefined,
                  include: true,
                  value: 'black friday sale',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error('Saved with undefined policy'));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('hiddenFormField');
                  done();
                });
            })
            .catch((e) => done(e));
        });

        it('should not allow null policy', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.hiddenFormField = [
                {
                  fieldName: 'campaign',
                  policy: null,
                  include: true,
                  value: 'black friday sale',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error('Saved with null policy'));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('hiddenFormField');
                  done();
                });
            })
            .catch((e) => done(e));
        });

        it('should not allow empty policy', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.hiddenFormField = [
                {
                  fieldName: 'campaign',
                  policy: '',
                  include: true,
                  value: 'black friday sale',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error('Saved with empty policy'));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('hiddenFormField');
                  done();
                });
            })
            .catch((e) => done(e));
        });

        it('should not allow blank policy', (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.hiddenFormField = [
                {
                  fieldName: 'campaign',
                  policy: '    ',
                  include: true,
                  value: 'black friday sale',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error('Saved with blank policy'));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('hiddenFormField');
                  done();
                });
            })
            .catch((e) => done(e));
        });

        it("should allow only 'pass-if-match' or 'drop-if-filled' policy", (done) => {
          helpers
            .makeCuri('td')
            .then((curi) => helpers.fakeConduit({ userId: user.id, curi }))
            .then((cdt) => {
              cdt.hiddenFormField = [
                {
                  fieldName: 'campaign',
                  policy: 'random',
                  include: true,
                  value: 'black friday sale',
                },
              ];
              return models.Conduit.build(cdt);
            })
            .then((objCdt) => {
              objCdt
                .save()
                .then(() => {
                  done(Error("Conduit saved with 'random' HFF policy"));
                })
                .catch((e) => {
                  expect(e.name).to.equal('SequelizeValidationError');
                  expect(e.errors[0].path).to.equal('hiddenFormField');
                  done();
                });
            })
            .catch((e) => done(e));
        });
      });
    });
  });
});
