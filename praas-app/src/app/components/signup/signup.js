import React from 'react';
import PropTypes from 'prop-types';
import { navigate } from '@reach/router';

import style from './signup.scss';

class Signup extends React.Component {
  constructor() {
    super();
    this.submitForm = (e) => {
      e.preventDefault();
      const firstName = e.target.firstName.value;
      const email = e.target.email.value;
      const password = e.target.password.value;
      this.props.onSubmit({ user: { firstName, email, password } });
      // this.props.history.push('/login');
      console.log('before redirect');
      navigate('/login');
    };
  }

  render() {
    return (
      <div>
        <h2>Sign up</h2>
        <form onSubmit={this.submitForm} className={style.signup}>
          <input type="text" name="firstName" placeholder="first name" />
          <input type="text" name="email" placeholder="email" />
          <input type="password" name="password" placeholder="password" />
          <button type="submit" className={style['signup-button']} >Sign up</button>
        </form>
      </div>
    );
  };
};

Signup.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default Signup;
