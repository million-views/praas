// This is an alerting duck. A duck is a feature state container.
const NOTIFICATION_CLEAR = 'notification/CLEAR';
const NOTIFICATION_SUCCESS = 'notification/SUCCESS';
const NOTIFICATION_WARNING = 'notification/WARNING';
const NOTIFICATION_ERROR = 'notification/ERROR';

type NotificationPayload = {
  message: String;
  duration?: Number;
};

// Sync action creators
export const clearNotification = () => ({
  type: NOTIFICATION_CLEAR,
});

export const createSuccessNotification = (payload: NotificationPayload) => {
  return {
    type: NOTIFICATION_SUCCESS,
    payload,
  };
};

export const createWarningNotification = (payload: NotificationPayload) => ({
  type: NOTIFICATION_WARNING,
  payload,
});

export const createErrorNotification = (payload: NotificationPayload) => ({
  type: NOTIFICATION_ERROR,
  payload,
});

// Reducer
export default function notification(
  state = {},
  { type, payload }: { type: string; payload: NotificationPayload }
) {
  switch (type) {
    case NOTIFICATION_CLEAR:
      return {};
    case NOTIFICATION_SUCCESS:
      return {
        type: 'success',
        data: payload,
      };
    case NOTIFICATION_WARNING:
      return {
        type: 'warning',
        data: payload,
      };
    case NOTIFICATION_ERROR:
      return {
        type: 'danger',
        data: payload,
      };
    default:
      return state;
  }
}
