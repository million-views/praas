// This is an alerting duck. A duck is a feature state container.
const NOTIFICATION_CLEAR = 'notification/CLEAR';
const NOTIFICATION_SUCCESS = 'notification/SUCCESS';
const NOTIFICATION_WARNING = 'notification/WARNING';
const NOTIFICATION_ERROR = 'notification/ERROR';

// Sync action creators
export const clearNotification = () => ({
  type: NOTIFICATION_CLEAR,
});

export const createSuccessNotification = (message) => {
  return {
    type: NOTIFICATION_SUCCESS,
    payload: message,
  };
};

export const createWarningNotification = (message) => ({
  type: NOTIFICATION_WARNING,
  payload: message,
});

export const createErrorNotification = (message) => ({
  type: NOTIFICATION_ERROR,
  payload: message,
});

// Reducer
export default function notification(state = {}, { type, payload }) {
  switch (type) {
    case NOTIFICATION_CLEAR:
      return {};
    case NOTIFICATION_SUCCESS:
      return {
        type: 'success',
        message: payload,
      };
    case NOTIFICATION_WARNING:
      return {
        type: 'warning',
        message: payload,
      };
    case NOTIFICATION_ERROR:
      return {
        type: 'danger',
        message: payload,
      };
    default:
      return state;
  }
}
