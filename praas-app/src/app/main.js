import React from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

// import main css file to get processed by sass and webpack
import './main.scss';

import configureStore from 'store';
import App from './App.js';

const Root = ({ store }) => (
  <Provider store={store}>
    <App />
  </Provider>
);

Root.propTypes = {
  store: PropTypes.object.isRequired
};

const store = configureStore(/* rehydration-data-goes-here */);
render(<Root store={store} />, document.getElementById('root'));
