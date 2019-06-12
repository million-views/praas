'use strict';

// const slugify = require('slugify');
const faker = require('faker');
const config = require('../config');
const models = require('../models');

const generateUsers = async (count = 5) => {
  const fups = [];
  for (let i = 0; i < count; i++) fups.push(fakeUserProfile());
  return models.User.bulkCreate(fups);
};

const generateConduits = async (userId, count = 50) => {
  const fcts = [];
  for (let i = 0; i < count; i++) fcts.push(fakeConduit());
  for (const fct of fcts) fct.userId = userId;
  return models.Conduit.bulkCreate(fcts);
};

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

  const password = baseUser.password || firstName + config.testPwdSuffix;

  return {
    ...baseUser, password
  };
};

const fakeConduit = (overrides = {}) => {
  const typesArr = ['Google Sheets', 'Airtable', 'Smart Sheet'];
  const ipstatArr = ['active', 'inactive'];
  const hfffieldArr = ['partner', 'campaign', 'userName', 'department', 'accountName'];
  const hffPolicyArr = ['drop-if-filled', 'pass-if-match'];
  const accessArrSrc = [
    ['GET'], ['POST'], ['DELETE'], ['PUT'], ['PATCH'],
    ['GET', 'POST'], ['GET', 'DELETE'], ['GET', 'PUT'], ['GET', 'PATCH'],
    ['POST', 'DELETE'], ['POST', 'PUT'], ['POST', 'PATCH'],
    ['DELETE', 'PUT'], ['DELETE', 'PATCH'], ['PUT', 'PATCH'],
    ['GET', 'POST', 'DELETE'], ['GET', 'POST', 'PUT'], ['GET', 'POST', 'PATCH'],
    ['GET', 'DELETE', 'PUT'], ['GET', 'DELETE', 'PATCH'], ['GET', 'PUT', 'PATCH'],
    ['POST', 'DELETE', 'PUT'], ['POST', 'DELETE', 'PATCH'], ['POST', 'PUT', 'PATCH'],
    ['DELETE', 'PUT', 'PATCH'], ['GET', 'POST', 'DELETE', 'PUT'],
    ['GET', 'POST', 'DELETE', 'PATCH'], ['GET', 'POST', 'PUT', 'PATCH'],
    ['GET', 'DELETE', 'PUT', 'PATCH'], ['POST', 'DELETE', 'PUT', 'PATCH'],
    ['GET', 'POST', 'DELETE', 'PUT', 'PATCH']];
  const accessArr = accessArrSrc[Math.floor(Math.random() * accessArrSrc.length)];
  const conduit = {
    suriApiKey: faker.random.uuid(),
    suriType: typesArr[Math.floor(Math.random() * typesArr.length)],
    suriObjectKey: faker.lorem.word(),
    suri: faker.internet.url(),
    curi: 'td',
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

const processInput = (inp, req, opt, out, err) => {
  for (let i = 0; i < req.length; i++) {
    if (typeof inp[req[i]] === 'undefined') {
      err[req[i]] = `${req[i]} can't be blank`;
    } else {
      out[req[i]] = inp[req[i]];
    };
  };
  for (let i = 0; i < opt.length; i++) {
    if (typeof inp[opt[i]] !== 'undefined') {
      out[opt[i]] = inp[opt[i]];
    };
  };
};

module.exports = {
  fakeUserProfile, fakeConduit, generateUsers, generateConduits, processInput
};
