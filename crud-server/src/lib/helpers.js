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
  const accessArr = ['GET', 'POST', 'DELETE', 'PUT'];
  const hfffieldArr = ['partner', 'campaign', 'userName', 'department', 'accountName'];
  const hffPolicyArr = ['drop-if-filled', 'pass-if-match'];

  // Remove random array element random number of times (keep 1 min)
  for (let i = 0, len = accessArr.length, j = Math.floor(Math.random() * len); i < j; i++) {
    accessArr.splice(Math.floor(Math.random() * (len - i)), 1);
  }

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
    racm: accessArr,
    throttle: faker.random.boolean(),
    status: ipstatArr[Math.floor(Math.random() * ipstatArr.length)],
    description: faker.lorem.sentence(),
    hiddenFormField: [{
      fieldName: hfffieldArr[Math.floor(Math.random() * hfffieldArr.length)],
      policy: hffPolicyArr[Math.floor(Math.random() * hffPolicyArr.length)],
      include: faker.random.boolean(),
      value: faker.lorem.word(),
    }],
    ...overrides,
  };

  return conduit;
};

module.exports = {
  fakeUserProfile, fakeConduit
};
