import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers';

import { Header, Alert } from 'components';
import { Input } from 'components/form-fields';
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

  const {
    register, handleSubmit, formState, errors
  } = useForm({
    mode: 'all',
    resolver: yupResolver(signupSchema),
    defaultValues: initialValues
  });

  let disabled = true;
  if (formState.isDirty && formState.isValid && formState.isSubmitting === false) {
    disabled = false;
  };

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
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2>Create your account</h2>
          {
            serverErrors
          }
          <div>
            <Input
              type="text" register={register} errors={errors}
              name="user.firstName" placeholder="First name" />
          </div>
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
}

export default Signup;
