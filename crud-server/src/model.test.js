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
    let cdt, user, users;

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
      const curi = await helpers.makeCuri('td');
      cdt = helpers.fakeConduit({ userId: user.id, curi });
      const objCdt = models.Conduit.build(cdt);
      await objCdt.save();

      expect(objCdt).to.be.an('object');
      expect(objCdt).to.have.property('suriApiKey');
      expect(objCdt).to.have.property('suriType');
      expect(objCdt.curi.length).to.equal(models.System.cconf.settings.curiLen);
    });

    context('testing curi field...', () => {
      it('should not allow duplicate curi', () => {
        const objCdt = models.Conduit.build(cdt);
        objCdt.save()
          .then(() => { throw (new Error('Test Failed')); })
          .catch(e => {
            expect(e.name).to.equal('SequelizeUniqueConstraintError');
          });
      });

      it('should not allow non-url curi', () => {
        const cdt = helpers.fakeConduit({ userId: user.id, curi: 'not-in-url-format' });
        const objCdt = models.Conduit.build(cdt);
        objCdt.save()
          .then(() => { throw (new Error('Test Failed')); })
          .catch(e => {
            expect(e.name).to.equal('SequelizeValidationError');
            expect(e.errors[0].path).to.equal('curi');
          });
      });
    });

    context('testing suri field...', () => {
      it('should not allow no suri', () => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            delete cdt.suri;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => { throw (new Error('Test Failed')); })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suri');
              });
          });
      });

      it('should not allow undefined suri', () => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.suri = undefined;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => { throw (new Error('Test Failed')); })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suri');
              });
          });
      });

      it('should not allow null suri', () => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.suri = null;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => { throw (new Error('Test Failed')); })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suri');
              });
          });
      });

      it('should not allow empty suri', () => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.suri = '';
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => { throw (new Error('Test Failed')); })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suri');
              });
          });
      });

      it('should not allow blank suri', () => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.suri = '    ';
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => { throw (new Error('Test Failed')); })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suri');
              });
          });
      });

      it('should not allow non-url suri', () => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.suri = 'not-in-url-format';
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => { throw (new Error('Test Failed')); })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suri');
              });
          });
      });
    });

    context('testing suriType field...', () => {
      it('should not allow no suriType', () => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            delete cdt.suriType;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => { throw (new Error('Test Failed')); })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriType');
              });
          });
      });

      it('should not allow undefined suriType', () => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.suriType = undefined;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => { throw (new Error('Test Failed')); })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriType');
              });
          });
      });

      it('should not allow null suriType', () => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.suriType = null;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => { throw (new Error('Test Failed')); })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriType');
              });
          });
      });

      it('should not allow empty suriType', () => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.suriType = '';
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => { throw (new Error('Test Failed')); })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriType');
              });
          });
      });

      it('should not allow blank suriType', () => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.suriType = '    ';
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => { throw (new Error('Test Failed')); })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriType');
              });
          });
      });

      it('should allow only \'Airtable\', \'Google sheets\', or \'Smart sheet\'', () => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.suriType = 'random';
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => { throw (new Error('Test Failed')); })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriType');
              });
          });
      });
    });

    context('testing suriApiKey field...', () => {
      it('should not allow no suriApiKey', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            delete cdt.suriApiKey;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => {
                done(Error('Conduit saved without required suriApiKey'));
              })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriApiKey');
                done();
              });
          });
      });

      it('should not allow undefined suriApiKey', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.suriApiKey = undefined;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => {
                done(Error('Conduit saved with undefined suriApiKey'));
              })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriApiKey');
                done();
              });
          });
      });

      it('should not allow null suriApiKey', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.suriApiKey = null;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => {
                done(Error('Conduit saved with null suriApiKey'));
              })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriApiKey');
                done();
              });
          });
      });

      it('should not allow empty suriApiKey', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.suriApiKey = '';
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => {
                done(Error('Conduit saved with empty suriApiKey'));
              })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriApiKey');
                done();
              });
          });
      });

      it('should not allow blank suriApiKey', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.suriApiKey = '    ';
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => {
                done(Error('Conduit saved with blank suriApiKey'));
              })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriApiKey');
                done();
              });
          });
      });
    });

    context('testing suriObjectKey field...', () => {
      it('should not allow no suriObjectKey', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            delete cdt.suriObjectKey;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => {
                done(Error('Conduit saved without required suriObjectKey'));
              })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriObjectKey');
                done();
              });
          });
      });

      it('should not allow undefined suriObjectKey', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.suriObjectKey = undefined;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => {
                done(Error('Conduit saved with undefined suriObjectKey'));
              })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriObjectKey');
                done();
              });
          });
      });

      it('should not allow null suriObjectKey', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.suriObjectKey = null;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => {
                done(Error('Conduit saved with null suriObjectKey'));
              })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriObjectKey');
                done();
              });
          });
      });

      it('should not allow empty suriObjectKey', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.suriObjectKey = '';
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => {
                done(Error('Conduit saved with empty suriObjectKey'));
              })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriObjectKey');
                done();
              });
          });
      });

      it('should not allow blank suriObjectKey', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.suriObjectKey = '    ';
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => {
                done(Error('Conduit saved with blank suriObjectKey'));
              })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('suriObjectKey');
                done();
              });
          });
      });
    });

    context('testing status field...', () => {
      it('should set default status to \'active\' if no status is set', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            delete cdt.status;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(objCdt => {
                expect(objCdt.status).to.equal('active');
                done();
              })
              .catch(_err => {
                done(Error('status was not saved with default value'));
              });
          });
      });

      it('should set default status to \'active\' if status is undefined', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.status = undefined;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(objCdt => {
                expect(objCdt.status).to.equal('active');
                done();
              })
              .catch(_err => {
                done(Error('status was not saved with default value'));
              });
          });
      });

      it('should not allow null status', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.status = null;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => {
                done(Error('null value was saved successfully'));
              })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('status');
                done();
              });
          });
      });

      it('should not allow empty status', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.status = '';
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => {
                done(Error('empty value was saved successfully'));
              })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('status');
                done();
              });
          });
      });

      it('should not allow blank status', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.status = '    ';
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => {
                done(Error('blank value was saved successfully'));
              })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('status');
                done();
              });
          });
      });

      it('should allow only \'active\' or \'inactive\'', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.status = 'random';
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => {
                done(Error('\'random\' value was saved successfully'));
              })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('status');
                done();
              });
          });
      });
    });

    context('testing racm field...', () => {
      it('should set default racm to [] if no racm is set', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            delete cdt.racm;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(objCdt => {
                expect(objCdt.racm).to.eql([]);
                done();
              })
              .catch(_err => {
                done(Error('racm was not saved with default value'));
              });
          });
      });

      it('should set default racm to [] if racm is undefined', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.racm = undefined;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(objCdt => {
                expect(objCdt.racm).to.eql([]);
                done();
              })
              .catch(_err => {
                done(Error('racm was not saved with default value'));
              });
          });
      });

      it('should not allow null racm', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.racm = null;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => {
                done(Error('null value was saved successfully'));
              })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('racm');
                done();
              });
          });
      });
    });

    context('testing throttle field...', () => {
      it('should set default throttle to true if no throttle is set', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            delete cdt.throttle;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(objCdt => {
                expect(objCdt.throttle).to.equal(true);
                done();
              })
              .catch(_err => {
                done(Error('throttle was not saved with default value'));
              });
          });
      });

      it('should set default throttle to true if throttle is undefined', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.throttle = undefined;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(objCdt => {
                expect(objCdt.throttle).to.equal(true);
                done();
              })
              .catch(_err => {
                done(Error('throttle was not saved with default value'));
              });
          });
      });

      it('should not allow null throttle', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.throttle = null;
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => {
                done(Error('null value was saved successfully'));
              })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('throttle');
                done();
              });
          });
      });

      it('should allow only \'true\' or \'false\' values', done => {
        helpers.makeCuri('td')
          .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
          .then(cdt => {
            cdt.throttle = 'random';
            return models.Conduit.build(cdt);
          })
          .then(objCdt => {
            objCdt.save()
              .then(() => {
                done(Error('\'random\' value was saved successfully'));
              })
              .catch(e => {
                expect(e.name).to.equal('SequelizeValidationError');
                expect(e.errors[0].path).to.equal('throttle');
                done();
              });
          });
      });
    });

    it('should not allow null whitelist', () => {
      helpers.makeCuri('td')
        .then(curi => helpers.fakeConduit({ userId: user.id, curi }))
        .then(cdt => {
          cdt.whitelist = null;
          return models.Conduit.build(cdt);
        })
        .then(objCdt => {
          objCdt.save()
            .then(() => { throw (new Error('Test Failed')); })
            .catch(e => {
              expect(e.name).to.equal('SequelizeValidationError');
              expect(e.errors[0].path).to.equal('whitelist');
            });
        });
    });
  });
});
