import PraasAPI from '../../api/praas';

// This is a list-conduit duck. A duck is a feature state container.

const GET_CONDUIT_REQUEST = 'conduit/GET_CONDUIT_REQUEST';
const GET_CONDUIT_SUCCESS = 'conduit/GET_CONDUIT_SUCCESS';
const GET_CONDUIT_FAILURE = 'conduit/GET_CONDUIT_FAILURE';

// Sync action creators
export const getConduitSuccess = (conduit) => ({
  type: GET_CONDUIT_SUCCESS,
  payload: conduit,
});

export const getConduitFailure = (error) => ({
  type: GET_CONDUIT_FAILURE,
  payload: error,
});

export const getConduit = (conduitId) => {
  return (dispatch) => {
    dispatch({ type: GET_CONDUIT_REQUEST });
    PraasAPI.conduit.get(conduitId).then(
      (conduit) => {
        dispatch(getConduitSuccess(conduit));
      },
      (error) => {
        dispatch(getConduitFailure(error));
      }
    );
  };
};
const initialState = { inflight: false, conduits: [{}] };

export default function list(state = initialState, { type, payload }) {
  switch (type) {
    case GET_CONDUIT_REQUEST:
      return {
        ...state,
        inflight: true,
      };
    case GET_CONDUIT_SUCCESS:
      return {
        inflight: false,
        item: payload.conduit,
      };
    case GET_CONDUIT_FAILURE:
      return {
        inflight: false,
        errors: { ...payload.errors },
      };
    default:
      return state;
  }
}
