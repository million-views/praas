// NOTE:
// - do not add test cases directly in this file
// - instead create your test-suite in a separate file and `require` it here
// - you should know that mocha makes it super hard to share context, so
//   we employ some tricks to force sequentiality where required by splitting
//   test suites across logical functional boundaries, and use the `after`
//   hook.
describe('Testing Gateway Server...', function () {
  describe('Operational features', function () {
    require('./test/features/racm.spec');
    require('./test/features/allowlist.spec');
  });

  describe('API features', function () {
    require('./test/features/write.spec');
    require('./test/features/hidden-form-fields.spec');

    after(function () {
      // verify writes so far
      require('./test/features/read.spec');

      // do replacements (destructive updates)...
      require('./test/features/replace.spec');

      // do updates ... (non-destructive updates)
      require('./test/features/update.spec');

      // do deletes...
      require('./test/features/delete.spec');

      // check final state to be as expected...
      // require('./tests/features/final-state.spec');
    });
  });
});
