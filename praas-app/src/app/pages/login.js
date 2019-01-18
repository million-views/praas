import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { Header } from 'components';
import Alert from 'components/alert';

import { loginUser, logoutUser } from 'store/user/login';

import { cx } from 'tiny';
import style from './login.scss';

const initialValues = {
  user: {
    email: '',
    password: '',
  }
};

/* eslint react/prop-types: 0 */
const loginSchema = Yup.object({
  user: Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(2, 'Must be longer than 8 characters')
      .required('Passphrase is required'),
  })
});

const Login = ({ user, dispatch }) => {
  console.log('user: ', user);
  return (
    <React.Fragment>
      <Header
        loggedIn={user.loggedIn}
        logout={() => dispatch(logoutUser())}
        title="Conduits - Login"
      />
      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        render={LoginForm}
        onSubmit={(values, actions) => {
          const user = values.user;
          dispatch(loginUser({ user }, actions));
        }}
      />
    </React.Fragment>
  );
};

Login.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = (state, _ownProps) => {
  return {
    user: state.user.login
  };
};

export default connect(mapStateToProps)(Login);

function LoginForm(props) {
  const { isSubmitting, status } = props;

  // clear stale data
  logoutUser();

  // console.log('status here is:', status ? status.errors : 'nada');
  const classes = cx(['submit', { 'spinner': isSubmitting }]);
  return (
    <Form className={style.login}>
      <h2 className={style.header}>Login to your account</h2>
      {
        status && <Alert klass="alert-danger" message={status.errors} />
      }

      <Field name="user.email" placeholder="Email - jane@test.com" type="email" required />
      <ErrorMessage name="user.email" component="div" className="error" />

      <Field name="user.password" placeholder="Password" type="password" required />
      <ErrorMessage name="user.password" component="div" className="error" />

      <button type="submit" disabled={isSubmitting === true} className={classes}>Submit</button>
    </Form>
  );
};
