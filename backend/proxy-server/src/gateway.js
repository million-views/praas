const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');

const { RestApiError } = require('../../lib/error');
const tokenService = require('./token-service');
const { Airtable } = require('./integrations/airtable');
const { GSheets } = require('./integrations/gsheets');
const inspect = require('util').inspect;

// declare these once
const opsNeedingBody = ['PUT', 'POST', 'PATCH']; // have records in body ?
const opsNeedingId = ['PUT', 'PATCH']; // have id field in body ?

// array of middleware that go in the front of stack
// NOTE:
// - order matters but not verified to be correct
// - e.g. should cors go first?
function head(options = {}) {
  const frontOptions = {
    urlencoded: options.urlencoded ?? { extended: true },
  };

  const upload = multer();
  return [
    cors(),
    bodyParser.json(),
    bodyParser.urlencoded(frontOptions.urlencoded),
    upload.none(),
  ];
}

// array of middleware organized by feature and order of precedence
// if any of these get big and complex they can be moved out.
function middle({ cmap = [], debug = false }) {
  if (debug) {
    console.log(`baking gateway middleware for ${cmap.length} conduits`);
  }

  function preflightCheck(req, res, next) {
    if (debug) {
      console.log(`preflight-check: ${req.hostname}`);
    }
    // console.log('req from: ', req.hostname);
    const conduit = cmap.get(req.hostname);
    if (conduit) {
      // cache it for the next handler, we do it here in case the cache
      // expires before getting into the next middleware.
      res.locals.conduit = conduit;
      next(); // all good, proceed to next in chain!
    } else {
      // If conduit not found in Cache, send 404
      // FIXME: per MDN, the statusCode should be 400
      return next(
        new RestApiError(404, {
          conduit: `${req.hostname} not found`,
        })
      );
    }
  }

  function allowlistCheck(req, res, next) {
    // Top of the stack check is ip allow-list check
    // - Only IPv4 is handled in v1
    // - We implicitly allow loopback address (127.0.0.1)
    // - empty allowlist implies all origins allowed
    // - the code that follows may not be optimal.
    const clientIp = req.connection.remoteAddress;
    const conduit = res.locals.conduit;
    const allowlist = conduit.allowlist;
    if (debug) {
      console.log(
        `allowlist-check: client -> ${clientIp}, allowlist -> ${allowlist}`
      );
    }

    if (allowlist.length > 0 && clientIp !== '127.0.0.1') {
      let allowed = false,
        inactive = 0;
      for (let i = 0, imax = allowlist.length; i < imax; i++) {
        const item = allowlist[i];
        if (item.status === 'active' && item.ip === clientIp) {
          allowed = true;
          break;
        }

        if (item.status === 'inactive') {
          inactive++;
        }
      }

      if (!allowed && inactive !== allowlist.length) {
        // console.log('---->', clientIp, allowlist, inactive);
        return next(
          new RestApiError(403, { client: `${clientIp} restricted` })
        );
      }
    }

    next(); // all good, proceed to next in chain!
  }

  function racmCheck(req, res, next) {
    // check racm for allowed methods
    const racm = res.locals.conduit.racm;
    if (debug) {
      console.log(`racm-check: ${req.method} in ${racm}`);
    }

    if (racm.findIndex((method) => method === req.method) === -1) {
      return next(
        new RestApiError(405, {
          [req.method]: 'not permitted',
        })
      );
    }

    next(); // all good, proceed to next in chain!
  }

  function apiComplianceCheck(req, res, next) {
    const records = req.body.records;
    if (debug) {
      console.log(`api-compliance-check: ${req.method}`, records);
    }

    if (opsNeedingBody.includes(req.method)) {
      if (!records) {
        return next(
          new RestApiError(422, {
            records: 'not present',
          })
        );
      }

      if (records?.[0].fields === undefined) {
        // PUT, POST and PATCH operations need fields data in body
        return next(
          new RestApiError(422, {
            fields: 'not present',
          })
        );
      }
    }

    if (opsNeedingId.includes(req.method) && records?.[0].id === undefined) {
      return next(
        new RestApiError(422, {
          id: 'not provided',
        })
      );
    }

    // GET and DELETE don't need request body
    // FIXME! is this the right place to do this?
    if (!opsNeedingBody.includes(req.method)) {
      delete req.body;
    }

    next(); // all good, proceed to next in chain!
  }

  // perform hidden form field validation...
  // TODO:
  // - is this needed for PUT and PATCH as well?
  //   - answer is no, since hff is meant only for new records
  // - hmm why is this being done only on record[0]?
  //   - this needs to be done for all records
  // - what about bulk updates and batch creation?
  //   - bulk updates: not applicable
  //   - batch creation: loop through and delete records that fail the test

  // Validate row data from request against hff policies
  // - deletes field entry if row is kosher and value should not pass through
  // - return true if the row is kosher, false otherwise
  function hffCheckOne(row, hffMeta, messages) {
    for (let i = 0, imax = hffMeta.length; i < imax; i++) {
      const hff = hffMeta[i];
      const reqHffValue = row.fields[hff.fieldName];

      if (hff.policy === 'drop-if-filled' && reqHffValue) {
        messages.push(
          `drop-if-filled: ...dropping coz ${reqHffValue} != ${hff.value}`
        );
        return false;
      }

      if (hff.policy === 'pass-if-match' && !(reqHffValue === hff.value)) {
        messages.push(
          `pass-if-match: ...dropping coz ${reqHffValue} != ${hff.value}`
        );
        return false;
      }

      if (!hff.include) {
        messages.push(
          `pass-if-match: ...erasing {${hff.fieldName}: ${reqHffValue}} 'include' is false`
        );

        delete row.fields[hff.fieldName];
      }
    }

    return true;
  }

  // This feature is to catch spam bots, so don't send a response indicating
  // failure conditions here.., send 200-OK instead
  function hffCheck(req, res, next) {
    if (debug) {
      console.log(`hff-check: ${req.method}`);
    }

    if (req.method === 'POST') {
      const droppedRecords = [];
      const hffMeta = res.locals.conduit.hiddenFormField;
      const records = req.body.records ?? [req.body];
      const single = !req.body.records;
      const validatedRecords = [];

      if (hffMeta.length) {
        for (let i = 0, imax = records.length; i < imax; i++) {
          const record = records[i];
          if (hffCheckOne(record, hffMeta, droppedRecords)) {
            if (Object.keys(record.fields).length > 0) {
              validatedRecords.push(record);
            }
          }
        }

        if (debug) {
          console.log('hff-check: dropped records...');
          console.table(droppedRecords);
        }

        if (validatedRecords.length <= 0) {
          return res.sendStatus(200);
        }

        if (single) {
          req.body = validatedRecords[0];
        } else {
          req.body.records = validatedRecords;
        }
      }
    }

    next(); // all good, proceed to next in chain!
  }

  // prettier-ignore
  return [
    preflightCheck, allowlistCheck, racmCheck, apiComplianceCheck, hffCheck,
  ];
}

