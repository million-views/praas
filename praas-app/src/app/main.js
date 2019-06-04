import React from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

// NOTE:
// - do not import main.scss in this module
// - main.scss is an entry point and is inlined
// - main.scss should typically contain critical PRPL related css

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
