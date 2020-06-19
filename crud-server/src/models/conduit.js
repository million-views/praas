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
      validate: {
        notEmpty: true,
        isIn: [['Airtable', 'Google Sheets', 'Smart Sheet']]
      }
    },
    suriObjectKey: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    suri: {
      type: DataTypes.STRING(512),
      allowNull: false,
      validate: {
        isUrl: true,
      }
    },
    curi: {
      type: DataTypes.STRING(512),
      allowNull: false,
      unique: true,
      validate: {
        isUrl: true,
      }

      // set(val) {
      //   console.log('val-before: ', val);
      //   const self = this;
      //   (async function(val) {
      //     const id = await curi(val);
      //     self.setDataValue('curi', id);
      //     console.log('setting curi: ', id);
      //   })(val).then(() => console.log('now what'));

      //   // curi(val).then(id => self.setDataValue(id));
      //   // console.log('val-after', val);
      //   // this.setDataValue('curi', val);
      // }
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
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'inactive']]
      }
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
