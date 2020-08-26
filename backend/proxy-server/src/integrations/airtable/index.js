const fetch = require('node-fetch');

async function pushData(url, options) {
  const response = await fetch(url, options);
  const status = response.status;
  const responseJSON = await response.json();

  return {
    status,
    data: responseJSON,
  };
}

module.exports = {
  pushData,
};
