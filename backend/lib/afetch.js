// afetch => application specific fetch wrapper
//
// Most of the time we need a way to be able to distinguish between a network
// and programmatic errors versus a response from server that indicates an
// erroneous request.
//
// The distinction between these two conditions leaks all over the place in
// in an application when using fetch directly.  This is a tiny wrapper
// around `fetch` that allows an application to centralize such code in one
// place.

const fetch = require('node-fetch');

// throws type error if parameters is not iterable and that is by design...
// don't call this function when there are no query parameters.
const queryize = (parameters) => {
  return Object.entries(parameters).reduce((acc, entry, index) => {
    const [param, value] = entry;
    const encoded =
      index === 0
        ? `${param}=${encodeURIComponent(value)}&`
        : `${param}=${encodeURIComponent(value)}`;
    return `${acc}${encoded}`;
  }, '');
};

// applies base service endpoint and optionally creates url query
// string when params is an object.
const urlize = (host, path = undefined, params = undefined) => {
  let url = host;
  if (path) {
    url += path;
  }

  if (params) {
    url = `${url}?${queryize(params)}`;
  }

  return url;
};

// tiny application specific wrapper around fetch. In its current form
// it assumes all responses including errors to be in JSON format.
// as the need arises.
// @host hostname including port number if any (e.g http://localhost:4000)
// @path path to RESTful resource (e.g /conduits)
// @options {headers, path, parameters, onError, ...rest}
//
// `onNotOk` in options is used to decide how to treat non-2xx response
// It can be a string or a function; string can be either 'resolve' or
// 'reject'.
// - If set to 'resolve' then `status` and `data` is returned using
//   Promise.resolve
// - If set to 'reject' then `status` and `errors` is returned using
//   Promise.reject.
// - If it is a function then the response along with the request
//   is passed to it for custom error handling by the developer.
//
// `path` in options identifies the REST resource at host. It is concatenated
//  to `host` if present. For instance if host is 'http://localhost:4000' and
//  path is '/conduits' then  `URL` passed to the underlying `fetch`
//  implementation will be 'http://localhost:4000/conduits'
//
async function afetch(host, options) {
  const { headers, path, parameters, onNotOk = 'resolve', ...rest } = options;
  try {
    const response = await fetch(urlize(host, path, parameters), {
      ...rest,
      headers,
    });
    // this handles server response (including non 2xx)
    if (response.ok) {
      return { status: response.status, data: await response.json() };
    } else {
      if (typeof onNotOk === 'function') {
        const request = { host, options };
        return onNotOk(response, request);
      } else {
        // for the majority of our use cases it is safe to assume that the
        // response regardless of the status will be in json format; if this
        // is not the case then the developer has the option to use a function.
        if (onNotOk === 'resolve') {
          Promise.resolve({
            status: response.status,
            data: await response.json(),
          });
        } else {
          // caller wants server errors to be treated as error
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject({
            status: response.status,
            errors: await response.json(),
          });
        }
      }
    }
  } catch (error) {
    console.log('Got into an error situation');
    // this path is for network or internal programming and networl errors
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject({
      statusText: "I'm a teapot",
      status: 418, // Unable to contact server, can't make coffee,
      errors: {
        offline: 'Check host name and confirm server is up and accessible',
        network: error.message,
      },
    });
  }
}

module.exports = afetch;
