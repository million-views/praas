// For now, the configuration settings are few, so storing them
// as object variable. Some entities in this config may move into a database
// and be included as part of the resource-server REST api.
//
// TODO:
// - add dotenv support to fetch secret
// - figure out if we need anything here to support postgresql in production
module.exports = {
  test: {
    description: 'Test configuration settings',
    settings: {
      passwordSuffix: '123', // a test user's password is name+suffix
      conduitsCount: 25, // create N conduits for integration test
      conduitsPerPage: 10, // expect M conduits in response
    },
  },
  system: {
    description: 'System configuration settings',
    settings: {
      secret:
        process.env.NODE_ENV === 'production'
          ? process.env.SECRET
          : 'super-secret',
      production: process.env.NODE_ENV === 'production',
      apiServerPort: process.env.API_SERVER_PORT || 4000,
      gwServerPort: process.env.GW_SERVER_PORT || 5000,
      cacheRefreshInterval: 10 * 1000, // currently set to 10 seconds
    },
  },
  targets: {
    // supported by the gateway
    description: 'Target service endpoints settings - READONLY',
    settings: [
      {
        type: 'googleSheets',
        name: 'Google Sheets',
      },
      {
        type: 'airtable',
        name: 'Airtable',
      },
      { type: 'email', name: 'Email' },
    ],
  },
  conduit: {
    description: 'Conduit configuration settings',
    settings: {
      alphabet: '123456789abcdefghjkmnopqrstuvwxyz',
      uccount: 5,
      prefix: 'td',
      domain: 'trickle.cc',
      curiLen: 19,
      // 2 + // this.prefix.length
      // 1 + // for the '-' in makeCuri
      // 5 + // this.uccount
      // 1 + // for the '.' in makeCuri
      // 10  // this.domain.length
    },
  },
};
