import PraasAPI from 'api/praas';

// This is a user-registration duck. A duck is a feature state container.
const REGISTER_REQUEST = 'user/REGISTER_REQUEST';
const REGISTER_SUCCESS = 'user/REGISTER_SUCCESS';
const REGISTER_FAILURE = 'user/REGISTER_FAILURE';

// Sync action creators
export const registerSuccess = (user) => ({
  type: REGISTER_SUCCESS, payload: user
});

export const registerFailure = (errors) => ({
  type: REGISTER_FAILURE, payload: errors
});

// Async action creators
export const registerUser = (user) => (dispatch) => {
  dispatch({ type: REGISTER_REQUEST, user });
  return PraasAPI.user.register(user).then(
    (data) => {
      dispatch(registerSuccess(data.user));
      return Promise.resolve(data.user);
    },
    (error) => {
      dispatch(registerFailure(error.errors));
      return Promise.reject(error.errors);
    }
  );
};

// Reducer
export default function registration(state = { inflight: false }, { type, payload }) {
  switch (type) {
  case REGISTER_REQUEST:
    return {
      inflight: true,
      errors: {}
    };
  case REGISTER_SUCCESS:
    return {
      // ...state,
      inflight: false,
      errors: {}
      // ...payload, // <- uncomment if we decide to login user on success
    };
  case REGISTER_FAILURE:
    // console.log('Deal with this:', payload);
    return {
      inflight: false,
      errors: { ...payload }
    };

  default:
    return state;
  };
};
