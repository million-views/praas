/*
For now, the configuration settings are few, so storing them
as object variable. When more settings need to be added,
will convert to a database entity.
*/
module.exports = {
  cconf: {
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
    }
  }
};
