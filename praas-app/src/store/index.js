import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

// import ducks (feature state containers)
import user from './user';
import conduit from './conduit';
import alert from './alert';

// root reducer
const reducers = combineReducers({
  alert,
  user,
  conduit,
});

const logger = (_store) => (next) => (action) => {
  if (typeof action !== 'function') {
    // console.log('dispatching:', action);
  }
  return next(action);
};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

/**
 * redux state shape (tree):
 * for each node in the tree there should be a reducer that knows
 * what do with an action; there is no requirement for a 1:1 action
 * to reducer map requirement! Only that all actions return
 * a new state given an action.type and payload.
 *
 * {
 *    user: {
 *      login: {inflight, loggedIn, firstName, lastName, email, token},
 *      registration: {inflight, firstName, lastName, email, passPhrase}
 *    },
 *    conduits: [array of conduits],
 *    ui: {alert: {klass, message}, ...}
 * }
 */
export default function configureStore(preloadedState) {
  return createStore(
    reducers, preloadedState, composeEnhancers(applyMiddleware(logger, thunk))
  );
}
