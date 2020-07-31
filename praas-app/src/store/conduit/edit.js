// import { navigate } from '@reach/router';
import PraasAPI from 'api/praas';

// This is a create-conduit duck. A duck is a feature state container.

const UPDATE_CONDUIT_REQUEST = 'conduit/UPDATE_CONDUIT_REQUEST';
const UPDATE_CONDUIT_SUCCESS = 'conduit/UPDATE_CONDUIT_SUCCESS';
const UPDATE_CONDUIT_FAILURE = 'conduit/UPDATE_CONDUIT_FAILURE';

// Sync action creators
export const updateConduitSuccess = (payload) => ({
  type: UPDATE_CONDUIT_SUCCESS, payload
});

export const updateConduitFailure = (error) => ({
  type: UPDATE_CONDUIT_FAILURE, payload: error
});

export const updateConduit = (conduit, actions, changeView) => {
  return (dispatch) => {
    dispatch({ type: UPDATE_CONDUIT_REQUEST, payload: conduit });
    PraasAPI.conduit.update(conduit).then(
      (payload) => {
        console.log('updateConduit, successs: ', payload.conduit.id);
        actions.setSubmitting(false);
        dispatch(updateConduitSuccess(payload));
        changeView('list', 'refresh', payload.conduit.id, 'store/list');
      },
      (error) => {
        actions.setSubmitting(false);
        actions.setStatus({ errors: { ...error.errors } });
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
        ...payload.conduit
      };
    case UPDATE_CONDUIT_SUCCESS:
      return {
        inflight: false,
        ...payload.conduit,
      };
    case UPDATE_CONDUIT_FAILURE:
      console.log('Deal with this:', payload);
      return {
        inflight: false,
        errors: { ...payload.errors }
      };
    default:
      return state;
  };
};

// selector
export const getConduit
  = (state, cid) => state.conduit.list.conduits.find((conduit) => conduit.id === cid);
