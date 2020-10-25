// prettier-ignore
const {
  expect, gatewayServer,
  dropConduit, passConduit, 
} = require('./context');

context('resource access control map (racm)...', function () {
  it('should reject method not present in RACM list', async function () {
    const res = await gatewayServer().get('/').set('Host', dropConduit.host);
    expect(res.status).to.equal(405);
  });

  it('should allow method present in RACM list', async function () {
    const res = await gatewayServer().get('/').set('Host', passConduit.host);
    expect(res.status).to.not.equal(405);
  });
});
