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
  let writes = recordStore('writes');
  const deletes = recordStore('deletes');

  it(`has 10 rows in local record store to work with`, function () {
    expect(writes.length).to.eq(10);

    // create a statement of record for delete tests
    writes.forEach((w) => deletes.push({ deleted: false, id: w.id }));
  });

  after(function () {
    const requests = [
      pickRandomlyFrom(deletes),
      pickRandomlyFrom(deletes),
      pickRandomlyFrom(deletes),
    ];

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
        writes = writes.filter(function (item) {
          return item.id !== row.id;
        });
      });
    });
  });

  after(function () {
    it('can DELETE multiple records', async function () {
      const undeleted = deletes.filter((row) => row.deleted === false);
      const requests = [
        pickRandomlyFrom(undeleted),
        pickRandomlyFrom(undeleted),
        pickRandomlyFrom(undeleted),
        pickRandomlyFrom(undeleted),
      ].sort((a, b) => a - b);

      const records = [],
        refs = [];
      requests.forEach((row) => {
        records.push(row.id);
        refs.push(row); // to mark as deleted on success
      });

      const res = await gatewayServer()
        .delete('/')
        .set('Host', passConduit.host)
        .query({ records });

      expect(res.status).to.equal(200);
      console.log('~~~~~~', res.status, res.body, records);
      expect(res.body).to.haveOwnProperty('records');
      expect(res.body.records.length).to.equal(records.length);
      for (let i = 0; i < res.body.records.length; i++) {
        expect(res.body.records[i].deleted).to.equal(true);
        expect(res.body.records[i].id).to.equal(records[i]);
        if (refs[records[i]].deleted) {
          console.warn(
            'double delete error condition detected',
            refs[records[i]]
          );
        }
        refs[records[i]].deleted = true;
      }
    });
  });

  after(function () {
    // do some checks in the end
    const writes = recordStore('writes');
    const updates = recordStore('updates');
    const replacements = recordStore('replacements');
    const deletes = recordStore('deletes');

    expect(writes.length).to.gt(0);
    expect(updates.length).to.be.gt(0);
    expect(replacements.length).to.gt(0);
    expect(deletes.length).to.gt(0);
  });
});
