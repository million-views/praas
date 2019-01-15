const generate = require('nanoid/generate');
const System = require('./system');

module.exports = (db, DataTypes) => {
  const Conduit = db.define('conduit', {
    suriApiKey: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    suriType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    suriObjectKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    suri: {
      type: DataTypes.STRING(512),
      allowNull: false,
      isUrl: true,
    },
    curi: {
      type: DataTypes.STRING(512),
      allowNull: false,
      isUrl: true,
      unique: true,
      set(val) {
        const domain = System.cconf.settings.domain;
        const alphabet = System.cconf.settings.alphabet;
        const randomStr = generate(alphabet, System.cconf.settings.uccount);
        this.setDataValue('curi', val.concat('-', randomStr, '.', domain));
      }
    },
    whitelist: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    racm: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    throttle: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hiddenFormField: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    }
  });

  Conduit.prototype.toJSON = function () {
    return {
      suriApiKey: this.suriApiKey,
      suriType: this.suriType,
      suriObjectKey: this.suriObjectKey,
      suri: this.suri,
      curi: this.curi,
      whitelist: this.whitelist,
      racm: this.racm,
      throttle: this.throttle,
      status: this.status,
      description: this.description,
      hiddenFormField: this.hiddenFormField
    };
  };

  const User = require('./user')(db, DataTypes);

  Conduit.belongsTo(User, {
    onDelete: 'cascade', allowNull: false, targetKey: 'id'
  });

  return Conduit;
};
