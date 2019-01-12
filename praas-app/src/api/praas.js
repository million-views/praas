const API_URL = 'http://localhost:4000';
const API_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: 'yeehaw'
};

// throws type error if parameters is not iterable and that is by design...
// don't call this function when there are no query parameters.
const queryize = parameters => {
  return Object
    .entries(parameters)
    .reduce((acc, entry, index) => {
      const [param, value] = entry;
      const encoded = (index === 0)
        ? `${param}=${encodeURIComponent(value)}`
        : `&${param}=${encodeURIComponent(value)}`;
      return `${acc}${encoded}`;
    }, '');
};

// applies base service endpoint and optionally creates url query
// string when params is an object.
const urlize = (service, params = undefined) => {
  service = `${API_URL}${service}`;
  if (params) {
    service = `${service}?${queryize(params)}`;
  }
  return service;
};

// const rejectErrors = (res) => {
//   const { status } = res;

//   if (status >= 200 && status < 300) {
//     return res;
//   }
//   // return ({ status: res.status, error: res.json() });

//   return Promise.reject({
//     statusText: res.statusText,
//     status: res.status,
//     error: res.json()
//   });
// };

// This is a custom fetch that is coded to work with the specification
// of the backend REST api server. In simple terms it expects all responses
// including errors to be in JSON format. Exception for image loading for
// example, will be accomodated within this function as the need arises.
//
const afetch = async (url, { headers, parameters, ...rest }) => {
  headers = {
    ...headers,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  return fetch(
    urlize(url, parameters), {
      ...rest,
      headers,
    }
  ).then(
    async (response) => {
      // this handles server response (including non 2xx)
      // we can dispatch both success and non-success action creators
      // from here...
      if (response.ok) {
        return response.json();
      } else {
        const errors = await response.json();
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject({
          statusText: response.statusText,
          status: response.status,
          errors
        });
      };
    },
    (error) => {
      // this path is for network errors
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({
        statusText: "I'm a teapot",
        status: 418, // Unable to contact server, can't make coffee,
        error: { errors: { offline: 'check your network connection', network: error } }
      });
    }
  );
};

const praas = {
  registerUser(data) {
    return afetch('/users', {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(data),
      // parameters: { start: 10, count: 20 }
    });
  }
};

export default praas;
