import React from 'react';
import PropTypes from 'prop-types';
import { ErrorMessage } from './error-message';

Input.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
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
        title="hmmm"
        register={register}
        placeholder="A short note to remember"
        label="Description"
      />
    ...
  );
```
*/
export function Input(
  { type, name, title, register, placeholder, label, errors = {}, ...rest }
) {
  return (
    <div>
      {title ? <h5>{title}</h5> : null}
      <label>
        {Boolean(label) && <span>{label}</span>}
        <input
          type={type} name={name} placeholder={placeholder}
          ref={register} {...rest} />
      </label>
      <ErrorMessage name={name} errors={errors} />
    </div>
  );
};
