const Sequelize = require('sequelize');

// This file brings together all the entities and exports them to the
// users of persistent storage layer. As you read through the code
// it helps to visit the links provided below.
//
// NOTE: sequelize by default adds the following fields:
// - id        INTEGER NOT NULL
// - createdAt DATETIME
// - updatedAt DATETIME
//
// See http://stackoverflow.com/questions/20600483/is-there-a-way-to-change-the-default-id-column-that-is-created-automatically
// on how you can circumvent it if needed.
//
// Also see...
// For understanding validate:
// - http://docs.sequelizejs.com/manual/tutorial/models-definition.html#validations
//
// For understanding hooks:
// - https://stackoverflow.com/questions/21411848/pre-save-hook-and-instance-methods-in-sequelize
// - http://docs.sequelizejs.com/manual/tutorial/hooks.html
//
// To update json values:
// - https://github.com/sequelize/sequelize/issues/2862
// - https://github.com/sequelize/sequelize/issues/4805

const db = new Sequelize('development', null, null, {
  logging: false,
  // logging: console.log,
  dialect: 'sqlite',
  operatorsAliases: false,
  // sqlite only
  storage: './sqlite-praas-crud.db',
  define: {
    // underscored: true, /* use underscore instead of camelCase */
    freezeTableName: true /* keep the table name provided by us */
  }
});

const User = require('./user')(db, Sequelize.DataTypes);

module.exports = { db, User };
