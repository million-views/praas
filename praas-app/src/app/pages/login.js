import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch /* , useSelector */ } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers';

import { Header, Alert } from 'components';
import { Input } from 'components/form-fields';
import { login as loginSchema } from 'app/schema';
import { loginUser } from 'store/user/login';

const initialValues = {
  user: {
    email: '',
    password: '',
  }
};

function Login(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [remoteErrors, setRemoteErrors] = useState({});

  const {
    register, handleSubmit, formState, errors, reset
  } = useForm({
    mode: 'all',
    resolver: yupResolver(loginSchema),
    defaultValues: initialValues
  });

  let disabled = true;
  if (formState.isDirty && formState.isValid && formState.isSubmitting === false) {
    disabled = false;
  };

  const onSubmit = async (data) => {
    const user = data.user;
    try {
      const result = await dispatch(loginUser({ user }));
      await reset(['email', 'password']);
      setRemoteErrors({});
      navigate('/', { state: result });
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2>Login to your account</h2>
          {
            serverErrors
          }
          <div>
            <Input
              type="email" register={register} errors={errors}
              name="user.email" placeholder="Email - jane@test.com" />
          </div>
          <div>
            <Input
              type="password" register={register} errors={errors}
              name="user.password" placeholder="Password" />
          </div>
          <button type="submit" disabled={disabled}>Submit</button>
        </form>
      </main>
    </>
  );
};

export default Login;
