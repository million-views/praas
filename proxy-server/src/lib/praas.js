const fetch = require('node-fetch');

// localStorage-polyfill is meant for development but we are
// abusing it here to get the proxy server functional...
require('localstorage-polyfill');

const API_URL = 'http://localhost:4000';

// throws type error if parameters is not iterable and that is by design...
// don't call this function when there are no query parameters.
const queryize = parameters => {
  return Object
    .entries(parameters)
    .reduce((acc, entry, index) => {
      const [param, value] = entry;
      const encoded = (index === 0) ?
        `${param}=${encodeURIComponent(value)}&` :
        `${param}=${encodeURIComponent(value)}`;
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

const authorization = () => {
  // we store jwt token in localStorage; there are healthy debates
  // on the Internet on whether it should be stored as a cookie or
  // in localStorage. Until we understand in depth about the pros
  // and cons of either approach, we are going with localStorage
  // (which results in less code, faster development and eliminates
  // a few test cases.
  const user = JSON.parse(localStorage.getItem('user'));
  const header = {};

  if (user && {}.propertyIsEnumerable.call(user, 'token')) {
    header.Authorization = `Bearer ${user.token}`;
  }

  return header;
};

const invalidateSession = () => {
  localStorage.removeItem('user');
};

// This is a custom fetch that is coded to work with the specification
// of the backend REST api server. In simple terms it expects all responses
// including errors to be in JSON format. Exception for image loading for
// example, will be accomodated within this function as the need arises.
//
const afetch = async (url, { headers, parameters, ...rest }) => {
  headers = {
    ...headers,
    ...authorization(),
    Accept: 'application/json',
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
        console.log('error: ', errors);
        if (response.status === 401) {
          // token expired? clear our view of logged in status
          invalidateSession();
          // reload current page to kickstart a new session
          // location.reload(true);
        }

        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject({
          statusText: response.statusText,
          status: response.status,
          ...errors
        });
      };
    },
    (error) => {
      console.log('Got into an error situation');
      // this path is for network or internal programming errors
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({
        statusText: "I'm a teapot",
        status: 418, // Unable to contact server, can't make coffee,
        errors: { offline: 'Check your network connection', network: error.message }
      });
    }
  );
};

const praas = {
  user: {
    register(data) {
      return afetch('/users', {
        method: 'POST',
        body: JSON.stringify(data),
        // parameters: { start: 10, count: 20 }
      });
    },
    login(data) {
      return afetch('/users/login', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    logout() {
      return Promise.resolve('success').then((_success) => invalidateSession());
    }
  },
  conduit: {
    add(data) {
      return afetch('/conduits', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    update(data) {
      const cid = data.conduit.id;
      return afetch(`/conduits/${cid}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },
    list(_id) {
      // id is not used
      return afetch('/conduits', {
        method: 'GET',
        // body: JSON.stringify(id),
      });
    },
    delete(data) {
      console.log('data: ', data);
      const cid = data;
      return afetch(`/conduits/${cid}`, {
        method: 'DELETE',
      });
    },
  },
};

// export default praas;
module.exports = praas;
