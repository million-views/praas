import React from 'react';
import { Router } from '@reach/router';
import { Provider } from 'react-redux';

import store from 'store';
import { Header } from 'components';

import Signup from './pages/signup';
import Login from './pages/login';
import List from 'components/conduit';

const App = () => (
  <Provider store={store}>
    <div>
      <Router>
        <Home path="/" />
        <Signup path="signup" />
        <Login path="login" />
      </Router>
    </div>
  </Provider>
);

const Home = () => (
  <div>
    <Header title="Conduits - pipe data to your storage" />
    <List />
  </div>
);

export default App;
