// prettier-ignore
const {
  expect, gatewayServer,
  dropConduit, passConduit, 
} = require('../context');

context('access control and basic API compliance...', function () {
  it('should reject requests to inactive conduits', async function () {
    let res = await gatewayServer().get('/').set('Host', 'I do not exist');
    expect(res.status).to.equal(404);

    res = await gatewayServer().get('/');
    expect(res.status).to.equal(404);

    // TODO:
    // - test with proper host set for a conduit marked as inactive and check
    //   for expected 404
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

  it('should reject DELETE without a record id', async function () {
    const res = await gatewayServer()
      .delete('/')
      .set('Host', passConduit.host);

    expect(res.status).to.equal(400);

    // TODO:
    // - test with empty `records` query parameter
  });

  it('should reject method not present in RACM list', async function () {
    const res = await gatewayServer().get('/').set('Host', dropConduit.host);
    expect(res.status).to.equal(405);
  });

  it('should allow method present in RACM list', async function () {
    const res = await gatewayServer().get('/').set('Host', passConduit.host);
    expect(res.status).to.equal(200);
  });
});
