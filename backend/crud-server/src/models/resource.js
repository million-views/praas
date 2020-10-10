module.exports = (db, DataTypes) => {
  const Resource = db.define('resource', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    suri: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  });

  return Resource;
};
