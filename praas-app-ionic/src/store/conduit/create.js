import PraasAPI from '../../api/praas';
import {
  createSuccessNotification,
  createErrorNotification,
} from '../../store/notification';

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
    return PraasAPI.conduit.add({ conduit }).then(
      (conduit) => {
        dispatch(addConduitSuccess(conduit));
        dispatch(
          createSuccessNotification({
            message: 'Conduit successfully created',
          })
        );
        return conduit;
      },
      (error) => {
        dispatch(addConduitFailure(error));
        dispatch(
          createErrorNotification({
            message: 'Conduit addition failed',
          })
        );
        return error;
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
