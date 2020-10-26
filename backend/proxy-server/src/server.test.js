// NOTE:
// - do not add test cases directly in this file
// - instead create your test-suite in a separate file and `require` it here
// - you should know that mocha makes it super hard to share context, so
//   we employ some tricks to force sequentiality where required by splitting
//   test suites across logical functional boundaries, and use the `after`
//   hook.
describe('Testing Gateway Server...', function () {
  describe('Operational features', function () {
    require('./tests/racm.spec');
    require('./tests/allowlist.spec');
  });

  describe('API features', function () {
    require('./tests/write.spec');
    require('./tests/hidden-form-fields.spec');

    after(function () {
      // verify writes so far
      require('./tests/read.spec');

      // do updates ...
      // require('./tests/update.spec');

      // do replacements ...
      // require('./tests/replace.spec');

      // do deletes...
      require('./tests/delete.spec');

      // check final state to be as expected...
      // require('./tests/final-state.spec');
    });
  });
});
