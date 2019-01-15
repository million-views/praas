import React from 'react';
import PropTypes from 'prop-types';
// import { navigate } from '@reach/router';

import { cx } from 'tiny';

import style from './signup.scss';

class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitted: false,
      user: {
        firstName: '', email: '', password: ''
      }
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  };

  handleChange(event) {
    const { name, value } = event.target;
    const { user } = this.state;
    this.setState({
      user: {
        ...user,
        [name]: value
      }
    });
  };

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ submitted: true });
    const { user } = this.state;

    if (user.firstName && user.password) {
      this.props.onSubmit({ user });
    }
  }

  render() {
    const { inflight } = this.props.registration;
    // const { user, submitted } = this.state;
    const classes = cx([style['signup-button'], { 'spinner': inflight }]);
    return (
      <div>
        <h2>Sign up</h2>
        <form onSubmit={this.handleSubmit} className={style.signup}>
          <input onChange={this.handleChange}
            type="text" name="firstName"
            placeholder="first name" required />
          <input onChange={this.handleChange}
            type="text" name="email"
            placeholder="email" required />
          <input onChange={this.handleChange}
            type="password" name="password"
            placeholder="password" required />
          <button type="submit" className={classes} >Sign up</button>
        </form>
      </div>
    );
  };
};

Signup.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  registration: PropTypes.object.isRequired
};

export default Signup;
