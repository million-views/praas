import React from 'react';
import { connect } from 'react-redux';
import { Router, globalHistory } from '@reach/router';

import Home from './pages/home';
import Login from './pages/login';
import Signup from './pages/signup';

class App extends React.Component {
  constructor(props) {
    super(props);
    globalHistory.listen(({ location, action }) => {
      // TODO: clear alert on location change
      console.log({ location, action });
    });
  }

  render() {
    return (
      <React.Fragment>
        <Router>
          <Home path="/" />
          <Login path="login" />
          <Signup path="signup" />
        </Router >
      </React.Fragment>
    );
  }
}

export default connect()(App);
