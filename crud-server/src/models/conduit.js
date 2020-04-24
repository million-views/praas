const customAlphabet = require('nanoid/async').customAlphabet;
const System = require('./system');

const nanoid = customAlphabet(
    System.cconf.settings.alphabet,
    System.cconf.settings.uccount
  );
  const domain = System.cconf.settings.domain;
  
  // Construct unique uri string
  const curi = async () => {
    const id = await nanoid();
    console.log('nano-id:', id);
    return id.concat('.', domain);
  };

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
        console.log('val-before: ', val);
        this.setDataValue('curi', val.concat('-', curi()));
        console.log('val-after: ', val);
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
      id: this.id,
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
      hiddenFormField: this.hiddenFormField,
      userId: this.userId,
    };
  };

  const User = require('./user')(db, DataTypes);

  Conduit.belongsTo(User, {
    onDelete: 'cascade', allowNull: false, targetKey: 'id'
  });

  return Conduit;
};
