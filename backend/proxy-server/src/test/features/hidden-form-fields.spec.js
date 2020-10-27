// prettier-ignore
const {
  expect, gatewayServer,
  dropConduit, passConduit,
  createRecord, checkSuccessResponse,
} = require('../context');

context('hidden form fields (hff)...', function () {
  context('when hff.policy is "pass-if-match"', () => {
    it('drops request if hff value is empty', async function () {
      const record = createRecord(1, { skipFields: ['hiddenFormField'] });
      const res = await gatewayServer()
        .post('/')
        .set('Host', passConduit.host)
        .send(record);
      expect(res.status).to.equal(200);
    });

    it('drops request if hff value does not match', async function () {
      // NOTE: assumes conduit is setup to match:
      // {hff-1, hff2, hff-3, hff-4}
      // So create a record with id 100 so hff will not match and thus
      // no record should have been inserted.
      const record = createRecord(100);
      const res = await gatewayServer()
        .post('/')
        .set('Host', passConduit.host)
        .send(record);
      expect(res.status).to.equal(200);
    });

    it('accepts request and excludes hff value when "include" is false', async function () {
      const record = createRecord(2);
      const res = await gatewayServer()
        .post('/')
        .set('Host', passConduit.host)
        .send(record);

      const match = createRecord(2, { skipFields: ['hiddenFormField'] });

      checkSuccessResponse(res, {
        storein: 'writes',
        ref: { key: 'name', ...match },
      });
    });

    it('accepts request and includes hff value when "include" is true', async function () {
      const records = createRecord(3);
      const res = await gatewayServer()
        .post('/')
        .set('Host', passConduit.host)
        .send(records);

      checkSuccessResponse(res, {
        storein: 'writes',
        ref: { key: 'name', ...records },
      });
    });
  });

  // NOTE:
  // - the `drop-if-filled` policy needs revisiting...
  // - both "include" and "value" are do not care
  context('when hff.policy is drop-if-filled', () => {
    it('drops request if hff value is non-empty', async function () {
      const record = createRecord(1);
      const res = await gatewayServer()
        .post('/')
        .set('Host', dropConduit.host)
        .send(record);

      expect(res.status).to.equal(200);
    });

    it('accepts request if hff value is empty', async function () {
      const records = createRecord(4, { skipFields: ['hiddenFormField'] });
      const res = await gatewayServer()
        .post('/')
        .set('Host', dropConduit.host)
        .send(records);

      checkSuccessResponse(res, {
        storein: 'writes',
        ref: { key: 'name', ...records },
      });
    });

    it('passthru only those records with non-empty hff value', async function () {
      const skipFields = ['hiddenFormField'],
        multi = false;
      const r1 = createRecord(5, { multi });
      const r2 = createRecord(6, { multi, skipFields });
      const r3 = createRecord(7, { multi });
      const r4 = createRecord(8, { multi, skipFields });
      const records = { records: [r1, r2, r3, r4] };

      const res = await gatewayServer()
        .post('/')
        .set('Host', dropConduit.host)
        .send(records);
      expect(res.status).to.equal(200);

      const match = { records: [r2, r4] };
      checkSuccessResponse(res, {
        storein: 'writes',
        ref: { key: 'name', ...match },
      });
    });
  });
});
