const afetch = require('../../../../lib/afetch');
const { RestApiError } = require('../../../../lib/error');

// service api endpoint of the target integration
const SAPI = 'https://api.airtable.com/v0/';

// NOTE: the interface is evolving and experimental
function Airtable({ debug = false }) {
  async function imap({ container, ...inbound }) {
    let url = SAPI;
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
    let parameters = undefined;
    if (inbound.method === 'DELETE' && inbound.query.records) {
      parameters = {
        records: inbound.query.records,
      };
    }

    const outbound = {
      method: inbound.method,
      parameters,
      qformat: 'bracket',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${inbound.token}`,
      },
      body,
    };

    return { url, outbound };
  }

  async function transmit({ url, outbound }) {
    try {
      const { status, data } = await afetch(url, outbound);
      return { status, data };
    } catch (error) {
      const { status, errors } = error;
      throw new RestApiError(status, errors);
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
