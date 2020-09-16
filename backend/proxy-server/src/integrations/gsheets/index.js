const afetch = require('../../../../lib/afetch');
const { RestApiError } = require('../../../../lib/error');
const { freezeall } = require('../../../../lib/util');

const inspect = require('util').inspect;

// service api endpoint of the target integration
const SAPI = 'https://sheets.googleapis.com/v4/spreadsheets/';
const FIELD_MASK_FOR_META_PROBE = [
  'spreadsheetId',
  'properties.title',
  'properties.locale',
  'properties.timeZone',
  'sheets(properties,data.rowData.values(formattedValue))',
].join(',');

const FIELD_MASK_FOR_BATCH_UPDATE = [
  'spreadsheetId',
  'totalUpdatedRows',
  'totalUpdatedColumns',
  'totalUpdatedCells',
  'responses.updatedData(range,values)',
].join(',');

// see https://developers.google.com/sheets/api/guides/concepts
// this doesn't do what we want which is to get a list of deleted rows
// from deleteDimension request, so practically useless.
//
// since a lot of time was sunk in trying to figure out the format for
// partial response from a full sheet, it's left here for reference
//
// NOTE: this only works in combination with "responseRanges" to restrict
//       the return response to only the rows and columsn of interest; without
//       it the response contains the entire spreadsheet and makes it doubly
//       useless :-(
// Use in combination with responseRanges in the "requests"
// e.g "responseRanges":"{{table}}!A2:C",
const FIELD_MASK_FOR_SHEET_DATA = [
  'spreadsheetId',
  'updatedSpreadsheet(sheets(properties(sheetId,title),data.rowData.values(formattedValue)))',
].join(',');

