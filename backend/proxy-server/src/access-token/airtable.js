const { RestApiError } = require('../../../lib/error');

// Airtable credentials is already an 'access-token' and doesn't have
// an expiry at the moment
function AirtableAccessToken({ debug = false }) {
  async function requestAccessToken(credentials) {
    if (!credentials) {
      throw new RestApiError(422, {
        error: 'INVALID_CREDENTIALS',
      });
    }

    // hmmm, this feels a bit overboard in order to fit in with the rest
    const iat = Math.floor(new Date().getTime() / 1000);

    const token = {
      user: {
        email: 'proxy@example.com',
        token: credentials,
        type: 'Bearer',
        expiresAt: iat + 3600,
      },
    };

    return token;
  }

  return { requestAccessToken };
}

module.exports = { AirtableAccessToken };
