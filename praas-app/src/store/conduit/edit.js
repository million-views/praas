import PraasAPI from 'api/praas';

// This is a create-conduit duck. A duck is a feature state container.

const UPDATE_CONDUIT_REQUEST = 'conduit/UPDATE_CONDUIT_REQUEST';
const UPDATE_CONDUIT_SUCCESS = 'conduit/UPDATE_CONDUIT_SUCCESS';
const UPDATE_CONDUIT_FAILURE = 'conduit/UPDATE_CONDUIT_FAILURE';

// Sync action creators
export const updateConduitSuccess = (conduit) => ({
  type: UPDATE_CONDUIT_SUCCESS, payload: conduit
});

export const updateConduitFailure = (errors) => ({
  type: UPDATE_CONDUIT_FAILURE, payload: errors
});

// Async action creators
export const updateConduit = (conduit) => (dispatch) => {
  dispatch({ type: UPDATE_CONDUIT_REQUEST, payload: conduit });
  console.log('updateConduit: ', conduit.id, Object.keys(conduit));
  return PraasAPI.conduit.update(conduit).then(
    (data) => {
      // console.log('updateConduit, successs: ', payload.conduit.id);
      dispatch(updateConduitSuccess(data.conduit));
      return Promise.resolve(data.conduit);
    },
    (error) => {
      dispatch(updateConduitFailure(error.errors));
      return Promise.reject(error.errors);
    }
  );
};

const initialState = { inflight: false, errors: {} };

export default function create(state = initialState, { type, payload }) {
  switch (type) {
  case UPDATE_CONDUIT_REQUEST:
    return {
      inflight: true,
      errors: {},
      ...payload,
    };
  case UPDATE_CONDUIT_SUCCESS:
    return {
      inflight: false,
      errors: {},
      conduit: { ...state.conduit, ...payload },
    };
  case UPDATE_CONDUIT_FAILURE:
    // console.log('Deal with this:', payload);
    return {
      inflight: false,
      errors: { ...payload },
    };
  default:
    return state;
  };
};

// selector
export const getConduit
  = (state, cid) => state.conduit.list.conduits.find((conduit) => conduit.id === cid);
