import PraasAPI from 'api/praas';
// This is a user-authentication duck. A duck is a feature state container.

const LOGIN_REQUEST = 'user/LOGIN_REQUEST';
const LOGIN_SUCCESS = 'user/LOGIN_SUCCESS';
const LOGIN_FAILURE = 'user/LOGIN_FAILURE';
const LOGOUT = 'user/LOGOUT';

// Sync action creators
const loginUserSuccess = (user) => ({
  type: LOGIN_SUCCESS, payload: user
});

const loginUserFailure = (errors) => ({
  type: LOGIN_FAILURE, payload: errors
});

// odd man out :-(
const logoutSuccess = () => {
  return { type: LOGOUT };
};

// Async action creators
export const logoutUser = () => (dispatch) => {
  return PraasAPI.user.logout().then(() => {
    dispatch(logoutSuccess());
    return Promise.resolve();
  });
};

export const loginUser = (user) => (dispatch) => {
  dispatch({ type: LOGIN_REQUEST, payload: user });
  return PraasAPI.user.login(user).then(
    (data) => {
      localStorage.setItem('user', JSON.stringify({ ...data.user }));
      dispatch(loginUserSuccess(data.user));
      return Promise.resolve(data.user);
    },
    (error) => {
      dispatch(loginUserFailure(error.errors));
      return Promise.reject(error.errors);
    }
  );
};

// Reducer
const localUser = JSON.parse(localStorage.getItem('user'));
const initialState = localUser
  ? { inflight: false, loggedIn: true, errors: {}, ...localUser }
  : { inflight: false, loggedIn: false };
export default function login(state = initialState, { type, payload }) {
  switch (type) {
  case LOGIN_REQUEST:
    return {
      inflight: true,
      loggedIn: false,
      errors: {},
    };
  case LOGIN_SUCCESS:
    return {
      inflight: false,
      loggedIn: true,
      errors: {},
      ...payload,
    };
  case LOGIN_FAILURE:
    // console.log('Deal with this:', payload);
    return {
      inflight: false,
      loggedIn: false,
      errors: { ...payload }
    };
  case LOGOUT:
    return {
      inflight: false,
      loggedIn: false,
      errors: {}
    };
  default:
    return state;
  };
};
