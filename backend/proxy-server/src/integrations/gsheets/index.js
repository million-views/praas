const fetch = require('node-fetch');

// NOTE: the interface is evolving and experimental
function GSheets({ debug = false }) {
  const metacache = new Map();

  function imap({ suri, container, ...inbound }) {
    console.log(suri, container, inbound.headers);
    const meta = metacache.get(container) ?? {};
    const url = suri + container;

    return { okay: true, meta, url, inbound };
  }

  async function transmit({ url, ...outbound }) {
    const response = await fetch(url, outbound);
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
  GSheets,
};
