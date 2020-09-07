const afetch = require('../../../../lib/afetch');

// NOTE: the interface is evolving and experimental
function Airtable({ debug = false }) {
  async function onNotOkay(response) {
    const status = response.status;
    if (status !== 418) {
      Promise.resolve({
        status: response.status,
        data: await response.json(),
      });
    } else {
      Promise.reject(response);
    }
  }

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
      onNotOkay,
    };

    return { okay: true, url, outbound };
  }

  async function transmit({ url, outbound }) {
    const { status, data } = await afetch(url, outbound);
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
