const server = require('./server');
const models = require('./models');

const init = async () => {
  await models.db.sync({ force: false });

  await server.app.listen(server.port, () => {
    console.log(`Conduits API server is listening on port ${server.port}`);
  });
};

init();
