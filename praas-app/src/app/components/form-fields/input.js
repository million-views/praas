import React from 'react';
import PropTypes from 'prop-types';
import { ErrorMessage } from './error-message';

Input.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  register: PropTypes.func,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  errors: PropTypes.object,
};
/***
Usage:
```code

  const { register, handleSubmit } = useForm({
    mode: "onChange",
    defaultValues: {
      ...
      ...
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
    ...
      <Input
        type="email|password|text|..."
        name="description"
        register={register}
        placeholder="A short note to remember"
        label="Description"
      />
    ...
  );
```
*/
export function Input(
  { type, name, register, placeholder, label, errors = {}, ...rest }
) {
  return (
    <>
      <label>
        {Boolean(label) && <span>{label}</span>}
        <input
          type={type} name={name} placeholder={placeholder}
          ref={register} {...rest} />
      </label>
      <ErrorMessage name={name} errors={errors} />
    </>
  );
};
