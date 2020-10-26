const { UnauthorizedError } = require('express-jwt');
const inspect = require('util').inspect;

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
}

function RestApiErrorHandler(err, req, res, next) {
  // request path is the flow origin that led to the error
  err.path = req.path;
  err.method = req.method;
  err.query = req.query;

  // fail fast: unknown error types are unexpected here.
  if (!(err instanceof RestApiError)) {
    if (err instanceof UnauthorizedError) {
      // NOTE: UnauthorizedError comes from JWT middleware which can
      // only be intercepted here because it throws on error. The stack
      // trace from it is pretty much useless, so we discard it. And add
      // our own errors object.

      // We copy out of it because deleting .stack here doesn't work... also
      // for the sake of consistency we transform UnauthorizedError into
      // RestApiError.
      const { message, status, path } = err;
      err = Object.setPrototypeOf(
        {
          message,
          status,
          path,
          errors: { authorization: 'token not found or malformed' },
        },
        Object.getPrototypeOf(new RestApiError(status))
      );
    } else {
      const cname = err.constructor.name;
      console.error(
        `expected RestApiError or UnauthorizedError, got ${cname}; bailing!`,
        inspect(err, { depth: 6 })
      );
      process.exit(1);
    }
  }

  // make sure stack trace doesn't leak back to client
  const stack = err.stack;
  delete err.stack; // <- this works because RestApiError is ours?

  // on mac/linux run with:
  // DUMP_ERROR_RESPONSE=1 npm run `task`
  if (process.env.DUMP_ERROR_RESPONSE) {
    err.body = req.body;
    console.error(inspect(err, { depth: 6 }));
  }

  if (process.env.DUMP_STACK_TRACE && stack) {
    // on mac/linux run with:
    // DUMP_STACK_TRACE=1 npm run `task`
    console.error(inspect(stack, { depth: 6 }));
  }

  const errors = err.errors;
  res.status(err.status || 500);
  res.json({ errors });
}
module.exports = { RestApiError, RestApiErrorHandler };
