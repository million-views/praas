import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { Header } from 'components';
import Alert from 'components/alert';

import { loginUser, logoutUser } from 'store/user/login';

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

function LoginForm(props) {
  const { isSubmitting, status } = props;

  // clear stale data
  logoutUser();

  console.log('status here is:', status ? status.errors : 'nada');
  return (
    <Form>
      <h2>Login to your account</h2>
      {
        status && <Alert klass="alert-danger" message={status.errors} />
      }

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

function Login() {
  const user = useSelector(state => state.user.login);
  const dispatch = useDispatch();

  console.log('user: ', user);
  return (
    <>
      <Header
        loggedIn={user.loggedIn}
        logout={() => dispatch(logoutUser())}
      />
      <main className="page">
        <Formik
          initialValues={initialValues}
          validationSchema={loginSchema}
          render={LoginForm}
          onSubmit={(values, actions) => {
            const user = values.user;
            dispatch(loginUser({ user }, actions));
          }}
        />
      </main>
    </>
  );
};

export default Login;
