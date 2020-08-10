import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Field, Form, ErrorMessage } from 'formik';

import { Header, Alert } from 'components';
import { login as loginSchema } from 'app/schema';
import { loginUser, logoutUser } from 'store/user/login';

const initialValues = {
  user: {
    email: '',
    password: '',
  }
};

/* eslint react/prop-types: 0 */
function LoginForm(props) {
  const { status, dirty, isValid, isSubmitting } = props;

  // clear stale data
  logoutUser();

  let disabled = true;
  if (dirty && isValid && isSubmitting === false) {
    disabled = false;
  };

  return (
    <Form>
      <h2>Login to your account</h2>
      {
        status && <Alert klass="alert-danger" message={status.errors} />
      }

      <div>
        <Field
          name="user.email" placeholder="Email - jane@test.com" type="email"
          required
        />
        <ErrorMessage name="user.email" component="div" className="error" />
      </div>
      <div>
        <Field
          name="user.password" placeholder="Password" type="password"
          required
        />
        <ErrorMessage name="user.password" component="div" className="error" />
      </div>
      <button type="submit" disabled={disabled}>Submit</button>
    </Form>
  );
};

function Login() {
  const user = useSelector(state => state.user.login);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
          onSubmit={(values, actions) => {
            const user = values.user;
            dispatch(loginUser({ user }, actions, navigate));
          }}
        >
          {(props) => <LoginForm {...props} />}
        </Formik>
      </main>
    </>
  );
};

export default Login;
