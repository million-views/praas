const afetch = require('../../../../lib/afetch');
const { RestApiError } = require('../../../../lib/error');
const { freezeall, rangeset } = require('../../../../lib/util');

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
  const bodySlots = {
    POST: 'values',
    PATCH: 'data',
    PUT: 'data',
    DELETE: 'requests',
  };
  const slot = bodySlots[method];

  // hack to help in transforming the response at a later stage
  // NOTE: I think we should normalize the API to have a unified
  //       response format even for a single row operation.
  const memo = JSON.parse(
    JSON.stringify(meta, [
      'table',
      'tableId',
      'tableType',
      'fields',
      'managedFieldCount',
      'totalFieldCount',
      'lastColumn',
    ])
  );
  memo.method = method;

  function mapGET() {
    const mappedRequest = { ...meta.api[method]?.mapsTo };
    // replace ranges with either a single record request or multiple record
    // request.
    const rowId = Number.parseInt(rest.path.substring(1));
    const ranges = [];
    if (Number.isSafeInteger(rowId)) {
      ranges.push(
        `${meta.table}!A${rowId + 1}:${meta.lastColumn}${rowId + 1}`
      );
      memo.expectedRowCount = 'one';
    } else {
      // TODO: deal with pagination parameters; for now return all rows
      ranges.push(`${meta.table}!A2:${meta.lastColumn}`);
      memo.expectedRowCount = 'many';
      // starting row id
    }

    const parameters = { ...mappedRequest.parameters, ranges };
    mappedRequest.parameters = parameters;
    mappedRequest.memo = memo;
    return mappedRequest;
  }

  function mapDELETE() {
    const mappedRequest = { ...meta.api[method]?.mapsTo };
    const body = { ...meta.api[method]?.bodyTemplate };

    const records = rest.query.records ?? [];
    if (records.length === 0) {
      const rowId = Number.parseInt(rest.path.substring(1));
      if (Number.isInteger(rowId)) {
        records.push(rowId);
        memo.expectedRowCount = 'one';
      }
    } else {
      memo.expectedRowCount = 'many';
    }

    // need this to be able to return a response with the id of
    // of the rows that got deleted.
    memo.deleteRows = records;

    // optimize using rangeset function
    const ranges = rangeset(
      records,
      (start, end) => {
        return {
          startIndex: start,
          endIndex: end,
        };
      },
      true
    );

    // console.log('rangeset: ', ranges);
    // TODO:
    // it is unclear how the API behaves when multiple row
    // ranges are provided for DELETE... needs more analysis
    const requests = ranges.map((id) => {
      return {
        deleteDimension: {
          range: {
            sheetId: meta.tableId,
            dimension: 'ROWS',
            ...id,
          },
        },
      };
    });

    Object.assign(body, { [slot]: requests });
    mappedRequest.body = body;
    mappedRequest.memo = memo;
    return mappedRequest;
  }

  function mapPOST() {
    const mappedRequest = { ...meta.api[method]?.mapsTo };
    const body = { ...meta.api[method]?.bodyTemplate };
    const cellDefault = ''; // <- default to this for unspecified fields
    const records = rest.body.records ?? [rest.body];
    const single = !rest.body.records;
    const values = [];

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
    Object.assign(body, { [slot]: values });
    mappedRequest.body = body;
    // FIXME
    // or the test case... we need to normalize the API to use the
    // same format regardless of the number of rows being posted
    memo.expectedRowCount = single ? 'one' : 'many';
    mappedRequest.memo = memo;

    return mappedRequest;
  }

  function mapPATCH() {
    const cellDefault = null; // <- preserve existing cell value
    const mappedRequest = { ...meta.api[method]?.mapsTo };
    const body = { ...meta.api[method]?.bodyTemplate };

    const records = rest.body.records ?? [rest.body];
    const single = !rest.body.records;
    const data = [];

    if (records.length === 1 && single) {
      const sid = rest.path.substring(1); // possible id in path
      const rowId = Number.parseInt(sid);
      if (Number.isInteger(rowId)) {
        records[0].id = rowId;
        memo.expectedRowCount = 'one';
      } else {
        throw new RestApiError(422, {
          message: `invalid record id (${sid})`,
        });
      }
    } else {
      memo.expectedRowCount = 'many';
    }

    for (let i = 0, imax = records.length; i < imax; i++) {
      const inputRow = records[i].fields;
      const inputRowId = records[i].id;
      const values = [];
      for (let j = 0, jmax = metaFields.length; j < jmax; j++) {
        const cname = metaFields[j],
          cvalue = inputRow[cname];
        if (cvalue) {
          values.push(cvalue);
        } else {
          values.push(cellDefault);
        }
      }

      const outputRow = {
        range: `${meta.table}!A${inputRowId + 1}`,
        majorDimension: 'ROWS',
        values: [values],
      };

      data.push(outputRow);
    }

    Object.assign(body, { [slot]: data });
    mappedRequest.body = body;
    mappedRequest.memo = memo;

    return mappedRequest;
  }

  function mapPUT() {
    const cellDefault = ''; // <- clear current cell value
    const mappedRequest = { ...meta.api[method]?.mapsTo };
    const body = { ...meta.api[method]?.bodyTemplate };

    const records = rest.body.records ?? [rest.body];
    const single = !rest.body.records;
    const data = [];

    if (records.length === 1 && single) {
      const sid = rest.path.substring(1); // possible id in path
      const rowId = Number.parseInt(sid);
      if (Number.isInteger(rowId)) {
        records[0].id = rowId;
        memo.expectedRowCount = 'one';
      } else {
        throw new RestApiError(422, {
          message: `invalid record id (${sid})`,
        });
      }
    } else {
      memo.expectedRowCount = 'many';
    }

    for (let i = 0, imax = records.length; i < imax; i++) {
      const inputRow = records[i].fields;
      const inputRowId = records[i].id;

      const values = [];
      for (let j = 0, jmax = metaFields.length; j < jmax; j++) {
        const cname = metaFields[j],
          cvalue = inputRow[cname];
        if (cvalue) {
          values.push(cvalue);
        } else {
          values.push(cellDefault);
        }
      }
      const outputRow = {
        range: `${meta.table}!A${inputRowId + 1}`,
        majorDimension: 'ROWS',
        values: [values],
      };

      data.push(outputRow);
    }

    Object.assign(body, { [slot]: data });
    mappedRequest.body = body;
    mappedRequest.memo = memo;

    return mappedRequest;
  }

  const mapper = {
    GET: mapGET,
    DELETE: mapDELETE,
    PATCH: mapPATCH,
    POST: mapPOST,
    PUT: mapPUT,
  };

  const mappedRequest = mapper[method]();
  return mappedRequest;
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
          ranges: [], // <- one or more ranges
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
    fields, managedFieldCount, totalFieldCount, lastColumn,
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
    let meta = metacache.get(container);
    if (!meta) {
      meta = await metaFetch(container, inbound.token);
      metacache.set(container, meta);
    }

    return meta;
  }

  // WIP... not ready yet
  async function imap({ container, method, ...rest }) {
    const meta = await metaget(container, rest);
    const { url, method: apiCall, parameters, body, memo } = mapRequest(
      method,
      meta,
      rest
    );

    return {
      method: apiCall,
      url,
      parameters,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rest.token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
      memo,
    };
  }

  async function transmit({ url, memo, ...outbound }) {
    try {
      const { status, data } = await afetch(url, outbound);
      return { status, data, memo };
    } catch (error) {
      const { status, errors } = error;
      throw new RestApiError(status, errors);
    }
  }

  // FIXME:
  // this function will break if the sheet name includes a number!!!!
  function translateRange(range) {
    // known formats:
    // - Contacts!A3:C3",
    // - !A3:C3
    // - !A3:C
    // - A3:C
    // - A3
    // - Contacts!A3
    const matched = range.match(/\d+/g).map((i) => Number(i));
    // console.log('range: ', range, ', matched: ', matched);
    return matched;
  }

  function omap({ memo, status, data }) {
    const {
      expectedRowCount,
      fields,
      method,
      // table,
      // tableId,
      // lastColumn,
    } = memo;

    const mappedResponse = {};
    if (method === 'GET') {
      // NOTE:
      // - we only support contiguous rows (for now), even though we use
      //   batchGet which allows us to fetch discontiguous row ranges
      // - Any "empty" fields (e.g. "", [], or false) in the record will
      //   not be returned.
      const [start] = translateRange(data.valueRanges[0].range);
      const rows = data.valueRanges[0].values ?? [];
      const records = [];
      for (let i = 0, imax = rows.length; i < imax; i++) {
        // hack the record id and createdTime for now
        const createdTime = new Date().toISOString();
        // prettier-ignore
        const record = { id: start - 1 + i, createdTime }, row = rows[i], data = {};
        for (let j = 0, jmax = row.length; j < jmax; j++) {
          const fval = row[j];
          if (fval) {
            data[fields[j]] = fval;
          }
        }
        record.fields = data;
        records.push(record);
      }

      if (expectedRowCount === 'one') {
        Object.assign(mappedResponse, records[0]);
      } else {
        mappedResponse.records = records;
      }
    } else if (method === 'DELETE') {
      // gsheets povides no clues about the rows that got deleted other
      // than to say the request completed successfully or in error; so
      // on success we recreate response from request query.
      const deletedRows = memo.deleteRows;
      const records = [];
      for (let i = 0, imax = deletedRows.length; i < imax; i++) {
        records.push({ deleted: true, id: Number.parseInt(deletedRows[i]) });
      }
      if (expectedRowCount === 'one') {
        Object.assign(mappedResponse, records[0]);
      } else {
        mappedResponse.records = records;
      }
    } else if (method === 'POST') {
      const [start] = translateRange(data.updates.updatedData.range);

      const rows = data.updates.updatedData.values ?? [];
      const records = [];
      for (let i = 0, imax = rows.length; i < imax; i++) {
        // hack the record id and createdTime for now
        const createdTime = new Date().toISOString();
        // prettier-ignore
        const record = { id: start - 1 + i, createdTime }, row = rows[i], data = {};
        for (let j = 0, jmax = row.length; j < jmax; j++) {
          const fval = row[j];
          if (fval) {
            data[fields[j]] = fval;
          }
        }
        record.fields = data;
        records.push(record);
      }

      if (expectedRowCount === 'one') {
        Object.assign(mappedResponse, records[0]);
      } else {
        mappedResponse.records = records;
      }
    } else if (method === 'PATCH' || method === 'PUT') {
      // NOTE:
      // - this is completely hard coded to how the current design
      //   of the ingress API is. And subject to change. Atm consider
      //   this as poc.
      const rows = data.responses ?? [];
      const records = [];
      for (let i = 0, imax = rows.length; i < imax; i++) {
        // hack the record id and createdTime for now
        const createdTime = new Date().toISOString();
        const row = rows[i].updatedData;
        const [start] = translateRange(row.range);
        // prettier-ignore
        const record = { id: start+1, createdTime }, data = {};
        for (let j = 0, jmax = row.values[0].length; j < jmax; j++) {
          const fval = row.values[0][j];
          if (fval) {
            data[fields[j]] = fval;
          }
        }
        record.fields = data;
        records.push(record);
      }

      if (expectedRowCount === 'one') {
        Object.assign(mappedResponse, records[0]);
      } else {
        mappedResponse.records = records;
      }
    }

    return { status, data: mappedResponse };
  }

  return { imap, transmit, omap };
}

