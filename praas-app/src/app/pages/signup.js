import React from 'react';
import PropTypes from 'prop-types';
import { Header, Signup } from 'components';
import { registerUser } from 'store/user';
import { connect } from 'react-redux';

function signup({ dispatch }) {
  return (
    <React.Fragment>
      <Header title="Conduits - Sign up" />
      <Signup onSubmit={(data) => dispatch(registerUser(data))} />
    </React.Fragment>
  );
};

signup.propTypes = {
  dispatch: PropTypes.func.isRequired
};
export default connect()(signup);
