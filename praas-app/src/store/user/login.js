import PraasAPI from 'api/praas';

// This is a user-authentication duck. A duck is a feature state container.

const LOGIN_REQUEST = 'user/LOGIN_REQUEST';
const LOGIN_SUCCESS = 'user/LOGIN_SUCCESS';
const LOGIN_FAILURE = 'user/LOGIN_FAILURE';

// Sync action creators
export const loginUserSuccess = (user) => ({
  type: LOGIN_SUCCESS, payload: user
});

export const loginUserFailure = (error) => ({
  type: LOGIN_FAILURE, payload: error
});

// Async action creators
export const loginUser = (email, password) => {
  return (dispatch) => {
    dispatch({ type: LOGIN_REQUEST, payload: { email, password } });
    PraasAPI.user.login(email, password).then(
      (user) => dispatch(loginUserSuccess(user)),
      (error) => dispatch(loginUserFailure(error))
    );
  };
};

// Reducer
export default function login(state = { inflight: false }, { type, payload }) {
  switch (type) {
    case LOGIN_REQUEST:
      return {
        inflight: true,
        ...payload
      };
    case LOGIN_SUCCESS:
      return {
        inflight: false,
        ...payload.user,
      };
    case LOGIN_FAILURE:
      console.log('Deal with this:', payload);
      return {
        inflight: false,
      };
    default:
      return state;
  };
};