function main() {
  // conduit API requests have the following shape
  const inbound = {
    GET: [
      // get one
      {
        path: '/1',
        query: {},
      },
      // get all
      {
        path: '/',
        query: {}, // <- TODO, more options go here
      },
    ],
    POST: [
      // add one row
      {
        path: '/',
        query: {},
        body: {
          records: [
            {
              fields: {
                name: 'Jack 1',
                email: 'jack.1@last.com',
                hiddenFormField: 'hff-1',
              },
            },
          ],
        },
      },
      // add multiple rows
      {
        path: '/',
        query: {},
        body: {
          records: [
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
            {
              fields: {
                name: 'Jack 4',
                email: 'jack.4@last.com',
              },
            },
            {
              fields: {
                name: 'Jack 5',
                email: 'jack.5@last.com',
              },
            },
            {
              fields: {
                name: 'Jack 6',
                email: 'jack.6@last.com',
              },
            },
            {
              fields: {
                name: 'Jack 7',
                email: 'jack.7@last.com',
              },
            },
          ],
        },
      },
    ],
    PATCH: [
      // update one row
      {
        path: '/',
        query: {},
        body: {
          records: [
            {
              id: 1,
              fields: {
                name: 'Jack 1 updated',
                // all other fields should remain intact
              },
            },
          ],
        },
      },
      // update multiple rows
      {
        path: '/',
        query: {},
        body: {
          records: [
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
    ],
    PUT: [
      // replace one row
      {
        path: '/',
        query: {},
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
          ],
        },
      },
      // replace multiple rows
      {
        path: '/',
        query: {},
        body: {
          records: [
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
    ],
    DELETE: [
      // delete 1 row
      {
        path: '/1',
        query: {},
      },
      // delete multiple rows; NOTE: row numbers are dynamic and mutate
      // NOTE:
      // unlike Airtable or traditional database, row numbers in gsheets
      // are ephemeral and not unique!!!
      {
        path: '/',
        // previous row 2 is now 1
        query: { records: [1, 2, 4, 5, 6] },
      },
    ],
  };

  async function smokeMapRequestTest(method, meta) {
    for (const input of inbound[method]) {
      const output = await mapRequest(method, meta, input);
      console.log(
        `mapped request for ${method}`,
        inspect(output, { depth: 6 })
      );
    }
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
          await run.smokeMapRequestTest(args[2], meta);
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
