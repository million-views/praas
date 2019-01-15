import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from '@reach/router';

import { Header } from 'components';
import ConduitList from 'components/conduit';

function home({ user }) {
  // TODO: check login state and render the right component
  if (user.loggedIn) {
    return (
      <React.Fragment>
        <Header title="Conduits - pipe data to your storage" />
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
