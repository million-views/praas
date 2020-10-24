module.exports = (db, DataTypes) => {
  const Secret = db.define('secret', {
    alias: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    token: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      unique: true,
    },
  });

  return Secret;
};
