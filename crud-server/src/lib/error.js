// Using appropriate response status code in a REST api can be a tricky
// proposition. Most appropriate status code *may* disclose information
// about the system disposition, which in turn can be used by bad actors
// to do bad things.
//
// Read more on this:
// - https://www.bennadel.com/blog/2400-handling-forbidden-restful-requests-401-vs-403-vs-404.htm
// - https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#4xx_Client_errors
//

const REST_API_ERRORS = {
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  422: 'Unprocessable Entity',
  424: 'Failed Dependency',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  511: 'Network Authentication Required',
};

// sanitize attempts to deal with variations of errors thrown by us
// and lower layer dependencies such as sequelize...
function sanitize(errors) {
  if (!Array.isArray(errors)) {
    if (errors.errors) {
      errors = errors.errors;
      if (Array.isArray(errors)) {
        // sanitize sequelize errors..
        const essentials = [];
        for (const error of errors) {
          const sanitized = { [error.path]: error.message };
          essentials.push(sanitized);
        }
        errors = essentials;
      }
    }
  }

  return errors;
}

function RestApiError(statusCode, errors = {}) {
  Error.captureStackTrace(this, RestApiError);
  this.errors = sanitize(errors);
  this.message = REST_API_ERRORS[statusCode];
  this.status = statusCode;
};

module.exports = RestApiError;
