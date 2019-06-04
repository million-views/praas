import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { Header } from 'components';
import Alert from 'components/alert';

import { registerUser } from 'store/user/registration';
import { logoutUser } from 'store/user/login';

const initialValues = {
  user: {
    email: '',
    firstName: '',
    password: '',
  }
};

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

const Signup = ({ user, dispatch }) => {
  return (
    <React.Fragment>
      <Header
        loggedIn={user.loggedIn}
        logout={() => dispatch(logoutUser())}
      />
      <main className="content">
        <Formik
          initialValues={initialValues}
          validationSchema={signupSchema}
          render={SignupForm}
          onSubmit={(values, actions) => {
            const user = values.user;
            dispatch(registerUser({ user }, actions));
          }}
        />
      </main>
    </React.Fragment>
  );
};

Signup.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = (state, _ownProps) => {
  return {
    user: state.user.login
  };
};

export default connect(mapStateToProps)(Signup);

function SignupForm(props) {
  const { isSubmitting, status } = props;
  return (
    <Form>
      <h2>Create your account</h2>
      {
        status && <Alert klass="alert-danger" message={status.errors} />
      }
      <div>
        <Field name="user.firstName" placeholder="First name" type="text" required />
        <ErrorMessage name="user.firstName" component="div" className="error" />
      </div>

      <div>
        <Field name="user.email" placeholder="Email - jane@test.com" type="email" required />
        <ErrorMessage name="user.email" component="div" className="error" />
      </div>

      <div>
        <Field name="user.password" placeholder="Password" type="password" required />
        <ErrorMessage name="user.password" component="div" className="error" />
      </div>

      <button disabled={isSubmitting === true}>Submit</button>
    </Form>
  );
};
