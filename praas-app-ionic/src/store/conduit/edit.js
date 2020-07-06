import PraasAPI from '../../api/praas';
import { createSuccessNotification } from '../../store/notification';
// This is a create-conduit duck. A duck is a feature state container.

export const UPDATE_CONDUIT_REQUEST = 'conduit/UPDATE_CONDUIT_REQUEST';
export const UPDATE_CONDUIT_SUCCESS = 'conduit/UPDATE_CONDUIT_SUCCESS';
export const UPDATE_CONDUIT_FAILURE = 'conduit/UPDATE_CONDUIT_FAILURE';

// Sync action creators
export const updateConduitSuccess = (conduit) => ({
  type: UPDATE_CONDUIT_SUCCESS,
  payload: conduit,
});

export const updateConduitFailure = (error) => ({
  type: UPDATE_CONDUIT_FAILURE,
  payload: error,
});

export const updateConduit = (conduit) => {
  return (dispatch) => {
    dispatch({ type: UPDATE_CONDUIT_REQUEST });
    PraasAPI.conduit.update(conduit).then(
      (conduit) => {
        dispatch(updateConduitSuccess(conduit));
        dispatch(
          createSuccessNotification({
            message: 'Conduit successfully updated',
          })
        );
      },
      (error) => {
        dispatch(updateConduitFailure(error));
      }
    );
  };
};
const initialState = { inflight: false };

export default function create(state = initialState, { type, payload }) {
  switch (type) {
    case UPDATE_CONDUIT_REQUEST:
      return {
        ...state,
        inflight: true,
      };
    case UPDATE_CONDUIT_SUCCESS:
      return {
        inflight: false,
      };
    case UPDATE_CONDUIT_FAILURE:
      return {
        inflight: false,
        errors: { ...payload.errors },
      };
    default:
      return state;
  }
}

export const getConduit = (state, cid) =>
  state.conduit.list.conduits.find((conduit) => conduit.id === cid);
