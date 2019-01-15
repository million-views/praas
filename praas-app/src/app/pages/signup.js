import React from 'react';
import PropTypes from 'prop-types';
import { Header, Signup } from 'components';
import { registerUser } from 'store/user/registration';
import { connect } from 'react-redux';

function signup({ registration, dispatch }) {
  console.log('registration', registration);
  return (
    <React.Fragment>
      <Header title="Conduits - Sign up" />
      <Signup registration={registration} onSubmit={(data) => dispatch(registerUser(data))} />
    </React.Fragment>
  );
};

signup.propTypes = {
  registration: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = (state, _ownProps) => ({
  registration: state.user.registration
});

export default connect(mapStateToProps)(signup);
