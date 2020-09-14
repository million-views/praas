const afetch = require('../../../../lib/afetch');
const { RestApiError } = require('../../../../lib/error');

// gateway has already performed sanity checks, assume body has the
// correct shape.
// NOTE:
// - Null values will be skipped.
// - To set a cell to an empty value, set the string value to an empty string.
// - If inbound method is POST or PATCH, we set the cell value to be null
//   so that any existing value is preserved. If inbound method is PUT then
//   we set the cell value to '' so that existing value is cleared.
function mapPayloadFor(method, usingMeta, input) {
  const records = input.records;
  const values = [];

  for (let i = 0, imax = records.length; i < imax; i++) {
    const inputRow = records[i].fields;
    const outputRow = [];
    for (let j = 0, jmax = usingMeta.length; j < jmax; j++) {
      const cname = usingMeta[j],
        cvalue = inputRow[cname];
      if (cvalue) {
        outputRow.push(cvalue);
      } else {
        // input doesn't have a field - decide if the missing field needs
        // be cleared or skipped
        if (method === 'POST' || method === 'PATCH') {
          outputRow.push(null);
        } else if (method === 'PUT') {
          outputRow.push('');
        }
      }
    }
    values.push(outputRow);
  }

  return values;
}

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

  const fields = []; // array because sequence matters!
  // NOTE: we only consider sequential columns with a non-empty cell value
  //       to be part of the table meta data; columns with a non-empty cell
  //       value are *not* considered as part of the table! this loop will
  //       break out on the first cell that is empty

  let skip = false,
    managedFieldCount = 0,
    totalFieldCount = 0;
  for (let i = 0, imax = rawFieldData.length; i < imax; i++) {
    const { formattedValue: fv } = rawFieldData[i];
    totalFieldCount++;
    if (!skip) {
      if (fv) {
        fields.push(fv);
        managedFieldCount++;
      } else {
        // sticky once triggered... rewrite this once all use cases are
        // understood and confirm we don't need the totalFieldCount to
        // compute the effective grid area.
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
        fields:
          'spreadsheetId,properties.title,properties.locale,properties.timeZone,sheets(properties,data.rowData.values(formattedValue))',
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

  // WIP... not ready yet
  async function imap({ suri, container, method, body, ...rest }) {
    const meta = await metaget(suri, container, rest);
    const urlBase = meta.url;
    const payload = mapPayloadFor(method, meta.fields, body);

    // TODO:
    // - identify where A1 notation goes based on POST/PUT/PATCH
    //   - POST => add row, A1 notation in url
    //   - PUT/PATCH => replace/update, A1 notation in payload
    //   - DELETE => delete row(s), A1 notation in payload
    const outbound = {
      url: urlBase,
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rest.token}`,
      },
      body: payload,
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
  if (args.length === 0) {
    const meta = ['name', 'email', 'hiddenFormField'];
    const input = {
      records: [
        {
          fields: {
            name: 'Jack 1',
            email: 'jack.1@last.com',
            hiddenFormField: 'hff-1',
          },
        },
        {
          fields: {
            name: 'Jack 2',
            hiddenFormField: 'hff-2',
          },
        },
        {
          fields: {
            name: 'Jack 3',
            email: 'jack.3@last.com',
          },
        },
      ],
    };
    console.log('testing mapping function...');
    let output = mapPayloadFor('POST', meta, input);
    console.log('mapped output for POST...:', output);
    output = mapPayloadFor('PATCH', meta, input);
    console.log('mapped output for PATCH...:', output);
    output = mapPayloadFor('PUT', meta, input);
    console.log('mapped output for PUT...:', output);
  } else if (args.length === 2) {
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
