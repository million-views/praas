import PraasAPI from 'api/praas';
// This is a user-authentication duck. A duck is a feature state container.

const LOGIN_REQUEST = 'user/LOGIN_REQUEST';
const LOGIN_SUCCESS = 'user/LOGIN_SUCCESS';
const LOGIN_FAILURE = 'user/LOGIN_FAILURE';
const LOGOUT = 'user/LOGOUT';

// Sync action creators
export const loginUserSuccess = (user) => ({
  type: LOGIN_SUCCESS, payload: user
});

export const loginUserFailure = (error) => ({
  type: LOGIN_FAILURE, payload: error
});

// odd man out :-(
export const logoutSuccess = () => {
  return { type: LOGOUT };
};

// Async action creators
export const logoutUser = (navigate) => {
  return (dispatch) => {
    PraasAPI.user.logout().then(
      (success) => {
        console.log('logout: ', success);
        navigate('/');
      },
      (error) => {
        console.log('logout: ', error);
        navigate('/');
      }
    ).then(() => {
      dispatch(logoutSuccess());
    });
  };
};

export const loginUser = (user, actions, navigate) => {
  return (dispatch) => {
    dispatch({ type: LOGIN_REQUEST, payload: user });
    PraasAPI.user.login(user).then(
      (data) => {
        localStorage.setItem('user', JSON.stringify({ ...data.user }));
        dispatch(loginUserSuccess(data.user));
        actions.setSubmitting(false);
        navigate('/');
      },
      (error) => {
        dispatch(loginUserFailure(error));
        actions.setSubmitting(false);
        actions.setStatus({ errors: { ...error.errors } });
      }
    );
  };
};

// Reducer
const localUser = JSON.parse(localStorage.getItem('user'));
const initialState = localUser
  ? { inflight: false, loggedIn: true, ...localUser }
  : { inflight: false, loggedIn: false };
export default function login(state = initialState, { type, payload }) {
  switch (type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        inflight: true,
        ...payload.user
      };
    case LOGIN_SUCCESS:
      return {
        inflight: false,
        loggedIn: true,
        ...payload.user,
      };
    case LOGIN_FAILURE:
      console.log('Deal with this:', payload);
      return {
        inflight: false,
        loggedIn: false,
        errors: { ...payload.errors }
      };
    case LOGOUT:
      return {
        inflight: false,
        loggedIn: false
      };
    default:
      return state;
  };
};
