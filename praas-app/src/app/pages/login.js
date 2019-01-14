import React from 'react';
// import PropTypes from 'prop-types';
import { Header } from 'components';
import { connect } from 'react-redux';

function login() {
  return (
    <React.Fragment>
      <Header title="Conduits - Login" />
      <h1>Login Page will be displayed here</h1>
    </React.Fragment>
  );
};

// login.propTypes = {
//   dispatch: PropTypes.func.isRequired
// };
export default connect()(login);
