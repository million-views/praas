module.exports = (db, DataTypes) => {
  const System = db.define('system', {
    conf: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    }
  });

  return System;
};
