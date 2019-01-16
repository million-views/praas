import React from 'react';
import { connect } from 'react-redux';
import { Link } from '@reach/router';
import PropTypes from 'prop-types';

import { cx } from 'tiny';

import style from './login.scss';

import Alert from 'components/alert';

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
    const { alert, inflight } = this.props;
    const { submitted, email, password } = this.state;
    const classes = cx(['submit', { 'spinner': inflight }]);
    return (
      <div>
        <form noValidate onSubmit={this.handleSubmit} className={style.login}>
          <h2 className={style.header}>Login to Conduit</h2>
          <Alert klass={alert.klass} message={alert.message} />

          <input onChange={this.handleChange}
            type="text" name="email"
            placeholder="email" required />
          {submitted && !email && <div className="error">Email is required</div>}
          <input onChange={this.handleChange}
            type="password" name="password"
            placeholder="password" required />
          {submitted && !password && <div className="error">Password is required</div>}
          <button type="submit" className={classes}>Login</button>
          <Link to="/signup" className="cancel">Sign up</Link>
        </form>
      </div>
    );
  };
};

const mapStateToProps = (state, _ownProps) => ({
  alert: state.alert
});

Login.propTypes = {
  alert: PropTypes.object.isRequired,
  logoutUser: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  inflight: PropTypes.bool.isRequired
};

export default connect(mapStateToProps)(Login);
