import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from '@reach/router';

import { Header } from 'components';
import ConduitList from 'components/conduit';

import { logoutUser } from 'store/user/login';

function home({ user, dispatch }) {
  if (user.loggedIn) {
    return (
      <React.Fragment>
        <Header
          loggedIn={user.loggedIn}
          logout={() => dispatch(logoutUser())}
          title="Conduits - Pipe data in and out of your storage"
        />
        <ConduitList />
      </React.Fragment>
    );
  } else {
    return <Redirect to="login" noThrow />;
  }
};

home.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = (state, _ownProps) => {
  return {
    user: state.user.login
  };
};

export default connect(mapStateToProps)(home);
