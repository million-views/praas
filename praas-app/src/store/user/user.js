import PraasAPI from 'api/praas';

// This is a duck. A duck is a feature state container.

// Actions
// NOTE: Action constants should remain local to the duck
//
// The rationale is that a client (user of an action)
// need only know about what the action does and what
// parameters it takes. How it goes about implementing
// that action is an internal detail that the client
// doesn't have to know.
const REGISTER = 'user/REGISTER';
const REGISTER_SUCCESS = 'user/REGISTER_SUCCESS';
const REGISTER_FAILURE = 'user/REGISTER_FAILURE';

// Sync action creators
export const registerUserSuccess = (user) => ({
  type: REGISTER_SUCCESS, payload: user
});

export const registerUserFailure = (error) => ({
  type: REGISTER_FAILURE, payload: error
});

// Async action creators
export const registerUser = (user) => {
  return (dispatch) => {
    dispatch({ type: REGISTER, user });
    PraasAPI.registerUser(user).then(
      (user) => dispatch(registerUserSuccess(user)),
      (error) => dispatch(registerUserFailure(error))
    );
  };
};

// Reducer
export const user = (state = {}, { type, payload }) => {
  switch (type) {
    case REGISTER:
      return {
        ...state,
        inProgress: true
      };
    case REGISTER_SUCCESS:
      return {
        ...state,
        inProgress: false,
        ...payload.user,
      };
    case REGISTER_FAILURE:
      console.log('Deal with this:', payload);
      return {
        ...state,
        inProgress: false,
      };

    default:
      return state;
  };
};
