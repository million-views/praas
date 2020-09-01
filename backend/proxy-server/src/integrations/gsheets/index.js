const fetch = require('node-fetch');

// NOTE: the interface is evolving and experimental
/*
Conduits:
POST https://{cid}.conduits.xyz

{
  "records": [{
     "fields": {
       "Name": "Jack",
       "Email": "jack@example.com"
    }
  },
  {
     "fields": {
       "Name": "Jill",
       "Email": "jill@example.com"
    }
  }]
}


GSheets:
POST https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}:append

{
  "range": "B1:C2",
  "majorDimension": "COLUMNS",
  "values": [ [ "Jack", "jack@example.com" ], [ "Jill", "jill@example.com" ] ]
}

----
fields: [Name, Email] -> B?, C?

READ, WRITE, UPDATE, LIST
*/

function GSheets({ debug = false }) {
  const metacache = new Map();

  function imap({ suri, container, ...inbound }) {
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
