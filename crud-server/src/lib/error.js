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

function RestApiError(path, statusCode, errors = {}, message = undefined) {
  Error.captureStackTrace(this, RestApiError);
  this.path = path;
  this.errors = errors;
  this.message = message || REST_API_ERRORS[statusCode];
  this.status = statusCode;
};

module.exports = RestApiError;
