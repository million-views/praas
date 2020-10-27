// prettier-ignore
const {
  expect, gatewayServer,
  passConduit,
  checkSuccessResponse, recordStore,
  pickRandomlyFrom
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

context('use GET to fetch records...', function () {
  const written = recordStore('writes');

  it(`has 10 rows in local record store to work with`, function () {
    expect(written.length).to.eq(10);
  });

  const requests = [
    pickRandomlyFrom(written),
    pickRandomlyFrom(written),
    pickRandomlyFrom(written),
  ];

  requests.forEach((record) => {
    // const match = { id: rid, fields: ridBase[rid] };
    // console.log('id: ', id, 'match: ', match);
    it(`can GET record with ID: ${record.id}`, async function () {
      const res = await gatewayServer()
        .get('/' + record.id)
        .set('Host', passConduit.host);

      checkSuccessResponse(res, {
        multi: false,
        ref: { key: 'id', ...record },
      });
    });
  });

  it('can GET all entries', async function () {
    const res = await gatewayServer().get('/').set('Host', passConduit.host);

    checkSuccessResponse(res, {
      logit: false,
      ref: { key: 'id', records: written },
    });
  });
});
