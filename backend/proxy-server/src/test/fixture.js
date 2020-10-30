// prettier-ignore
const {
  gatewayServer,
  passConduit,
  checkSuccessResponse, checkErrorResponse,
  createRecord,
} = require('./context');

// const util = require('util');

function new_record_from(previous, options) {
  const { skipFields, template, includeId, method } = options;
  const [lid] = previous.fields.name.match(/\d+/g);
  let record = createRecord(lid, { multi: false, skipFields, template });

  if (method === 'PATCH') {
    record = {
      fields: { ...previous.fields, ...record.fields },
    };
  }

  // set IncludeId to true to induce errors
  if (includeId) {
    record.id = previous.id;
  }

  return record;
}

function prepare_single_rows(data, options) {
  const { method } = options;

  // DELETE test data is already in a compliant format
  if (method === 'DELETE') {
    return data;
  }

  const requests = [];

  for (let i = 0, imax = data.length; i < imax; i++) {
    const previous = data[i];
    const record = new_record_from(previous, options);
    // include id outside of the record as well for test annotation
    requests.push({ id: previous.id, record });
  }

  return requests;
}

function prepare_multi_row(data, options) {
  const { method } = options;

  // DELETE test data is already in a compliant format
  if (method === 'DELETE') {
    // wrap the array to normalize with rest of the code
    return { records: data };
  }

  const records = [];
  for (let i = 0, imax = data.length; i < imax; i++) {
    const previous = data[i];
    const record = new_record_from(previous, options);
    records.push(record);
  }

  return { records };
}

const Api = {
  POST: gatewayServer().post,
  GET: gatewayServer().get,
  PATCH: gatewayServer().patch,
  PUT: gatewayServer().put,
  DELETE: gatewayServer().delete,
};

const shelfFor = {
  POST: 'writes',
  GET: undefined,
  PATCH: 'updates',
  PUT: 'replacements',
  DELETE: 'deletes',
};

async function submit_single_row_request(method, req, expectedStatus) {
  let res;

  if (method === 'DELETE') {
    res = await Api[method]('/' + req.id).set('Host', passConduit.host);
    if (expectedStatus === 200) {
      checkSuccessResponse(res, {
        multi: false,
        logit: false,
        storein: shelfFor[method],
        ref: { key: 'id', ...req },
      });
    } else {
      checkErrorResponse(res, {
        expectedStatus,
        logit: false,
        ref: req,
      });
    }
  } else {
    if (expectedStatus === 200) {
      res = await Api[method]('/' + req.id)
        .set('Host', passConduit.host)
        .send(req.record);

      // add id to record to match the expected response
      req.record.id = req.id;

      checkSuccessResponse(res, {
        multi: false,
        logit: false,
        storein: shelfFor[method],
        ref: { key: 'id', ...req.record },
      });
    } else {
      // induce error
      res = await Api[method]('/')
        .set('Host', passConduit.host)
        .send(req.record);

      checkErrorResponse(res, {
        expectedStatus,
        logit: false,
        ref: req.record,
      });
    }
  }
}

async function submit_multi_row_request(method, req, expectedStatus) {
  let res;

  if (method !== 'DELETE') {
    res = await Api[method]('/').set('Host', passConduit.host).send(req);
  } else {
    const ids = req.records.map((r) => r.id);

    if (ids.length <= 1) {
      // see https://github.com/visionmedia/superagent/issues/1224
      //
      // TODO:
      // - should we fix API doc and state that a single *MUST*
      //   be sent using `id` in the path instead of a query param?
      // - this seems to be a limitation of SuperAgent and fixing it
      //   in the server violates principle of least surprise since
      //   the developer may be constructing the list of records to
      //   delete using some logic that may result in an array with
      //   a single item; placing the restriction would involve
      //   additional logic for the exception
      // - so the answer is a NO?
      res = await Api[method]('/')
        .set('Host', passConduit.host)
        .query({ 'records[]': ids });
    } else {
      res = await Api[method]('/')
        .set('Host', passConduit.host)
        .query({ records: ids });
    }
  }

  if (expectedStatus === 200) {
    checkSuccessResponse(res, {
      logit: false,
      storein: shelfFor[method],
      ref: { key: 'id', ...req },
    });
  } else {
    checkErrorResponse(res, {
      expectedStatus,
      logit: false,
      ref: req,
    });
  }
}

function run_test_plan(method, plan) {
  plan.forEach(async (item) => {
    const { tests, multi, data, expectedStatus, ...options } = item;
    options.method = method;

    if (multi) {
      const req = prepare_multi_row(data, options);
      it(tests, async function () {
        await submit_multi_row_request(method, req, expectedStatus);
      });
    } else {
      const reqs = prepare_single_rows(data, options);
      reqs.forEach((req) => {
        it(`${tests} (id ${req.id})`, async function () {
          await submit_single_row_request(method, req, expectedStatus);
        });
      });
    }
  });
}

module.exports = { run_test_plan };