// backend of the gateway is responsible for invoking the correct integration
// TODO:
// - write up the protocol for writing an `integration`
// - at a minimum there are three phases:
//   - imap (input: {airtableish-inbound-data, meta}, output: integration-outbound-data)
//   - transmit(input: integration-outbound-data, output: integration-inbound-data)
//   - omap(input: {integration-inbound-data, meta}, output: airtableish-outbound-data)
function tail({ debug = false }) {
  // cache integrations to non-traditional-storage
  const ntsHandlers = {
    airtable: Airtable({ debug }),
    googleSheets: GSheets({ debug }),
  };

  let act = 0; // asynchronous completion token; debugging aid.

  // need this to obtain a closure over act
  function dispatcher(nts, act) {
    return async function (inbound, res, next) {
      if (debug) {
        console.log(`${act} ~~~>`, inspect(inbound, { depth: 4 }));
      }

      try {
        const mappedRequest = await nts.imap(inbound);
        if (debug) {
          const { method, url, parameters, headers, body } = mappedRequest;
          console.log(
            `${act} ~~~X`,
            inspect({ method, url, parameters, headers, body }, { depth: 4 })
          );
        }

        const response = await nts.transmit(mappedRequest);
        const { status, data } = await nts.omap(response);

        if (debug) {
          console.log(`${act} <~~~`, status, inspect(data, { depth: 4 }));
        }

        return res.status(status).send(data);
      } catch (e) {
        if (debug) {
          console.log(`${act} !~~~!`, inspect(e, { depth: 4 }));
        }
        next(e);
      }
    };
  }

  return async function proxy(req, res, next) {
    const conduit = res.locals.conduit;
    const nts = ntsHandlers[conduit.suriType];
    const token = await tokenService.getAccessToken(
      conduit.suriType,
      conduit.suriApiKey
    );

    // scoped container...
    const inbound = {
      container: conduit.suriObjectKey, // sheet, table, inbox, bucket, folder, ...
      token: token.user.token, // to access remote service endpoint
      method: req.method, // inbound request method
      path: req.path, // inbound request path
      query: req.query, // inbound request query parameters
      body: req.body, // inbound request body
    };

    act += 1;

    if (!nts) {
      next(
        new RestApiError(500, {
          suriType: `${conduit.suriType} not supported`,
        })
      );
    } else {
      await dispatcher(nts, act)(inbound, res, next);
    }
  };
}

module.exports = {
  head,
  middle,
  tail,
};
