import React from 'react';
import PropTypes from 'prop-types';
import { Header, Signup } from 'components';
import { registerUser } from 'store/user/registration';
import { connect } from 'react-redux';

function signup({ inflight, dispatch }) {
  return (
    <React.Fragment>
      <Header title="Conduits - Sign up" />
      <Signup
        inflight={inflight}
        onSubmit={(data) => dispatch(registerUser(data))} />
    </React.Fragment>
  );
};

signup.propTypes = {
  inflight: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = (state, _ownProps) => ({
  inflight: state.user.registration.inflight
});

export default connect(mapStateToProps)(signup);
