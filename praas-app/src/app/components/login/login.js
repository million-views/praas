import React from 'react';
import { Link } from '@reach/router';
import PropTypes from 'prop-types';

import { cx } from 'tiny';

import style from './login.scss';

class Login extends React.Component {
  constructor(props) {
    super(props);

    // clear any previous state related to login
    this.props.logoutUser();

    this.state = {
      submitted: false,
      email: '', password: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  };

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ submitted: true });
    const { email, password } = this.state;

    if (email && password) {
      this.props.onSubmit(email, password);
    }
  }

  render() {
    const { inflight } = this.props;
    // const { user, submitted } = this.state;
    const classes = cx(['submit', { 'spinner': inflight }]);
    return (
      <div>
        <h2>Login</h2>
        <form onSubmit={this.handleSubmit} className={style.login}>
          <input onChange={this.handleChange}
            type="text" name="email"
            placeholder="email" required />
          <input onChange={this.handleChange}
            type="password" name="password"
            placeholder="password" required />
          <button type="submit" className={classes}>Login</button>
          <Link to="/signup" className={style.cancelBtn}>Sign up</Link>
        </form>
      </div>
    );
  };
};

Login.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  inflight: PropTypes.bool.isRequired
};

export default Login;
