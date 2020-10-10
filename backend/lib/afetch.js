// afetch => application specific fetch wrapper
//
// Most of the time we need a way to be able to distinguish between network
// and programmatic errors versus a response from server that indicates an
// erroneous request made by the client.
//
// The distinction between these two conditions leaks all over the place in
// in an application when using fetch directly.  This is a tiny wrapper
// around `fetch` that allows an application to centralize such code in one
// place.

const fetch = require('node-fetch');

// pararameters can be encoded in various ways... for our application needs
// we have the following usecases:
// - Airtable uses bracket ([]) format:
//   {records: [1, 2, 3]}, {qformat: 'bracket'});
//   => 'records[]=1&records[]=2&records[]=3'
// - Conduits uses comma format (TBD: verify to be true):
//   {id: [1, 2, 3]}, {qformat: 'comma'});
//    => 'id=1,2,3'
// - Google uses 'standard' format:
//  {ranges: ['A1:C1', 'A2:C2', 'A3:C3'] {qformat: 'standard'}});
//  => 'ranges=A1:C11&ranges=A2:C2&ranges=A3:C3
const arrayParameterFormatters = {
  bracket(key) {
    const encodedKey = encodeURIComponent(key);
    return (result, value) => {
      return [...result, encodedKey + '[]=' + encodeURIComponent(value)];
    };
  },

  comma(key) {
    const encodedKey = encodeURIComponent(key);
    return (result, value) => {
      if (result.length === 0) {
        return [encodedKey + '=' + encodeURIComponent(value)];
      }

      return [result + ',' + encodeURIComponent(value)];
    };
  },

  standard(key) {
    const encodedKey = encodeURIComponent(key);
    return (result, value) => {
      // console.log('none: ', value);
      return [...result, encodedKey + '=' + encodeURIComponent(value)];
    };
  },
};

// Design choices:
// - no error checking for null or empty parameter values, developer to RTFC
// - no error checking for arrayFormat, developer to RTFC
// - throws type error if parameters is not iterable ...
// - don't call this function when there are no query parameters.
const queryize = (parameters, arrayFormat = 'standard') => {
  const formatter = arrayParameterFormatters[arrayFormat];
  const keys = Object.keys(parameters);
  const encode = (key) => {
    const value = parameters[key];

    if (value === undefined) {
      return '';
    }

    if (value === null) {
      return encodeURIComponent(key);
    }

    if (Array.isArray(value)) {
      return value.reduce(formatter(key), []).join('&');
    }

    return encodeURIComponent(key) + '=' + encodeURIComponent(value);
  };

  return keys
    .map(encode)
    .filter((p) => p.length > 0)
    .join('&');
};

// applies base service endpoint and optionally creates url query
// string when params is an object.
const urlize = (host, path, params, qformat) => {
  let url = host;
  if (path) {
    url += path;
  }

  if (params && Object.keys(params).length) {
    url = `${url}?${queryize(params, qformat)}`;
  }

  return url;
};

// tiny application specific wrapper around fetch. In its current form
// it assumes all responses including errors to be in JSON format.
// as the need arises.
// @host hostname including port number if any (e.g http://localhost:4000)
// @path path to RESTful resource (e.g /conduits)
// @options {headers, path, parameters, qformat, onError, ...rest}
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
// `qformat` specifies how the parameters if any will be encoded when the
//           a parameter value is an array
async function afetch(host, options) {
  const {
    headers,
    path,
    parameters,
    qformat = 'standard',
    onNotOk = 'reject',
    ...rest
  } = options;
  try {
    const url = urlize(host, path, parameters, qformat);
    const response = await fetch(url, {
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
    // this path is for network or internal programming and network errors
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
