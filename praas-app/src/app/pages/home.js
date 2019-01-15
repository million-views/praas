import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from '@reach/router';

import { Header } from 'components';

function home({ user, dispatch }) {
  // TODO: check login state and render the right component
  console.log('home.user: ', user);
  console.log('dispatch: ', dispatch);

  if (user) {
    return (
      <React.Fragment>
        <Header title="Conduits - pipe data to your storage" />
        <h2>A conduit is a handle to a RESTful service endpoint</h2>
      </React.Fragment>
    );
  } else {
    return <Redirect to="/login" />;
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
