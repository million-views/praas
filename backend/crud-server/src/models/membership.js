/* TODO: split this to roles table since in sequlize it is not possible to access bridge table */
module.exports = (db, DataTypes) => {
  const Membership = db.define('membership', {
    accountEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: true,
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: true,
      },
    },
  });

  return Membership;
};
