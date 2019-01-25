const CREATE_DRAFT = 'conduit/CREATE_DRAFT';
const UPDATE_DRAFT = 'conduit/UPDATE_DRAFT';

// Sync action creators
export const createDraft = (conduit) => {
  return ({
    type: CREATE_DRAFT, payload: { ...conduit }
  });
};

export const updateDraft = (field, value) => ({
  type: UPDATE_DRAFT, payload: { field, value }
});

const defaultDraftConduit = () => {
  return {
    suriApiKey: '',
    suriType: '',
    suri: '',
    whitelist: '',
    racm: '',
    description: '',
  };
};

export default function create(state = defaultDraftConduit(), { type, payload }) {
  switch (type) {
    case CREATE_DRAFT:
      if (payload) {
        return {
          ...state,
          ...payload
        };
      } else {
        return defaultDraftConduit();
      }
    case UPDATE_DRAFT:
      return {
        ...state,
        [payload.field]: payload.value,
      };
    default:
      return state;
  };
};
