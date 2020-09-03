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
const urlize = (host, path, params = undefined) => {
  let url = `${host}${path}`;
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
// @options {headers, parameters, onError, ...rest}
//
// onError in options is invoked for non-2xx responses; all other errors
// `reject`ed.
async function afetch(host, path, options) {
  const { headers, parameters, onError, ...rest } = options;
  try {
    const response = await fetch(urlize(host, path, parameters), {
      ...rest,
      headers,
    });
    // this handles server response (including non 2xx)
    if (response.ok) {
      return response.json();
    } else {
      if (onError) {
        return onError(response);
      } else {
        // caller wants server errors to be treated as error
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject(response);
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
