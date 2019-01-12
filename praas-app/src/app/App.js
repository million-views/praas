import React from 'react';
import { Router } from '@reach/router';
import { Provider } from 'react-redux';

import store from 'store';
import { Header } from 'components';

import Signup from './pages/signup';

const App = () => (
  <Provider store={store}>
    <div>
      <Router>
        <Home path="/" />
        <Signup path="signup" />
      </Router>
    </div>
  </Provider>
);

const Home = () => (
  <div>
    <Header title="Conduits - pipe data to your storage" />
    <h2>A conduit is a handle to a RESTful service endpoint</h2>
  </div>
);

export default App;
