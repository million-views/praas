import PraasAPI from '../../api/praas';
// import {} from 'react-router-dom';
import { loginUserSuccess } from './login';

// This is a user-registration duck. A duck is a feature state container.
const REGISTER_REQUEST = 'user/REGISTER_REQUEST';
const REGISTER_SUCCESS = 'user/REGISTER_SUCCESS';
const REGISTER_FAILURE = 'user/REGISTER_FAILURE';

// Sync action creators
export const registerSuccess = (user) => ({
  type: REGISTER_SUCCESS,
  payload: user,
});

export const registerFailure = (error) => ({
  type: REGISTER_FAILURE,
  payload: error,
});

// Async action creators
export const registerUser = (user, actions) => {
  return (dispatch) => {
    dispatch({ type: REGISTER_REQUEST, user });
    PraasAPI.user.register(user).then(
      (user) => {
        dispatch(registerSuccess(user));
        dispatch(loginUserSuccess(user));
        actions.setSubmitting(false);
        // navigate('/login');
      },
      (error) => {
        dispatch(registerFailure(error));
        actions.setSubmitting(false);
        actions.setStatus({ errors: { ...error.errors } });
      }
    );
  };
};

// Reducer
export default function registration(
  state = { inflight: false },
  { type, payload }
) {
  switch (type) {
    case REGISTER_REQUEST:
      return {
        inflight: true,
      };
    case REGISTER_SUCCESS:
      return {
        inflight: false,
        errors: {},
      };
    case REGISTER_FAILURE:
      return {
        inflight: false,
        errors: { ...payload.errors },
      };

    default:
      return state;
  }
}
