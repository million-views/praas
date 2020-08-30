const validator = require('validator');
const conf = require('../../../config');

// cache frequently used objects and enumerations
const HFF_PROPS = ['fieldName', 'include', 'policy', 'value'].join('');
const HFF_POLICY = ['drop-if-filled', 'pass-if-match'];
const STATUS_ENUM = ['active', 'inactive'];
const HTTP_METHODS_ENUM = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const BOOLEAN_ENUM = [true, false];
const SERVICE_TARGETS_ENUM = conf.targets.settings.map((i) => i.type);

module.exports = (db, DataTypes) => {
  const Conduit = db.define('conduit', {
    suriApiKey: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    suriType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isIn: {
          args: [SERVICE_TARGETS_ENUM],
          msg: 'unsupported',
        },
      },
    },
    suriObjectKey: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    curi: {
      type: DataTypes.STRING(512),
      allowNull: false,
      unique: true,
      validate: {
        isUrl: true,
      },
    },
    allowlist: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidProperty: (value) => {
          if (!value || !value.every((entry) => entry.ip && entry.status)) {
            throw new Error('missing required properties');
          }
        },
        isValidIP: (value) => {
          if (
            !value ||
            !value.every((entry) => entry.ip && validator.isIP(entry.ip))
          ) {
            throw new Error('invalid ip address');
          }
        },
        isValidStatus: (value) => {
          if (
            !value ||
            !value.every((entry) => STATUS_ENUM.includes(entry.status))
          ) {
            throw new Error('invalid status value');
          }
        },
      },
    },
    racm: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['GET'],
      validate: {
        isValidHTTPMethod: (value) => {
          if (
            !value ||
            !value.every((method) => HTTP_METHODS_ENUM.includes(method))
          ) {
            throw new Error('invalid method');
          }
        },
      },
    },
    throttle: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isIn: {
          args: [BOOLEAN_ENUM],
          msg: 'invalid value',
        },
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'inactive',
      validate: {
        isIn: {
          args: [STATUS_ENUM],
          msg: 'invalid status value',
        },
      },
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
        isValidProperty: (value) => {
          if (
            !value ||
            !value.every(
              (entry) => Object.keys(entry).sort().join('') === HFF_PROPS
            )
          ) {
            throw new Error('missing required properties');
          }
        },
        isValidField: (value) => {
          if (
            !value ||
            value.some(
              (entry) => !entry.fieldName || entry.fieldName.trim() === ''
            )
          ) {
            throw new Error('invalid fieldName value');
          }
        },
        isValidPolicy: (value) => {
          if (
            !value ||
            !value.every((entry) => HFF_POLICY.includes(entry.policy))
          ) {
            throw new Error('invalid policy value');
          }
        },
        isValidInclude: (value) => {
          if (
            !value ||
            !value.every((entry) => BOOLEAN_ENUM.includes(entry.include))
          ) {
            throw new Error('invalid include value');
          }
        },
      },
    },
  });

  Conduit.prototype.toJSON = function () {
    return {
      id: this.id,
      suriApiKey: this.suriApiKey,
      suriType: this.suriType,
      suriObjectKey: this.suriObjectKey,
      curi: this.curi,
      allowlist: this.allowlist,
      racm: this.racm,
      throttle: this.throttle,
      status: this.status,
      description: this.description,
      hiddenFormField: this.hiddenFormField,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  };

  const User = require('./user')(db, DataTypes);

  Conduit.belongsTo(User, {
    onDelete: 'cascade',
    allowNull: false,
    targetKey: 'id',
  });

  return Conduit;
};