function columnToLetter(column) {
  let temp;
  let letter = '';
  let col = column;
  while (col > 0) {
    temp = (col - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    col = (col - temp - 1) / 26;
  }
  return letter;
}

// gateway has already performed sanity checks, assume body has the
// correct shape.
//
// NOTE:
// - Although Sheets API seems to be suggesting that a 'PUT' will set data
//   in a row destructively, the behaviour is actually controlled by the
//   cell value themselves in the value range. Which is the case for 'POST'
//   as well. It's not clear as to when a PUT vs POST is called for when the
//   the valueRange seems to dictate the behaviour :-(
// - Behaviour of valueRange cell value:
//   - Null values will be skipped.
//   - To set a cell to an empty value, set the string value to an empty string.
// - From the above, the current plan is:
//   - If inbound method is POST or PATCH, we set the cell value to be null
//     so that any existing value is preserved.
//   - If inbound method is PUT then we set the cell value to '' so that
//     existing value is cleared.
function mapRequest(method, meta, rest) {
  const metaFields = meta.fields;
  const outboundRequest = { ...meta.api[method]?.mapsTo };
  const slots = {
    POST: 'values',
    PATCH: 'data',
    PUT: 'data',
    DELETE: 'requests',
  };

  const slot = slots[method];

  if (method === 'GET') {
    // replace ranges with either a single record request or multiple record
    // request.
  } else if (method === 'DELETE') {
    console.log(rest.query);
    const body = { ...meta.api[method]?.bodyTemplate };

    // TODO: optimize using rangeset function
    const requests = rest.query?.records.map((id) => {
      return {
        deleteDimension: {
          range: {
            sheetId: meta.tableId,
            dimension: 'ROWS',
            startIndex: id,
            endIndex: id,
          },
        },
      };
    });
    Object.assign(body, { [slot]: requests });
    outboundRequest.body = body;
  } else {
    const records = rest.body.records;
    const values = [];

    // input doesn't have a field - decide if the missing field needs
    // be skipped or set/cleared
    const cellDefault = method === 'PATCH' ? null : '';
    for (let i = 0, imax = records.length; i < imax; i++) {
      const inputRow = records[i].fields;
      const outputRow = [];
      for (let j = 0, jmax = metaFields.length; j < jmax; j++) {
        const cname = metaFields[j],
          cvalue = inputRow[cname];
        if (cvalue) {
          outputRow.push(cvalue);
        } else {
          outputRow.push(cellDefault);
        }
      }
      values.push(outputRow);
    }
    const body = { ...meta.api[method]?.bodyTemplate };
    Object.assign(body, { [slot]: values });
    outboundRequest.body = body;
  }

  return outboundRequest;
}

// assumes data contains meta for a single sheet; if there are multiple
// sheets then meta for the first sheet is returned.
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

  // map conduits REST API operations to GSheets REST API
  const lastColumn = columnToLetter(managedFieldCount);
  const urlBase = `${SAPI}${baseId}`;

  // NOTE:
  // - api contains certain elements that exist to remind us of the shape
  //   of the body that gsheets API expects.
  // - the entire meta object is frozen to prevent accidental mutation
  const api = {
    // conduits GET api maps to:
    // - GET https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values:batchGet
    // - NOTE: row 1 (i.e A1) is assumed to be the header!
    // - multiple ranges are passed as query parameters as in:
    //    &ranges={{table}}!A1:C1
    //    &ranges={{table}}!A2:C2
    //    &ranges={{table}}!A2:C
    GET: {
      mapsTo: {
        method: 'GET',
        url: `${urlBase}/values:batchGet`,
        parameters: {
          majorDimension: 'ROWS',
          valueRenderOption: 'UNFORMATTED_VALUE',
          ranges: [`${table}!A1:C`], // <- fix me to support multiple ranges
        },
      },
    },
    // conduits POST api maps to:
    // - POST https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}:append
    POST: {
      mapsTo: {
        method: 'POST',
        url: `${urlBase}/values/${table}!A2:${lastColumn}:append`,
        parameters: {
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          includeValuesInResponse: true,
        },
      },
      bodyTemplate: {
        values: [], // <- of rows, each row an array of values
      },
    },
    // conduits PATCH api maps to:
    // - POST https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values:batchUpdate
    // - Gsheets API doesn't have a PATCH method!
    // - distinction between overwriting a cell value versus leaving it untouched
    //   is handled by the valueRange specfication; in the case of POST we set the
    //   cell value to null to skip updating existing cell value.
    PATCH: {
      mapsTo: {
        method: 'POST',
        url: `${urlBase}/values:batchUpdate`,
        parameters: {
          fields: FIELD_MASK_FOR_BATCH_UPDATE,
        },
      },
      bodyTemplate: {
        valueInputOption: 'RAW',
        includeValuesInResponse: true,
        data: [], // <- of valueRange items
      },
    },
    // conduits PUT api maps to:
    // - POST https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values:batchUpdate
    // - we do not use PUT of gsheets api since it assumes rows are sequential
    // - distinction between overwriting a cell value versus leaving it untouched
    //   is handled by the valueRange specfication; in the case of PUT we set the
    //   cell value to '' to 'destructively' replace.
    PUT: {
      mapsTo: {
        method: 'POST',
        url: `${urlBase}/values:batchUpdate`,
        parameters: {
          fields: FIELD_MASK_FOR_BATCH_UPDATE,
        },
      },
      bodyTemplate: {
        valueInputOption: 'RAW',
        includeValuesInResponse: true,
        data: [], // <- of valueRange items
      },
    },
    // conduits DELETE api maps to:
    // - POST https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}:batchUpdate
    // - use 'requests: deleteDimension' and 'valueRange' specification
    // - indexes are 0 based and range is half close
    // - note: fields is not really useful but left here for reference
    DELETE: {
      mapsTo: {
        method: 'POST',
        url: `${urlBase}:batchUpdate`,
        parameters: {
          fields: FIELD_MASK_FOR_SHEET_DATA,
        },
      },
      bodyTemplate: {
        includeSpreadsheetInResponse: true,
        responseIncludeGridData: false,
        responseRanges: `${table}!A2:${lastColumn}`,
        requests: [], // <- of "deleteDimension" items
      },
    },
  };

  // prettier-ignore
  const meta = {
    locale, timeZone,
    base, baseId,
    table, tableId, tableType,
    fields, managedFieldCount, totalFieldCount,
    api
  };

  // make the entire metadata read-only to preserve shape and prevent
  // accidental mutation
  return freezeall(meta);
}

