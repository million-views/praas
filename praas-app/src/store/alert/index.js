// This is an alerting duck. A duck is a feature state container.
const ALERT_CLEAR = 'alert/CLEAR';
const ALERT_SUCCESS = 'alert/SUCCESS';
const ALERT_ERROR = 'alert/ERROR';

// Sync action creators
export const clear = () => ({
  type: ALERT_CLEAR
});

export const success = (message) => ({
  type: ALERT_SUCCESS, payload: message
});

export const error = (message) => ({
  type: ALERT_ERROR, payload: message
});

// Reducer
// note: klass is so named for it could be used to directly map to a css class
export default function alert(state = {}, { type, payload }) {
  switch (type) {
  case ALERT_CLEAR:
    return {};
  case ALERT_SUCCESS:
    return {
      klass: 'alert-success',
      message: payload.errors
    };
  case ALERT_ERROR:
    return {
      klass: 'alert-danger',
      message: payload.errors
    };
  default:
    return state;
  }
};
