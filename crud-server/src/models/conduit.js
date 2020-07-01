const validator = require('validator');

// cache frequently used objects
const allowListProperties = ['comment', 'ip', 'status'].join('');

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
        isIn: [['Airtable', 'Google Sheets', 'Smartsheet']]
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
    whitelist: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidProperty: value => {
          if (!value.every(entry =>
            Object.keys(entry).sort().join('') === allowListProperties
          )) {
            throw new Error('whitelist properties not specified correctly');
          }
        },
        isValidIP: value => {
          if (!value.every(entry => validator.isIP(entry.ip))) {
            throw new Error('Invalid ip address specified in whitelist');
          }
        },
        isValidStatus: value => {
          if (!value.every(entry =>
            ['active', 'inactive'].includes(entry.status)
          )) {
            throw new Error('Invalid status specified in whitelist');
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
          if (!value.every(method =>
            ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
          )) {
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
        isIn: [[true, false]],
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'inactive',
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
      defaultValue: [],
      validate: {
        isValidProperty: value => {
          if (!value.every(entry =>
            Object.keys(entry).sort().join('') ===
              ['fieldName', 'include', 'policy', 'value'].join('')
          )) {
            throw new Error('hiddenFormField properties not set correctly');
          }
        },
        isValidField: value => {
          if (value.some(entry =>
            entry.fieldName === null ||
            typeof entry.fieldName === 'undefined' ||
            entry.fieldName.trim() === ''
          )) {
            throw new Error('Invalid fieldName value set in hiddenFormField');
          }
        },
        isValidPolicy: value => {
          if (!value.every(entry =>
            ['drop-if-filled', 'pass-if-match'].includes(entry.policy)
          )) {
            throw new Error('Invalid policy value set in hiddenFormField');
          }
        },
        isValidInclude: value => {
          if (!value.every(entry =>
            [true, false].includes(entry.include)
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
