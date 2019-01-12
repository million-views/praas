import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

// import ducks (feature state containers)
import { user } from './user';

// root reducer
const reducers = combineReducers({
  user
});

const logger = (_store) => (next) => (action) => {
  if (typeof action !== 'function') {
    console.log('dispatching:', action);
  }
  return next(action);
};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default createStore(
  reducers,
  composeEnhancers(applyMiddleware(logger, thunk))
);
