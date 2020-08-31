/***

Access tokens for various service endpoints 

This module is very specific to the project and by design
doesn't attempt at over generalization.

At a minimum three things are required to be able to use this
API. 
- service endpoint type
  - conduits
  - airtable
  - googleSheets
  - email
- credentials
  - {email, passkey}
  - "apiKey"
  - "jsonSecretFileName"

A successful invocation results in obtaining a bearer access token. The 
mechanics of how one goes about obtaining such a token varies for each 
service endpoint. The objective of this module then is to abstract these
differences for the endpoints the gateway deals with.
*/
const { RestApiError } = require('../../../lib/error');

// NOTE:
// All access token providers *must* wrap the token data in a 'user' object.
// The 'user' object at a minimum *must* contain the following fields
//
// user: {
//   email: 'proxy@example.com',
//   token: 'eyJh...Qt0aiKTMnzs',
//   type: 'Bearer',
//   expiresAt: 1598895386
// }
//
// The 'expiresAt' field contains the relative time in *seconds*
//
const { ConduitsAccessToken } = require('./conduits');
const { GoogleAccessToken } = require('./google');
const { AirtableAccessToken } = require('./airtable');
// const { EmailAccessToken } = require('./email');

function makeKey(serviceType, credentials) {
  return serviceType + JSON.stringify(credentials);
}

// returns true if token is undefined or will expire in next 15 seconds
function expired(token) {
  const now = Math.floor(new Date().getTime() / 1000);
  if (token?.expiresAt) {
    return now >= token.expiresAt - 15;
  } else {
    return true;
  }
}

const debug = false;
const accessTokenProviders = {
  conduits: ConduitsAccessToken({ debug }),
  airtable: AirtableAccessToken({ debug }),
  googleSheets: GoogleAccessToken({ debug }),
  // email: EmailAccessToken({ debug }),
};
const cache = new Map();

async function getToken(serviceType, credentials) {
  const key = makeKey(serviceType, credentials);
  let token = cache.get(key);

  if (!expired(token)) {
    return token;
  }

  const atp = accessTokenProviders[serviceType];
  if (!atp) {
    throw new RestApiError(500, {
      serviceType: `unknown ${serviceType}`,
    });
  }

  token = await atp.requestAccessToken(credentials);

  cache.set(key, token);

  return token;
}

module.exports = { getToken };
