import PraasAPI from '../../api/praas';
import { DELETE_CONDUIT_SUCCESS } from './del';

// This is a list-conduit duck. A duck is a feature state container.

const LIST_CONDUIT_REQUEST = 'conduit/LIST_CONDUIT_REQUEST';
const LIST_CONDUIT_SUCCESS = 'conduit/LIST_CONDUIT_SUCCESS';
const LIST_CONDUIT_FAILURE = 'conduit/LIST_CONDUIT_FAILURE';

// Sync action creators
export const listConduitSuccess = (conduits) => ({
  type: LIST_CONDUIT_SUCCESS,
  payload: conduits,
});

export const listConduitFailure = (error) => ({
  type: LIST_CONDUIT_FAILURE,
  payload: error,
});

export const listConduits = () => {
  return (dispatch) => {
    dispatch({ type: LIST_CONDUIT_REQUEST });
    PraasAPI.conduit.list().then(
      (conduits) => {
        dispatch(listConduitSuccess(conduits));
      },
      (error) => {
        dispatch(listConduitFailure(error));
      }
    );
  };
};
const initialState = { inflight: false, conduits: [] };

export default function list(state = initialState, { type, payload }) {
  switch (type) {
    case LIST_CONDUIT_REQUEST:
      return {
        ...state,
        inflight: true,
      };
    case LIST_CONDUIT_SUCCESS:
      return {
        inflight: false,
        conduits: payload.conduits,
      };
    case DELETE_CONDUIT_SUCCESS:
      return {
        ...state,
        conduits: state.conduits.filter(
          (conduit) => conduit.id !== payload.conduitId
        ),
      };

    case LIST_CONDUIT_FAILURE:
      return {
        inflight: false,
        errors: { ...payload.errors },
      };
    default:
      return state;
  }
}
