'use strict';

// const slugify = require('slugify');
const faker = require('faker');

const fakeUserProfile = (overrides = {}) => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const email = faker.internet.email();

  const baseUser = {
    firstName,
    lastName,
    email: email.toLowerCase(),
    ...overrides,
  };

  const password = baseUser.password || faker.internet.password();

  return {
    ...baseUser, password
  };
};

const fakeConduit = (overrides = {}) => {
  const typesArr = ['Google Sheets', 'Airtable', 'Smart Sheet'];
  const ipstatArr = ['active', 'inactive'];
  // const accessArr = ['GET', 'POST', 'DELETE', 'PUT'];

  const conduit = {
    suriApiKey: faker.random.uuid(),
    suriType: typesArr[Math.floor(Math.random() * typesArr.length)],
    suriObjectKey: faker.lorem.word(),
    suri: faker.internet.url(),
    curi: faker.internet.url(),
    whitelist: [{
      ip: faker.internet.ip(),
      status: ipstatArr[Math.floor(Math.random() * ipstatArr.length)],
      comment: faker.lorem.words()
    }],
    racm: ['GET', 'POST', 'DEL'],
    throttle: faker.random.boolean(),
    status: ipstatArr[Math.floor(Math.random() * ipstatArr.length)],
    description: faker.lorem.sentence(),
    ...overrides,
  };

  // hiddenFormField: this.hiddenFormField
  return conduit;
};

module.exports = {
  fakeUserProfile, fakeConduit
};
