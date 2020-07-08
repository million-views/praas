const validator = require('validator');

// cache frequently used objects and enumerations
const HFF_PROPS = ['fieldName', 'include', 'policy', 'value'].join('');
const HFF_POLICY = ['drop-if-filled', 'pass-if-match'];
const SERVICE_ENUM = ['Airtable', 'Google Sheets', 'Smartsheet'];
const STATUS_ENUM = ['active', 'inactive'];
const HTTP_METHODS_ENUM = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const BOOLEAN_ENUM = [true, false];

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
        isIn: [SERVICE_ENUM]
      }
    },
    suriObjectKey: {
      type: DataTypes.STRING,
      allowNull: true,
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
    },
    allowlist: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidProperty: value => {
          if (!value.every(entry => (entry.ip && entry.status))) {
            throw new Error('allowlist properties not specified correctly');
          }
        },
        isValidIP: value => {
          if (!value.every(entry => validator.isIP(entry.ip))) {
            throw new Error('Invalid ip address specified in allowlist');
          }
        },
        isValidStatus: value => {
          if (!value.every(entry => STATUS_ENUM.includes(entry.status))) {
            throw new Error('Invalid status specified in allowlist');
          }
        },
      }
    },
    racm: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidHTTPMethod: value => {
          if (!value.every(method => HTTP_METHODS_ENUM.includes(method))) {
            throw new Error('Only GET, POST, PUT, PATCH and DELETE allowed!');
          }
        }
      }
    },
    throttle: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isIn: [BOOLEAN_ENUM],
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'inactive',
      validate: {
        isIn: [STATUS_ENUM]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hiddenFormField: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      validate: {
        isValidProperty: value => {
          if (!value.every(entry =>
            Object.keys(entry).sort().join('') === HFF_PROPS
          )) {
            throw new Error('hiddenFormField properties not set correctly');
          }
        },
        isValidField: value => {
          if (value.some(entry => !entry.fieldName || entry.fieldName.trim() === '')) {
            throw new Error('Invalid fieldName value set in hiddenFormField');
          }
        },
        isValidPolicy: value => {
          if (!value.every(entry => HFF_POLICY.includes(entry.policy))) {
            throw new Error('Invalid policy value set in hiddenFormField');
          }
        },
        isValidInclude: value => {
          if (!value.every(entry =>
            BOOLEAN_ENUM.includes(entry.include)
          )) {
            throw new Error('Invalid include value set in hiddenFormField');
          }
        }
      }
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
      allowlist: this.allowlist,
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
