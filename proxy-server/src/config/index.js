// TODO
// - add dotenv support to fetch secret
// - figure out if we need anything here to support postgresql in production
module.exports = {
  secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret',
  production: process.env.NODE_ENV === 'production',
  port: process.env.PORT || 5000,
  testPwdSuffix: '123',
  cacheRefreshInterval: 10 * 1000 // currently set to 10 seconds
};
