import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers';

import { Header } from 'components';
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

  return (
    <>
      <Header />
      <main className="page">
        <h2>Create your account</h2>
        <Form onSubmit={onSubmit} methods={methods} errors={remoteErrors}>
          <Input
            type="text" name="user.firstName" placeholder="First name" />
          <Input
            type="email" name="user.email" placeholder="Email - jane@test.com" />
          <Input
            type="password" name="user.password" placeholder="Password" />
          <button type="submit">Submit</button>
        </Form>
      </main>
    </>
  );
}

export default Signup;
