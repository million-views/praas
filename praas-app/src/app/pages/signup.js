import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { cx } from 'tiny';

import { registerUser } from 'store/user/registration';
import { Header } from 'components';
import Alert from 'components/alert';
import style from './signup.scss';

/* eslint react/prop-types: 0 */
const signupSchema = Yup.object({
  user: Yup.object({
    firstName: Yup.string()
      .min(2, 'Must be longer than 2 characters')
      .max(20, 'Nice try, nobody has a first name that long')
      .required("Don't be shy. Tell us your first name"),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(2, 'Must be longer than 8 characters')
      .required('Passphrase is required'),
  })
});

const initialValues = {
  user: {
    email: '',
    firstName: '',
    password: '',
  }
};

const Signup = ({ dispatch }) => {
  return (
    <React.Fragment>
      <Header title="Conduits - Sign up" />
      <Formik
        initialValues={initialValues}
        validationSchema={signupSchema}
        onSubmit={(values, actions) => {
          const user = values.user;
          dispatch(registerUser({ user }, actions));
        }}
        render={SignupForm}
      />
    </React.Fragment>
  );
};

Signup.propTypes = {
  dispatch: PropTypes.func.isRequired
};

export default connect()(Signup);

function SignupForm(props) {
  const { isSubmitting, status } = props;
  console.log('status here is:', status ? status.errors : 'nada');
  const classes = cx(['submit', { 'spinner': isSubmitting }]);
  return (
    <Form className={style.signup}>
      <h2 className={style.header}>Create your account</h2>
      {
        status && <Alert klass="alert-danger" message={status.errors} />
      }
      <Field name="user.firstName" placeholder="First name" type="text" required />
      <ErrorMessage name="user.firstName" component="div" className="error" />

      <Field name="user.email" placeholder="Email - jane@test.com" type="email" required />
      <ErrorMessage name="user.email" component="div" className="error" />

      <Field name="user.password" placeholder="Password" type="password" required />
      <ErrorMessage name="user.password" component="div" className="error" />

      <button type="submit" disabled={isSubmitting === true} className={classes}>Submit</button>
    </Form>
  );
};
