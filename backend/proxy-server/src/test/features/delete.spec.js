const { expect, recordStore } = require('../context');
const { run_test_plan } = require('../fixture');
/*
NOTE:

Proper management of deletion is the single biggest feature of
the gateway. This test suite should be handled with care; it is
designed to catch errors in the gateway's implementation of the
logic to support a database centric view of a spreadsheet.

In particula ensure the following tests are covered either in
combination or i
┌─────────┬──────────────┬──────────────┬──────────────┬──────────┐
│ (index) │      0       │      1       │      2       │    3     │
├─────────┼──────────────┼──────────────┼──────────────┼──────────┤
│    0    │  'deleted'   │              │              │          │
│    1    │ 'undeleted'  │              │              │          │
│    2    │  'deleted'   │ 'undeleted'  │              │          │
│    3    │ 'duplicates' │              │              │          │
│    4    │  'deleted'   │ 'duplicates' │              │          │
│    5    │ 'undeleted'  │ 'duplicates' │              │          │
│    6    │  'deleted'   │ 'undeleted'  │ 'duplicates' │          │
│    7    │   'unique'   │              │              │          │
│    8    │  'deleted'   │   'unique'   │              │          │
│    9    │ 'undeleted'  │   'unique'   │              │          │
│   10    │  'deleted'   │ 'undeleted'  │   'unique'   │          │
│   11    │ 'duplicates' │   'unique'   │              │          │
│   12    │  'deleted'   │ 'duplicates' │   'unique'   │          │
│   13    │ 'undeleted'  │ 'duplicates' │   'unique'   │          │
│   14    │  'deleted'   │ 'undeleted'  │ 'duplicates' │ 'unique' │
└─────────┴──────────────┴──────────────┴──────────────┴──────────┘
*/
context('delete (DELETE) one or more records...', function () {
  const written = recordStore('writes');
  // create a statement of record for delete tests
  const deletes = [0, 1, 2, 3, 4, 5].map((v) => ({
    deleted: true,
    id: written[v].id,
  }));

  [6, 7, 8, 9].forEach((v) => {
    deletes.push({ deleted: false, id: written[v].id });
  });

  // test plan validates `delete` functionality using previously written
  // row data as the basis. The following tests are included in the plan:
  //
  // - ordinal 0 through 1 individually                     | expect 200
  // - ordinal 2 using query param                          | expect 200
  // - ordinal 3 through 5 using query param                | expect 200
  // - ordinal 6 without id in path for single              | expect 422
  // - ordinal 7 without id in query param for multi        | expect 422
  // - ordinal 8 and 8  (duplicates) in query param         | expect 422
  // - ordinal 8, 8, 9 (mix of duplicates) in query param   | expect 422
  // - ordinal 0 through 1 double delete with id path       | expect 404
  // - ordinal 2  double delete using query param           | expect 404
  // - ordinal 3 through 5 double delete using query param  | expect 404
  // - ordinal (0, 1, 2) double delete + (6, 7) undeleted   | expect 404
  // - ordinal (3, 4, 5) double delete + (8, 8) duplicates  | expect 404
  // - ordinal (6, 7) undeleted + (0, 1, 2) double delete   | expect 404
  // - ordinal (8, 8) duplicates + (3, 4, 5) double delete  | expect 422
  // - ordinal (4, 5, 5, 6) deleted, duplicates, undeleted  | expect 404

  //
  // final state: records at ordinal (6, 7, 8, 9) should remain
  //
  // NOTE: the ordinal numbers are the indices in `writes` local store

  // Test plan data for DELETE is a bit different from the POST/PUT/PATCH:
  // - skipFields, template fields are not required; in fact they
  //   should not be set since the `fixture` determines the data needs to be
  //   formated for a delete request based on their presence or absence.
  // - the shape of the test data is {id: <id>, deleted: <true|false}
  // - test plan runner extracts the id and sets it either in the path
  //   or in {records: <>} query parameter, not in the body depending
  //   the value of `multi` in the test plan data.
  //
  // NOTE: more refactoring is needed to handle exceptional test cases.
  // currently, we are massaging the test data knowing how the test plan
  // runner works internally.

  // single row API operations (multi: false | type: 'single-row')
  const plan1 = [
    {
      tests: 'allow single record delete using id in path',
      data: [deletes[0], deletes[1]],
      expectedStatus: 200,
    },
    {
      tests: 'reject single record delete (id missing in path)',
      // data: [written[6]],
      data: [{ deleted: true, id: '' }],
      expectedStatus: 400,
    },
    {
      tests: 'reject single double delete using id in path',
      data: [deletes[0], deletes[1]],
      expectedStatus: 404,
    },
  ];

  // multi row API operations (multi: true | type: 'multi-row')
  const plan2 = [
    {
      tests: 'allow single record delete using query param',
      data: [deletes[2]],
      expectedStatus: 200,
    },
    {
      tests: 'allow multi record delete using query param',
      data: [deletes[3], deletes[4], deletes[5]],
      expectedStatus: 200,
    },
    {
      tests: 'reject multi record delete (id missing in param)',
      // data: [written[7]],
      data: [],
      expectedStatus: 400,
    },
    {
      tests: 'reject multi record delete with duplicates',
      data: [written[8], written[8]],
      expectedStatus: 422,
    },
    {
      tests: 'reject multi record delete with duplicates and unique ids',
      data: [written[8], written[8], written[9]],
      expectedStatus: 422,
    },
    {
      tests: 'reject single double delete using id in query param',
      data: [deletes[2]],
      expectedStatus: 404,
    },
    {
      tests: 'reject multi double delete using id in query param',
      data: [deletes[3], deletes[4], deletes[5]],
      expectedStatus: 404,
    },
    {
      tests: 'reject deletion of deleted mixed with undeleted ids',
      data: [deletes[0], deletes[1], deletes[2], deletes[6], deletes[7]],
      expectedStatus: 404,
    },
    {
      tests: 'reject deletion of deleted mixed with duplicate ids',
      data: [deletes[3], deletes[4], deletes[5], deletes[8], deletes[8]],
      expectedStatus: 404,
    },
    {
      tests: 'reject deletion of undeleted mixed with deleted ids',
      data: [deletes[6], deletes[7], deletes[0], deletes[1], deletes[2]],
      expectedStatus: 404,
    },
    {
      tests: 'reject deletion of deleted, duplicates, undeleted all mixed up',
      data: [deletes[4], deletes[5], deletes[5], deletes[6]],
      expectedStatus: 404,
    },
  ];

  it('has 10 rows in local record store to work with', function () {
    expect(written.length).to.eq(10);
  });

  run_test_plan('DELETE', plan1, 'single-row');
  run_test_plan('DELETE', plan2, 'multi-row');

  it('verify final state', function () {
    const deleted = recordStore('deletes');
    expect(deleted.length).to.eq(6);
  });
});
