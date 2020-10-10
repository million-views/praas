const fs = require('fs');
const path = require('path');
const jws = require('jws');

const afetch = require('../../../lib/afetch');
const { RestApiError } = require('../../../lib/error');

const GTOKEN_HOST = 'https://www.googleapis.com';
const GTOKEN_PATH = '/oauth2/v4/token';

// NOTES:
// - `suriApiKey` points to a file name in a known .secrets folder for now
// - TODO: modify UI and backend to store keyFile contents as a json blob?
// - only .json key file type is supported
// - currently the scope is hard coded to access gsheets only!
// - by design this is a stripped down version focussed only on obtaining an
//   *access token* for Google Sheets API.
// - it should be possible to extend this module to obtain *id token* for
//   IAP use cases by passing in:
//   claims: {
//     target_audience: keys.client_id,
//   },
// - see https://cloud.google.com/iap/docs/authentication-howto for id token

function GoogleAccessToken({
  debug = false,
  vault = '.secrets',
  scope = ['https://www.googleapis.com/auth/spreadsheets'],
}) {
  if (Array.isArray(scope)) {
    scope = scope.join(' ');
  }

  async function requestAccessToken(credentials, claims = {}) {
    const keyFileName = path.resolve(vault, credentials);
    const contents = fs.readFileSync(keyFileName, 'utf8');
    const json = JSON.parse(contents);

    const privateKey = json.private_key;
    const clientEmail = json.client_email;
    if (!privateKey || !clientEmail) {
      throw new RestApiError(500, {
        private_key: 'required',
        client_email: 'required',
        error: 'MISSING_CREDENTIALS',
      });
    }

    const iat = Math.floor(new Date().getTime() / 1000);
    const payload = Object.assign(
      {
        iss: clientEmail,
        scope: scope,
        aud: GTOKEN_HOST + GTOKEN_PATH,
        exp: iat + 3600,
        iat,
      },
      claims
    );

    let signedJWT;
    try {
      signedJWT = jws.sign({
        header: { alg: 'RS256' },
        payload,
        secret: privateKey,
      });
    } catch (e) {
      const errors = {
        library: e.library,
        function: e.function,
        reason: e.reason,
        code: e.code,
      };
      throw new RestApiError(500, errors);
    }

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const data = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signedJWT,
    });

    try {
      const { status, data: response } = await afetch(GTOKEN_HOST, {
        method: 'POST',
        path: GTOKEN_PATH,
        headers,
        body: data.toString(),
      });

      if (debug) {
        console.log(status, response);
      }

      const token = {
        user: {
          email: clientEmail,
          token: response.access_token,
          type: response.token_type,
          expiresAt: iat + response.expires_in,
        },
      };

      return token;
    } catch (error) {
      const { status, errors } = error;
      throw new RestApiError(status, errors);
    }
  }
  return { requestAccessToken };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 1) {
    console.log('requesting access token...');
    const gac = GoogleAccessToken(true);
    (async function () {
      try {
        const token = await gac.requestAccessToken(args[0]);
        console.log(token);
      } catch (e) {
        console.log(e);
      }
    })();
  } else {
    console.log('google <secret-file-name>');
  }
}
module.exports = { GoogleAccessToken };
