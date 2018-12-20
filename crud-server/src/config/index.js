// TODO
// - add dotenv support to fetch secret
// - figure out if we need anything here to support postgresql in production
module.exports = {
  secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret',
  production: process.env.NODE_ENV === 'production',
  port: process.env.PORT || 3000
};
