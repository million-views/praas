// import { navigate } from '@reach/router';
import PraasAPI from 'api/praas';

// This is a create-conduit duck. A duck is a feature state container.

const LIST_CONDUIT_REQUEST = 'conduit/LIST_CONDUIT_REQUEST';
const LIST_CONDUIT_SUCCESS = 'conduit/LIST_CONDUIT_SUCCESS';
const LIST_CONDUIT_FAILURE = 'conduit/LIST_CONDUIT_FAILURE';

// Sync action creators
export const listConduitSuccess = (conduit) => ({
  type: LIST_CONDUIT_SUCCESS, payload: conduit
});

export const listConduitFailure = (error) => ({
  type: LIST_CONDUIT_FAILURE, payload: error
});

export const listConduits = (userId) => {
  console.log('in list Conduit');
  return (dispatch) => {
    dispatch({ type: LIST_CONDUIT_REQUEST, payload: userId });
    PraasAPI.conduit.list(userId).then(
      (conduit) => {
        // changeMode('list');
        dispatch(listConduitSuccess(conduit));
        // actions.setSubmitting(false);
      },
      (error) => {
        dispatch(listConduitFailure(error));
        // actions.setSubmitting(false);
        // actions.setStatus({ errors: { ...error.errors } });
      }
    );
  };
};
const initialState = { inflight: false, conduits: [{}] };

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
        conduits: payload.conduit,
      };
    case LIST_CONDUIT_FAILURE:
      console.log('Deal with this:', payload);
      return {
        inflight: false,
        errors: { ...payload.errors }
      };
    default:
      return state;
  };
};
