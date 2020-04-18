import PraasAPI from '../../api/praas';
// import * as alertActions from 'store/alert';

// This is a user-authentication duck. A duck is a feature state container.

const LOGIN_REQUEST = 'user/LOGIN_REQUEST';
const LOGIN_SUCCESS = 'user/LOGIN_SUCCESS';
const LOGIN_FAILURE = 'user/LOGIN_FAILURE';
const LOGOUT = 'user/LOGOUT';

// Sync action creators
export const loginUserSuccess = (user) => ({
  type: LOGIN_SUCCESS,
  user,
});

export const loginUserFailure = ({ errors }) => ({
  type: LOGIN_FAILURE,
  errors,
});

// odd man out :-(
export const logoutSuccess = () => {
  return { type: LOGOUT };
};

// Async action creators
export const logoutUser = () => {
  return (dispatch) => {
    PraasAPI.user
      .logout()
      .then(
        (success) => {
          // navigate('/');
        },
        (error) => {
          // navigate('/');
        }
      )
      .then(() => {
        dispatch(logoutSuccess());
      });
  };
};

export const loginUser = (user, actions) => {
  return (dispatch) => {
    dispatch({ type: LOGIN_REQUEST });
    PraasAPI.user.login(user).then(
      (data) => {
        dispatch(loginUserSuccess(data.user));
      },
      (error) => {
        dispatch(loginUserFailure(error));
      }
    );
  };
};

// Reducer
const localUser = JSON.parse(localStorage.getItem('user'));
const initialState = localUser
  ? { inflight: false, loggedIn: true, ...localUser }
  : { inflight: false, loggedIn: false };
export default function login(state = initialState, { type, user, errors }) {
  switch (type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        inflight: true,
      };
    case LOGIN_SUCCESS:
      localStorage.setItem('user', JSON.stringify(user));
      return {
        inflight: false,
        loggedIn: true,
        user,
      };
    case LOGIN_FAILURE:
      return {
        inflight: false,
        loggedIn: false,
        errors: { ...errors },
      };
    case LOGOUT:
      return {
        inflight: false,
        loggedIn: false,
      };
    default:
      return state;
  }
}
