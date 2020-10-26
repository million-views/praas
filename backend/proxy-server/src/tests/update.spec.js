// prettier-ignore
const {
  expect, gatewayServer,
  passConduit,
  pickRandomlyFrom,
  checkSuccessResponse, recordStore, createRecord
} = require('./context');

context('use PATCH to update one or more records', function () {
  const writes = recordStore('writes');

  it(`has 10 rows in local record store to work with`, function () {
    expect(writes.length).to.eq(10);
  });

  const requests = [
    pickRandomlyFrom(writes),
    pickRandomlyFrom(writes),
    pickRandomlyFrom(writes),
  ];

  requests.forEach((previous) => {
    // hack to get old `test data id`
    const [lid] = previous.fields.name.match(/\d+/g);
    let record = createRecord(lid, {
      multi: false,
      skipFields: ['name', 'email'],
      template: { hs: '-patched' },
    });
    record = {
      fields: { ...previous.fields, ...record.fields },
    };

    it(`can PATCH a single record with ID: ${previous.id}`, async function () {
      const res = await gatewayServer()
        .patch('/' + previous.id)
        .set('Host', passConduit.host)
        .send(record);

      // add id to record to match the expected response
      record.id = previous.id;
      checkSuccessResponse(res, {
        multi: false,
        storein: 'updates',
        ref: { key: 'id', ...record },
      });
    });
  });

  it('can PATCH multiple records', async function () {
    const requests = [
      pickRandomlyFrom(writes),
      pickRandomlyFrom(writes),
      pickRandomlyFrom(writes),
      pickRandomlyFrom(writes),
    ];
    const records = [];
    requests.forEach((previous) => {
      // hack to get old `test data id`
      const [lid] = previous.fields.name.match(/\d+/g);
      let record = createRecord(lid, {
        multi: false,
        skipFields: ['name', 'hiddenFormField'],
        template: { es: 'patched.com' },
      });
      record = {
        id: previous.id,
        fields: { ...previous.fields, ...record.fields },
      };
      records.push(record);
    });

    const res = await gatewayServer()
      .patch('/')
      .set('Host', passConduit.host)
      .send({ records });

    checkSuccessResponse(res, {
      storein: 'updates',
      ref: { key: 'id', records },
    });
  });
});
