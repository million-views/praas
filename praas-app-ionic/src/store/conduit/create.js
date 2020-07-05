import PraasAPI from '../../api/praas';

// This is a create-conduit duck. A duck is a feature state container.

export const ADD_CONDUIT_REQUEST = 'conduit/ADD_CONDUIT_REQUEST';
export const ADD_CONDUIT_SUCCESS = 'conduit/ADD_CONDUIT_SUCCESS';
export const ADD_CONDUIT_FAILURE = 'conduit/ADD_CONDUIT_FAILURE';

// Sync action creators
export const addConduitSuccess = (conduit) => ({
  type: ADD_CONDUIT_SUCCESS,
  payload: conduit,
});

export const addConduitFailure = (error) => ({
  type: ADD_CONDUIT_FAILURE,
  payload: error,
});

export const addConduit = (conduit) => {
  return (dispatch) => {
    dispatch({ type: ADD_CONDUIT_REQUEST, payload: conduit });
    PraasAPI.conduit.add({ conduit }).then(
      (conduit) => {
        dispatch(addConduitSuccess(conduit));
      },
      (error) => {
        dispatch(addConduitFailure(error));
      }
    );
  };
};
const initialState = { inflight: false };

export default function create(state = initialState, { type, payload }) {
  switch (type) {
    case ADD_CONDUIT_REQUEST:
      return {
        ...state,
        inflight: true,
      };
    case ADD_CONDUIT_SUCCESS:
      return {
        inflight: false,
      };
    case ADD_CONDUIT_FAILURE:
      return {
        inflight: false,
        errors: { ...payload.errors },
      };
    default:
      return state;
  }
}
