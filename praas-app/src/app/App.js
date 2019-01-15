import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Router, globalHistory } from '@reach/router';

import Home from './pages/home';
import Login from './pages/login';
import Signup from './pages/signup';

import * as alertActions from 'store/alert';

class App extends React.Component {
  constructor(props) {
    super(props);

    const { dispatch } = this.props;
    globalHistory.listen(({ location, action }) => {
      // TODO: clear alert on location change
      console.log({ location, action });
      dispatch(alertActions.clear());
    });
  }

  render() {
    const { alert } = this.props;
    const flash = alert.message
      ? <div className={`${alert.klass}`}>{alert.message}</div>
      : <div />;

    return (
      <React.Fragment>
        {flash}
        <Router>
          <Home path="/" />
          <Login path="login" />
          <Signup path="signup" />
        </Router >
      </React.Fragment>
    );
  }
}

App.propTypes = {
  dispatch: PropTypes.func.isRequired,
  alert: PropTypes.object.isRequired
};

const mapStateToProps = (state, _ownProps) => ({
  alert: state.alert
});

export default connect(mapStateToProps)(App);
