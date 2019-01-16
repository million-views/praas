import { navigate } from '@reach/router';
import PraasAPI from 'api/praas';
import * as alertActions from 'store/alert';

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
export const logoutUser = () => {
  PraasAPI.user.logout();
  return { type: LOGOUT };
};

// Async action creators
export const loginUser = (email, password) => {
  return (dispatch) => {
    dispatch({ type: LOGIN_REQUEST, payload: { email, password } });
    PraasAPI.user.login(email, password).then(
      (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        dispatch(loginUserSuccess(user));
        navigate('/');
      },
      (error) => {
        dispatch(loginUserFailure(error));
        dispatch(alertActions.error(error));
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
        inflight: true,
        ...payload
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
        ...state,
        inflight: false,
      };
    case LOGOUT:
      return {};
    default:
      return state;
  };
};
