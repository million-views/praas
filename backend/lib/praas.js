const afetch = require('./afetch');

// localStorage-polyfill is meant for development but we are
// abusing it here to get the proxy server functional...
require('localstorage-polyfill');

const API_HOST = 'http://localhost:4000';

const authorization = () => {
  // we store jwt token in localStorage; there are healthy debates
  // on the Internet on whether it should be stored as a cookie or
  // in localStorage. Until we understand in depth about the pros
  // and cons of either approach, we are going with localStorage
  // (which results in less code, faster development and eliminates
  // a few test cases.
  const user = JSON.parse(global.localStorage.getItem('user'));
  const header = {};

  if (user && {}.propertyIsEnumerable.call(user, 'token')) {
    header.Authorization = `Bearer ${user.token}`;
  }

  return header;
};

const invalidateSession = () => {
  global.localStorage.removeItem('user');
};

function headers() {
  return {
    ...authorization(),
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

// This handles server response with a status code other than 2xx...
// ... which is distinct from network and other errors when using fetch
async function onServerError(response) {
  const errors = await response.json();
  console.log('error: ', errors);
  if (response.status === 401) {
    // token expired? clear our view of logged in status
    invalidateSession();
  }

  // eslint-disable-next-line prefer-promise-reject-errors
  return Promise.reject({
    statusText: response.statusText,
    status: response.status,
    ...errors,
  });
}

function praas() {
  return {
    user: {
      register(data) {
        return afetch(API_HOST, '/users', {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(data),
          // parameters: { start: 10, count: 20 }
          onError: onServerError,
        });
      },
      login(data) {
        return afetch(API_HOST, '/users/login', {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(data),
          onError: onServerError,
        });
      },
      logout() {
        return Promise.resolve('success').then(() => invalidateSession());
      },
    },
    conduit: {
      add(data) {
        return afetch(API_HOST, '/conduits', {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(data),
          onError: onServerError,
        });
      },
      update(data) {
        const cid = data.conduit.id;
        return afetch(API_HOST, `/conduits/${cid}`, {
          method: 'PATCH',
          headers: headers(),
          body: JSON.stringify(data),
          onError: onServerError,
        });
      },
      get(id) {
        return afetch(API_HOST, `/conduits/${id}`, {
          method: 'GET',
          headers: headers(),
          onError: onServerError,
        });
      },
      list(_id) {
        // id is not used
        return afetch(API_HOST, '/conduits', {
          method: 'GET',
          headers: headers(),
          onError: onServerError,
        });
      },
      delete(data) {
        console.log('data: ', data);
        const cid = data;
        return afetch(API_HOST, `/conduits/${cid}`, {
          method: 'DELETE',
          headers: headers(),
          onError: onServerError,
        });
      },
    },
  };
}

// export default praas;
module.exports = praas();
