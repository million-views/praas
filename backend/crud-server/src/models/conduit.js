/* TODO: Add/move the previously existing validations */
const { generateCuri } = require('../utils');

module.exports = (db, DataTypes) => {
  const Conduit = db.define('conduit', {
    resourceType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    objectPath: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    curi: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    racm: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    throttle: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        notEmpty: true,
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  Conduit.addHook('beforeValidate', 'generateCuri', (conduit) => {
    const curi = generateCuri(Conduit);
    conduit.curi = curi;
  });

  return Conduit;
};
