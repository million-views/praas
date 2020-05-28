import PraasAPI from '../../api/praas';

// This is a list-conduit duck. A duck is a feature state container.

export const DELETE_CONDUIT_REQUEST = 'conduit/DELETE_CONDUIT_REQUEST';
export const DELETE_CONDUIT_SUCCESS = 'conduit/DELETE_CONDUIT_SUCCESS';
export const DELETE_CONDUIT_FAILURE = 'conduit/DELETE_CONDUIT_FAILURE';

// Sync action creators
export const deleteConduitSuccess = (conduitId) => ({
  type: DELETE_CONDUIT_SUCCESS,
  payload: { conduitId },
});

export const deleteConduitFailure = (error) => ({
  type: DELETE_CONDUIT_FAILURE,
  payload: error,
});

export const deleteConduit = (conduitId) => {
  return (dispatch) => {
    dispatch({ type: DELETE_CONDUIT_REQUEST });
    PraasAPI.conduit.delete(conduitId).then(
      () => {
        dispatch(deleteConduitSuccess(conduitId));
      },
      (error) => {
        dispatch(deleteConduitFailure(error));
      }
    );
  };
};
const initialState = { inflight: false };

export default function del(state = initialState, { type, payload }) {
  switch (type) {
    case DELETE_CONDUIT_REQUEST:
      return {
        ...state,
        inflight: true,
      };
    case DELETE_CONDUIT_SUCCESS:
      return {
        inflight: false,
      };
    case DELETE_CONDUIT_FAILURE:
      return {
        inflight: false,
        errors: { ...payload.errors },
      };
    default:
      return state;
  }
}
