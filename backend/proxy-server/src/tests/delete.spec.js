// prettier-ignore
const {
  expect, gatewayServer,
  passConduit,
  pickRandomlyFrom,
  recordStore
} = require('./context');

// TODO:
// - write test cases to verify double deletes are being handled correctly

// NOTE: proper management of deletion is the single biggest feature of
// the gateway. So this test suite will expand as we make progress.
context('use DELETE to remove one or more records', function () {
  const writes = recordStore('writes');
  const deletes = recordStore('deletes');

  // create a statement of record for delete tests
  writes.forEach((w) => deletes.push({ deleted: false, id: w.id }));

  console.log('~~~~~~~~~ deletes:', deletes);
  const requests = [
    pickRandomlyFrom(deletes),
    pickRandomlyFrom(deletes),
    pickRandomlyFrom(deletes),
  ];

  it(`has 10 rows in local record store to work with`, function () {
    expect(writes.length).to.eq(10);
  });

  requests.forEach((row) => {
    it(`can DELETE a single record with ID: ${row.id}`, async function () {
      const res = await gatewayServer()
        .delete('/' + row.id)
        .set('Host', passConduit.host);

      expect(row.deleted).to.equal(false);
      expect(res.status).to.equal(200);
      expect(res.body.deleted).to.equal(true);
      expect(res.body.id).to.equal(row.id);

      // mark the row as deleted in our local cache
      row.deleted = true;
    });
  });

  xit('can DELETE multiple records', async function () {
    const undeleted = deletes.filter((row) => row.deleted === false);
    console.log('~~~~~~~undeleted: ', undeleted);
    const requests = [
      pickRandomlyFrom(undeleted),
      pickRandomlyFrom(undeleted),
      pickRandomlyFrom(undeleted),
      pickRandomlyFrom(undeleted),
    ].sort((a, b) => a.id - b.id);

    // prettier-ignore
    const ids = [], refs = [];
    requests.forEach((row) => {
      ids.push(row.id);
      refs.push(row); // to mark as deleted on success
    });

    const res = await gatewayServer()
      .delete('/')
      .set('Host', passConduit.host)
      .query({ records: ids });

    expect(res.status).to.equal(200);
    expect(res.body).to.haveOwnProperty('records');
    const records = res.body.records.sort((a, b) => a.id - b.id);
    console.log('~~~~~~X', res.status, ids, refs, records);

    expect(records.length).to.equal(ids.length);
    for (let i = 0, imax = records.length; i < imax; i++) {
      expect(records[i].deleted).to.equal(true);
      expect(records[i].id).to.equal(ids[i]);
      if (refs[i].deleted) {
        console.warn('double delete error condition detected', refs[i]);
      }
      refs[i].deleted = true;
    }
  });
});
