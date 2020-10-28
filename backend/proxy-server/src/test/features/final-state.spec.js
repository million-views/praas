// prettier-ignore
const {
  // expect,
  recordStore,
} = require('../context');

// NOTE:
// the gateway tests are "hand-crafted"... the sequence of operations is
// is managed such that subsequent stages of each test suite depend on
// the conditions established by a previously run test suite.
//
// In the case of read spec, we expect that prior tests have already
// inserted 10 records and that these records are unsorted. The inserted
// record ids are stored in `ridBase`
//
// If you are assigned to make changes to the gateway tests, then you should
// know that dependencies exist in how the test suites get run.
//
// TODO:
// - add search spec suite
// - add pagination spec suite
// - add sort spec suite
// - add field projection spec suite (i.e only return requested fields)
//
// question: should the above go into their own spec files? yes?

// context('final state checks...', function () {
// do some checks in the end
const writes = recordStore('writes');
const updates = recordStore('updates');
const replacements = recordStore('replacements');
const deletes = recordStore('deletes');
console.log('~~~~ writes: ', writes);
console.log('~~~~ updates: ', updates);
console.log('~~~~ replacements: ', replacements);
console.log('~~~~ deletes: ', deletes);

// expect(writes.length).to.gt(0);
// expect(updates.length).to.be.gt(0);
// expect(replacements.length).to.gt(0);
// expect(deletes.length).to.gt(0);
// });
