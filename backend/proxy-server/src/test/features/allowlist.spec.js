// prettier-ignore
const {
  expect, gatewayHost, gatewayPort,
  aorConduit1,  aorConduit2, aorConduit3,
  createRecord, checkSuccessResponse,
  boundHttpRequest, pickRandomlyFrom,
  testAllowedIpList, testDeniedIpList
} = require('../context');

context('allow-list...', function () {
  const optionsBase = {
    hostname: gatewayHost,
    port: gatewayPort,
    path: '/',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  it('should accept requests from * when ip is inactive', async function () {
    const options2 = {
      ...optionsBase,
      localAddress: pickRandomlyFrom(testDeniedIpList),
      headers: { ...optionsBase.headers, Host: aorConduit2.host },
    };
    let success = await boundHttpRequest(options2);
    expect(success.status).to.equal(200);

    options2.localAddress = pickRandomlyFrom(testAllowedIpList);
    success = await boundHttpRequest(options2);
    expect(success.status).to.equal(200);
  });

  it('should reject requests from IPs not in AllowList', async function () {
    const options1 = {
      ...optionsBase,
      localAddress: pickRandomlyFrom(testDeniedIpList),
      headers: { ...optionsBase.headers, Host: aorConduit1.host },
    };
    let success = await boundHttpRequest(options1);
    expect(success.status).to.equal(403);

    const options3 = {
      ...optionsBase,
      method: 'POST',
      localAddress: pickRandomlyFrom(testDeniedIpList),
      headers: { ...optionsBase.headers, Host: aorConduit3.host },
    };

    const record = createRecord(0);
    const postData = JSON.stringify(record);

    success = await boundHttpRequest(options3, postData);
    expect(success.status).to.equal(403);
  });

  it('should allow requests from IPs in AllowList', async function () {
    const options1 = {
      ...optionsBase,
      localAddress: pickRandomlyFrom(aorConduit1.allowlist).ip,
      headers: { ...optionsBase.headers, Host: aorConduit1.host },
    };
    let success = await boundHttpRequest(options1);
    expect(success.status).to.equal(200);

    const options2 = {
      ...optionsBase,
      localAddress: pickRandomlyFrom(aorConduit2.allowlist).ip,
      headers: { ...optionsBase.headers, Host: aorConduit2.host },
    };
    success = await boundHttpRequest(options2);
    expect(success.status).to.equal(200);

    const activeOnly = aorConduit3.allowlist.filter(
      (ip) => ip.status === 'active'
    );
    const options3 = {
      ...optionsBase,
      method: 'POST',
      localAddress: pickRandomlyFrom(activeOnly).ip,
      headers: { ...optionsBase.headers, Host: aorConduit3.host },
    };

    const records = createRecord(1);
    const postData = JSON.stringify(records);

    success = await boundHttpRequest(options3, postData);
    checkSuccessResponse(success, {
      storein: 'writes',
      ref: { key: 'name', ...records },
    });
  });
});
