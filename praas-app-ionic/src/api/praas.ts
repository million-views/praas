import { UserRegistrationRequestData } from './types.d';
import { API_HOST } from '../config/constants';
const API_URL = API_HOST;

// throws type error if parameters is not iterable and that is by design...
// don't call this function when there are no query parameters.
const queryize = (parameters: any) => {
  return Object.entries(parameters).reduce((acc, entry: any, index) => {
    const [param, value] = entry;
    const encoded =
      index === 0
        ? `${param}=${encodeURIComponent(value)}`
        : `&${param}=${encodeURIComponent(value)}`;
    return `${acc}${encoded}`;
  }, '');
};

// applies base service endpoint and optionally creates url query
// string when params is an object.
const urlize = (service: string, params: any = undefined) => {
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
  const user = JSON.parse(localStorage.getItem('user')!);
  const header: any = {};

  if (user && user.hasOwnProperty('token')) {
    header['Authorization'] = `Bearer ${user.token}`;
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
const afetch = async (url: string, { headers, parameters, ...rest }: any) => {
  headers = {
    ...headers,
    ...authorization(),
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  return fetch(urlize(url, parameters), {
    ...rest,
    headers,
  }).then(
    async (response) => {
      // this handles server response (including non 2xx)
      // we can dispatch both success and non-success action creators
      // from here...
      if (response.ok) {
        return response.json();
      } else {
        const errors = await response.json();

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
          ...errors,
        });
      }
    },
    (error) => {
      // this path is for network or internal programming errors
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({
        statusText: "I'm a teapot",
        status: 418, // Unable to contact server, can't make coffee,
        errors: {
          offline: 'Check your network connection',
          network: error.message,
        },
      });
    }
  );
};

const praas = {
  user: {
    register(user: UserRegistrationRequestData) {
      return afetch('/users', {
        method: 'POST',
        body: JSON.stringify(user),
        // parameters: { start: 10, count: 20 }
      });
    },
    login(user: any) {
      return afetch('/users/login', {
        method: 'POST',
        body: JSON.stringify(user),
      });
    },
    logout() {
      return Promise.resolve('success').then((_success) => invalidateSession());
    },
  },
  conduit: {
    add(data: any) {
      return afetch('/conduits', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(conduit: any) {
      const { id } = conduit;
      return afetch(`/conduits/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ conduit }),
      });
    },
    get(id: string) {
      return afetch(`/conduits/${id}`, {
        method: 'GET',
      });
    },
    // TODO: no body here but use queryize
    list(id: string) {
      return afetch('/conduits', {
        method: 'GET',
        body: JSON.stringify(id),
      });
    },
    delete(id: string) {
      return afetch(`/conduits/${id}`, {
        method: 'DELETE',
      });
    },
  },
};

export default praas;
