import React from 'react';
import PropTypes from 'prop-types';
import { Header, Login } from 'components';
import { loginUser, logoutUser } from 'store/user/login';
import { connect } from 'react-redux';

function login({ inflight, dispatch }) {
  return (
    <React.Fragment>
      <Header title="Conduits - Login" />
      <Login
        logoutUser={logoutUser}
        inflight={inflight}
        onSubmit={(email, password) => dispatch(loginUser(email, password))} />
    </React.Fragment>
  );
};

login.propTypes = {
  inflight: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = (state, _ownProps) => ({
  inflight: state.user.login.inflight
});

export default connect(mapStateToProps)(login);
