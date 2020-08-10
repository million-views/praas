import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Field, Form, ErrorMessage } from 'formik';

import { Header, Alert } from 'components';
import { signup as signupSchema } from 'app/schema';
import { registerUser } from 'store/user/registration';

const initialValues = {
  user: {
    email: '',
    firstName: '',
    password: '',
  }
};

/* eslint react/prop-types: 0 */
function SignupForm(props) {
  const { status, dirty, isValid, isSubmitting } = props;
  let disabled = true;
  if (dirty && isValid && isSubmitting === false) {
    disabled = false;
  };

  return (
    <Form>
      <h2>Create your account</h2>
      {
        status && <Alert klass="alert-danger" message={status.errors} />
      }
      <div>
        <Field
          name="user.firstName" placeholder="First name" type="text"
          required
        />
        <ErrorMessage name="user.firstName" component="div" className="error" />
      </div>

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

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <>
      <Header forPage="signup" />
      <main className="page">
        <Formik
          initialValues={initialValues}
          validationSchema={signupSchema}
          onSubmit={(values, actions) => {
            const user = values.user;
            dispatch(registerUser({ user }, actions, navigate));
          }}
        >
          {
            (props) => <SignupForm {...props} />
          }
        </Formik>
      </main>
    </>
  );
};

export default Signup;
