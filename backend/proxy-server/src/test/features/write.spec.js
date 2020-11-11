// prettier-ignore
const {
  gatewayServer,
  dropConduit: dropIfFilledConduit, passConduit: passOnMatchConduit,
  createRecord, checkSuccessResponse
} = require('../context');

context('use POST to add records...', function () {
  const skipFields = ['hiddenFormField'];

  it('can insert a single record', async function () {
    const record = createRecord(5, { multi: false, skipFields });
    const res = await gatewayServer()
      .post('/')
      .set('Host', dropIfFilledConduit.host)
      .send(record);

    checkSuccessResponse(res, {
      multi: false,
      storein: 'writes',
      ref: { key: 'name', ...record },
    });
  });

  it('can insert a single record in an array', async function () {
    // skip fields so that get through the gateway
    const records = createRecord(7, { skipFields });
    const res = await gatewayServer()
      .post('/')
      .set('Host', dropIfFilledConduit.host)
      .send(records);

    checkSuccessResponse(res, {
      multi: true,
      storein: 'writes',
      ref: { key: 'name', ...records },
    });
  });

  it('can insert multiple records in an array', async function () {
    const multi = false;
    const records = {
      records: [createRecord(9, { multi }), createRecord(10, { multi })],
    };

    const res = await gatewayServer()
      .post('/')
      .set('Host', passOnMatchConduit.host)
      .send(records);

    const match = {
      records: [
        createRecord(9, { multi }),
        createRecord(10, { multi, skipFields }),
      ],
    };

    checkSuccessResponse(res, {
      multi: true,
      logit: false,
      storein: 'writes',
      ref: { key: 'name', ...match },
    });
  });
});
