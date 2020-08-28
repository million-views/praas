const fetch = require('node-fetch');

// NOTE: the interface is evolving and experimental

function Airtable({ debug = false }) {
  function imap({ url, options }) {
    return { okay: true, url, options };
  }

  async function transmit({ url, options }) {
    const response = await fetch(url, options);
    const status = response.status;
    const data = await response.json();

    return { status, data };
  }

  function omap({ status, data }) {
    return { status, data };
  }

  return { imap, transmit, omap };
}

module.exports = {
  Airtable,
};