// TODO
//
async function metaFetch(container, token) {
  // container (a.k.a resource_path) consists of a base and a path to an object
  // in the base.
  const index = container.indexOf('/');
  let bases = [container, ''];
  if (index !== -1) {
    bases = [container.slice(0, index), container.slice(index + 1)];
  }
  const base = bases[0];
  const sheet = bases[1];
  const urlBase = `${SAPI}${base}`;
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
        fields: FIELD_MASK_FOR_META_PROBE,
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

  async function metaget(container, inbound) {
    if (debug) {
      console.log(SAPI, container, inbound.token);
    }

    let meta = metacache.get(container);
    if (!meta) {
      meta.cached = true;
    } else {
      meta = await metaFetch(SAPI, container, inbound.token);
      metacache.set(container, meta);
    }

    return meta;
  }

  // WIP... not ready yet
  async function imap({ container, method, ...rest }) {
    const meta = await metaget(container, rest);
    const { url, method: apiCall, parameters, body } = mapRequest(
      method,
      meta,
      rest
    );

    // TODO:
    // - identify where A1 notation goes based on POST/PUT/PATCH
    //   - POST => add row, A1 notation in url
    //   - PUT/PATCH => replace/update, A1 notation in payload
    //   - DELETE => delete row(s), A1 notation in payload

    const outbound = {
      method: apiCall,
      url,
      parameters,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rest.token}`,
      },
      body,
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

function main() {
  // the real payload of conduits api will not have "id" field
  // for POST, but will for PUT and PATCH.
  const input = {
    GET: {
      path: '/1',
      query: [],
    },
    POST: {
      body: {
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
      },
    },
    PATCH: {
      body: {
        records: [
          {
            id: 1,
            fields: {
              name: 'Jack 1 updated',
              // all other fields should remain intact
            },
          },
          {
            id: 2,
            fields: {
              // all other fields should remain intact
              hiddenFormField: 'hff-2 updated',
            },
          },
          {
            id: 3,
            fields: {
              name: 'Jack 3 got a boost',
              hiddenFormField: 'I did not exist before!',
            },
          },
        ],
      },
    },
    PUT: {
      body: {
        records: [
          {
            id: 1,
            fields: {
              name: 'Jack 1',
              email: 'jack.1@last.com',
              // this field will be cleared
              // hiddenFormField: 'hff-1'
            },
          },
          {
            id: 2,
            fields: {
              name: 'Jack 2',
              // this field should be set
              email: 'jack.2@last.com',
              // and this field should be cleared
              // hiddenFormField: 'hff-2',
            },
          },
          {
            id: 3,
            fields: {
              name: 'Jack 3',
              email: 'jack.3@last.com',
            },
          },
        ],
      },
    },
    DELETE: {
      query: { records: [1, 2, 3] },
    },
  };

  async function smokeMapRequestTest(method, meta) {
    return await mapRequest(method, meta, input[method]);
  }

  async function smokeMapResponseTest() {}

  async function smokeMetaFetchTest(resourcePath, token) {
    try {
      const meta = await metaFetch(resourcePath, token);
      return meta;
    } catch (e) {
      console.log(e);
    }
  }

  return { smokeMapRequestTest, smokeMapResponseTest, smokeMetaFetchTest };
}

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length >= 2) {
    const run = main();
    (async function () {
      try {
        const meta = await run.smokeMetaFetchTest(args[0], args[1]);
        // console.log(inspect(meta, { depth: 4 }));
        if (args.length === 3) {
          const output = await run.smokeMapRequestTest(args[2], meta);
          console.log(
            'mapped request for',
            args[2],
            inspect(output, { depth: 6 })
          );
        }
      } catch (e) {
        console.log(e);
      }
    })();
  } else {
    console.log('gsheets <resource-path> <access-token> [method]');
  }
}

module.exports = {
  GSheets,
};
