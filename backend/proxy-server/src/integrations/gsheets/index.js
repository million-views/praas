const afetch = require('../../../../lib/afetch');
const { RestApiError } = require('../../../../lib/error');

function metaTransform(data) {
  const {
    spreadsheetId: baseId,
    properties: { title: base, locale, timeZone },
    sheets: [
      {
        properties: { title: table, sheetId: tableId, sheetType: tableType },
        data: [
          {
            rowData: [{ values: rawFieldData }],
          },
          ,
        ],
      },
    ],
  } = data;

  const fields = {};
  // NOTE: we only consider sequential columns with a non-empty cell value
  //       to be part of the table meta data; columns with a non-empty cell
  //       value are *not* considered as part of the table! this loop will
  //       break out on the first cell that is empty
  // TODO: decide on which value to use as the field name:
  //       - formattedValue
  //       - userEnteredValue
  //       - effectiveValue

  let skip = false,
    managedFieldCount = 0,
    totalFieldCount = 0;
  for (let i = 0, imax = rawFieldData.length; i < imax; i++) {
    const {
      formattedValue: fv,
      // eslint-disable-next-line no-unused-vars
      userEnteredValue: { stringValue: uev } = { stringValue: undefined },
      // eslint-disable-next-line no-unused-vars
      effectiveValue: { stringValue: ev } = { stringValue: undefined },
    } = rawFieldData[i];
    // console.log('fv: ', fv, ' uev: ', uev, ' ev: ', ev);
    totalFieldCount++;
    if (!skip) {
      if (fv) {
        fields[fv] = i;
        managedFieldCount++;
      } else {
        // sticky once triggered... rewrite this once we are are sure about
        // all the use cases are understood and confirm we don't need the
        // totalFieldCount to compute the effective grid area.
        skip = true; // sticky once triggered
      }
    }
  }

  const meta = {
    locale,
    timeZone,
    base,
    baseId,
    table,
    tableId,
    tableType,
    fields,
    managedFieldCount,
    totalFieldCount,
  };

  return meta;
}

async function metaFetch(service, container, token) {
  // container (a.k.a resource_path) consists of a base and a path to an object
  // in the base.
  const index = container.indexOf('/');
  let bases = [container, ''];
  if (index !== -1) {
    bases = [container.slice(0, index), container.slice(index + 1)];
  }
  const base = bases[0];
  const sheet = bases[1];
  const urlBase = `${service}${base}`;
  const probe = `${sheet ?? ''}!A1:Z1`;
  let data;

  try {
    const options = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      parameters: {
        ranges: probe,
        includeGridData: true,
      },
      onNotOk: 'reject',
    };
    const result = await afetch(urlBase, options);
    data = result.data;
  } catch (error) {
    const { status, errors } = error;
    throw new RestApiError(status, { ...errors.error });
  }

  // process and return meta
  return { ...metaTransform(data), url: urlBase, probe };
}

// NOTE: the interface is evolving and experimental
function GSheets({ debug = false }) {
  const metacache = new Map();

  async function metaget(suri, container, inbound) {
    if (debug) {
      console.log(suri, container, inbound.token);
    }

    let meta = metacache.get(container);
    if (!meta) {
      meta.cached = true;
    } else {
      meta = await metaFetch(suri, container, inbound.token);
      metacache.set(container, meta);
    }

    return meta;
  }

  async function imap({ suri, container, ...inbound }) {
    const meta = await metaget(suri, container, inbound);

    const outbound = {
      method: inbound.method,
      headers: inbound.headers,
      meta,
    };

    return { okay: true, url: meta.url, outbound };
  }

  async function transmit({ url, meta, ...outbound }) {
    const response = await afetch(url, outbound);
    const status = response.status;
    const data = await response.json();

    return { status, data };
  }

  function omap({ status, data }) {
    return { status, data };
  }

  return { imap, transmit, omap };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 2) {
    console.log(`requesting meta for ${args[0]} ...`);
    (async function () {
      try {
        const meta = await metaFetch(
          'https://sheets.googleapis.com/v4/spreadsheets/',
          args[0],
          args[1]
        );
        console.log(meta);
      } catch (e) {
        console.log(e);
      }
    })();
  } else {
    console.log('gsheets <resource-path> <access-token>');
  }
}

module.exports = {
  GSheets,
};
