import PraasAPI from 'api/praas';

// This is a list-conduit duck. A duck is a feature state container.

const DELETE_CONDUIT_REQUEST = 'conduit/DELETE_CONDUIT_REQUEST';
const DELETE_CONDUIT_SUCCESS = 'conduit/DELETE_CONDUIT_SUCCESS';
const DELETE_CONDUIT_FAILURE = 'conduit/DELETE_CONDUIT_FAILURE';

// Sync action creators
export const deleteConduitSuccess = (payload) => ({
  type: DELETE_CONDUIT_SUCCESS, payload
});

export const deleteConduitFailure = (error) => ({
  type: DELETE_CONDUIT_FAILURE, payload: error
});

// Async action creators
export const deleteConduit = (conduitId, changeView) => {
  return (dispatch) => {
    dispatch({ type: DELETE_CONDUIT_REQUEST });
    PraasAPI.conduit.delete(conduitId).then(
      (payload) => {
        // console.log('deleteConduit, success: ', payload.conduit.id);
        // actions.setSubmitting(false);
        dispatch(deleteConduitSuccess(payload));
        changeView('list', 'refresh', undefined, 'store/delete');
      },
      (error) => {
        dispatch(deleteConduitFailure(error));
      }
    );
  };
};
const initialState = { inflight: false, errors: {} };

export default function del(state = initialState, { type, payload }) {
  switch (type) {
  case DELETE_CONDUIT_REQUEST:
    return {
      inflight: true,
      errors: {},
      ...payload
    };
  case DELETE_CONDUIT_SUCCESS:
    return {
      errors: {},
      inflight: false,
    };
  case DELETE_CONDUIT_FAILURE:
    return {
      inflight: false,
      errors: { ...payload },
    };
  default:
    return state;
  };
};
