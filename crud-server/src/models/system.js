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
      uccount: '5'
    }
  }
};
