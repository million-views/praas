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
    _id: faker.random.uuid(),
    ...overrides,
  };

  const password = baseUser.password || faker.internet.password();

  return {
    ...baseUser, password
  };
};
module.exports = {
  fakeUserProfile
};
