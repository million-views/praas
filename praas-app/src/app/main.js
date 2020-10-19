import React from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

// NOTE:
// - do not import main.scss in this module
// - main.scss is an entry point and is inlined
// - main.scss should typically contain critical PRPL related css

import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

import configureStore from 'store';
import Home from './pages/home';
import Login from './pages/login';
import Signup from './pages/signup';
import Conduits from './pages/conduits';

// TODO:
// - clear alert on location change
// - figure out how to listen to history in react-router-6
export default function App(props) {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="conduits" element={<Conduits />} />
    </Routes>
  );
}

const Root = ({ store }) => (
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>
);

Root.propTypes = {
  store: PropTypes.object.isRequired
};

const store = configureStore(/* rehydration-data-goes-here */);
render(<Root store={store} />, document.getElementById('root'));
