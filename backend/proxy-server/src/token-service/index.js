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
// The 'user' object at a minimum *must* contain the following fields.
//
// user: {
//   [email: 'proxy@example.com'], // <- optional
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

// TokenService is a 'singleton'; if you want to change it's behaviour
// you can do so by setting appropriate properties here...
const defaultOptions = { debug: false, vault: '.secrets' };

function TokenService(options) {
  const accessTokenProviders = {
    conduits: ConduitsAccessToken(options),
    airtable: AirtableAccessToken(options),
    googleSheets: GoogleAccessToken(options),
    // email: EmailAccessToken({ debug }),
  };
  const cache = new Map();

  function makeKey(serviceType, credentials) {
    return serviceType + JSON.stringify(credentials);
  }

  // returns true if token is undefined or will expire in next 15 seconds
  function expired(token) {
    if (options.debug) {
      console.log(
        'token expiresAt: ',
        token?.user?.expiresAt,
        ' cached: ',
        token?.cached
      );
    }
    const now = Math.floor(new Date().getTime() / 1000);
    if (token?.user?.expiresAt) {
      return now >= token.user.expiresAt - 15;
    } else {
      return true;
    }
  }

  async function getAccessToken(serviceType, credentials) {
    const key = makeKey(serviceType, credentials);
    let token = cache.get(key);

    if (!expired(token)) {
      // make it easy on ourselves to be able to write unit tests
      token.cached = true;
      return token;
    }

    const atp = accessTokenProviders[serviceType];
    if (!atp) {
      throw new RestApiError(500, {
        serviceType: `unknown ${serviceType}`,
      });
    }

    try {
      token = await atp.requestAccessToken(credentials);
      cache.set(key, token);
    } catch (e) {
      // FIXME! rethrow ?
      console.log(e);
    }

    return token;
  }

  return { getAccessToken };
}

module.exports = TokenService(defaultOptions);
