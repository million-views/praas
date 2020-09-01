const fetch = require('node-fetch');
const { RestApiError } = require('../../../../lib/error');

// NOTE: the interface is evolving and experimental
function Airtable({ debug = false }) {
  function imap({ suri, container, ...inbound }) {
    let url = suri;
    if (container) {
      // mdn strongly recommends + or += operator for performance
      url += container;
    }

    url += inbound.path;

    let body = inbound.body;
    if (body) {
      body = JSON.stringify(body);
    }

    // Multi DELETE to be sent as query paramters
    // TODO:
    // - is it per spec or is this an alternative?
    if (inbound.method === 'DELETE' && inbound.query.records) {
      url += inbound.query.records.reduce(
        (q, i) => q + `records[]=${i}&`,
        '?'
      );
    }

    const outbound = {
      method: inbound.method,
      headers: inbound.headers,
      body,
    };

    return { okay: true, url, outbound };
  }

  async function transmit({ url, outbound }) {
    try {
      const response = await fetch(url, outbound);
      const status = response.status;
      const data = await response.json();
      return { status, data };
    } catch (error) {
      // FIXME!!
      // need analysis of various error conditions and allow the gateway
      // to handle them gracefully.
      throw new RestApiError(500, error);
    }
  }

  function omap({ status, data }) {
    return { status, data };
  }

  return { imap, transmit, omap };
}

module.exports = {
  Airtable,
};
