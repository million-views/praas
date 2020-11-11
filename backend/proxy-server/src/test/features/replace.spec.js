const { expect, recordStore } = require('../context');
const { run_test_plan } = require('../fixture');

context('replace (PUT) one or more records...', function () {
  const written = recordStore('writes');
  // test plan validates `replace` functionality using previously written
  // row data as the basis. The following tests are included in the plan:
  //
  // - ordinal 0 through 1 individually                     | expect 200
  // - ordinal 2 wrapped in an array                        | expect 200
  // - ordinal 3 through 5 wrapped in an array              | expect 200
  // - ordinal 6 without record id in path for single       | expect 422
  // - ordinal 7 without record id in body for multi        | expect 422
  // - ordinal 8 with record id in path and body for single | expect 422
  // - ordinal 9 and 9  (duplicates) wrapped in an array    | expect 422
  // - ordinal 8, 8, 9 (mix of duplicates) in an array      | expect 422
  //
  // final state: records at ordinal (6, 7, 8, 9) should be left untouched
  //
  // NOTE: the ordinal numbers are the indices in `writes` local store

  // single row API operations (multi: false | type: 'single-row')
  const plan1 = [
    {
      tests: 'allow well formed single record individually',
      data: [written[0], written[1]],
      skipFields: ['name', 'email'],
      template: { hs: '-replaced' },
      expectedStatus: 200,
    },
    {
      tests: 'reject malformed single record request (id missing in path)',
      data: [written[6]],
      skipFields: ['name', 'email'],
      template: { hs: ', replace got through? you found a bug!!' },
      expectedStatus: 422,
    },
    {
      tests: 'reject malformed single record request (id in path and body)',
      data: [written[8]],
      skipFields: ['name', 'email'],
      template: { hs: ', replace got through? you found a bug!!' },
      expectedStatus: 422,
    },
  ];

  // multi row API operations (multi: true | type: 'multi-row')
  const plan2 = [
    {
      tests: 'allow well formed single record in an array',
      data: [written[2]],
      skipFields: ['name', 'email'],
      template: { hs: '-replaced-array-of-one' },
      expectedStatus: 200,
    },
    {
      tests: 'allow well formed records in an array',
      data: [written[3], written[4], written[5]],
      skipFields: ['name'],
      template: { es: 'replaced.com', hs: '<- look to the left' },
      expectedStatus: 200,
    },
    {
      tests: 'reject malformed multi record request (id missing in body)',
      data: [written[7]],
      skipFields: ['name', 'email'],
      template: { hs: ', replace got through? you found a bug!!' },
      expectedStatus: 422,
    },
    {
      tests: 'reject malformed request with duplicates',
      data: [written[9], written[9]],
      skipFields: ['name', 'email'],
      template: { hs: ', replace got through? you found a bug!!' },
      expectedStatus: 422,
    },
    {
      tests: 'reject malformed request with duplicates and unique rows',
      data: [written[8], written[8], written[9]],
      skipFields: ['name', 'email'],
      template: { hs: ', replace got through? you found a bug!!' },
      expectedStatus: 422,
    },
  ];

  it('has 10 rows in local record store to work with', function () {
    expect(written.length).to.eq(10);
  });

  run_test_plan('PUT', plan1, 'single-row');
  run_test_plan('PUT', plan2, 'multi-row');

  it('verify final state', function () {
    const replaced = recordStore('replacements');
    expect(replaced.length).to.eq(6);
  });
});
