module.exports = (db, DataTypes) => {
  const Conduit = db.define('conduit', {
    apiKey: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        // is: /^[a-z0-9]+$/i,
        notEmpty: true
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    objectKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ep_uri: {
      type: DataTypes.STRING(512),
      allowNull: false,
      isUrl: true,
    },
    proxy_uri: {
      type: DataTypes.STRING(512),
      allowNull: false,
      isUrl: true,
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

  Conduit.prototype.toProfileJSONFor = function () {
    return {
      apiKey: this.apiKey,
      type: this.type,
      objectKey: this.objectKey,
      ep_uri: this.ep_uri,
      proxy_uri: this.proxy_uri,
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
