import { navigate } from '@reach/router';

import PraasAPI from 'api/praas';
import * as alertActions from 'store/alert';

// This is a user-registration duck. A duck is a feature state container.

const REGISTER_REQUEST = 'user/REGISTER_REQUEST';
const REGISTER_SUCCESS = 'user/REGISTER_SUCCESS';
const REGISTER_FAILURE = 'user/REGISTER_FAILURE';

// Sync action creators
export const registerSuccess = (user) => ({
  type: REGISTER_SUCCESS, payload: user
});

export const registerFailure = (error) => ({
  type: REGISTER_FAILURE, payload: error
});

// Async action creators
export const registerUser = (user) => {
  return (dispatch) => {
    dispatch({ type: REGISTER_REQUEST, user });
    PraasAPI.user.register(user).then(
      (user) => {
        dispatch(registerSuccess(user));
        navigate('/login');
      },
      (error) => {
        console.log('error: ', error);
        dispatch(registerFailure(error));
        dispatch(alertActions.error(error));
        // dispatch(alertActions.error('Some error happened'));
      }
    );
  };
};

// Reducer
export default function registration(state = { inflight: false }, { type, payload }) {
  switch (type) {
    case REGISTER_REQUEST:
      return {
        inflight: true
      };
    case REGISTER_SUCCESS:
      return {
        // ...state,
        inflight: false,
        // ...payload.user,
      };
    case REGISTER_FAILURE:
      console.log('Deal with this:', payload);
      return {
        ...state,
        inflight: false,
      };

    default:
      return state;
  };
};
