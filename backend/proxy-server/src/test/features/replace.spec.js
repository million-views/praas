// prettier-ignore
const {
  expect, gatewayServer,
  passConduit,
  pickRandomlyFrom,
  checkSuccessResponse, recordStore, createRecord
} = require('../context');

context('use PUT to replace one or more records', function () {
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
      template: { hs: '-replaced' },
    });
    record = {
      fields: { ...previous.fields, ...record.fields },
    };

    it(`can PUT a single record with ID: ${previous.id}`, async function () {
      const res = await gatewayServer()
        .put('/' + previous.id)
        .set('Host', passConduit.host)
        .send(record);

      // add id to record to match the expected response
      record.id = previous.id;

      checkSuccessResponse(res, {
        multi: false,
        storein: 'replacements',
        ref: { key: 'id', ...record },
      });
    });
  });

  it('can PUT multiple records', async function () {
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
        template: { es: 'replaced.com' },
      });
      record = {
        id: previous.id,
        fields: { ...previous.fields, ...record.fields },
      };
      records.push(record);
    });

    const res = await gatewayServer()
      .put('/')
      .set('Host', passConduit.host)
      .send({ records });

    checkSuccessResponse(res, {
      logit: false,
      storein: 'replacements',
      ref: { key: 'id', records },
    });
  });
});
