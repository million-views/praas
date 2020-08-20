import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers';

import { Header, Alert } from 'components';
import { Input, Form } from 'components/form-fields';
import { signup as signupSchema } from 'app/schema';
import { registerUser } from 'store/user/registration';

const initialValues = {
  user: {
    email: '',
    firstName: '',
    password: '',
  }
};

function Signup(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [remoteErrors, setRemoteErrors] = useState({});

  const methods = useForm({
    mode: 'all',
    resolver: yupResolver(signupSchema),
    defaultValues: initialValues
  });

  const onSubmit = async (data) => {
    const user = data.user;
    try {
      const result = await dispatch(registerUser({ user }));
      setRemoteErrors({});
      navigate('/login', { state: result });
    } catch (errors) {
      setRemoteErrors(errors);
    }
  };

  let serverErrors = null;
  if (remoteErrors && Object.keys(remoteErrors).length) {
    serverErrors = <Alert klass="alert-danger" message={remoteErrors} />;
  }

  return (
    <>
      <Header />
      <main className="page">
        <h2>Create your account</h2>

        <Form onSubmit={onSubmit} methods={methods}>
          {
            serverErrors
          }
          <Input
            wrapUsing="div" type="text"
            name="user.firstName" placeholder="First name" />
          <Input
            wrapUsing="div" type="email"
            name="user.email" placeholder="Email - jane@test.com" />
          <Input
            wrapUsing="div" type="password"
            name="user.password" placeholder="Password" />
          <button type="submit">Submit</button>
        </Form>
      </main>
    </>
  );
}

export default Signup;
