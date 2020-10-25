// prettier-ignore
const {
  expect, gatewayServer,
  passConduit
} = require('./context');

context('basic sanity checks...', function () {
  it('should reject requests to inactive conduits', async function () {
    let res = await gatewayServer().get('/').set('Host', 'I do not exist');
    expect(res.status).to.equal(404);

    res = await gatewayServer().get('/');
    expect(res.status).to.equal(404);

    // TODO: add a test with a proper host set but the conduit is marked
    //       as inactive
  });

  const requests = [
    { type: 'PUT', request: gatewayServer().put },
    { type: 'PATCH', request: gatewayServer().patch },
    { type: 'POST', request: gatewayServer().post },
  ];

  requests.forEach((r) => {
    it(`should reject ${r.type} without a body`, async function () {
      const res = await r.request('/').set('Host', passConduit.host);
      expect(res.status).to.equal(422);
    });
  });
});
