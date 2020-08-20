import PraasAPI from 'api/praas';

// This is a create-conduit duck. A duck is a feature state container.

const ADD_CONDUIT_REQUEST = 'conduit/ADD_CONDUIT_REQUEST';
const ADD_CONDUIT_SUCCESS = 'conduit/ADD_CONDUIT_SUCCESS';
const ADD_CONDUIT_FAILURE = 'conduit/ADD_CONDUIT_FAILURE';

// Sync action creators
export const addConduitSuccess = (conduit) => ({
  type: ADD_CONDUIT_SUCCESS, payload: conduit
});

export const addConduitFailure = (errors) => ({
  type: ADD_CONDUIT_FAILURE, payload: errors,
});

// Async action creators
export const addConduit = (conduit) => (dispatch) => {
  dispatch({ type: ADD_CONDUIT_REQUEST, payload: conduit });
  return PraasAPI.conduit.add(conduit).then(
    (data) => {
      // console.log('addConduit, success: ', payload.conduit.id);
      dispatch(addConduitSuccess(data.conduit));
      return Promise.resolve(data.conduit);
    },
    (error) => {
      // console.log('error: ', error);
      dispatch(addConduitFailure(error.errors));
      return Promise.reject(error.errors);
    }
  );
};

const initialState = { inflight: false, errors: {} };

export default function create(state = initialState, { type, payload }) {
  switch (type) {
  case ADD_CONDUIT_REQUEST:
    return {
      inflight: true,
      errors: {},
      ...payload,
    };
  case ADD_CONDUIT_SUCCESS:
    return {
      inflight: false,
      errors: {},
      conduit: { ...state.conduit, ...payload },
    };
  case ADD_CONDUIT_FAILURE:
    // console.log('Deal with this:', payload);
    return {
      inflight: false,
      errors: { ...payload },
    };
  default:
    return state;
  }
}
