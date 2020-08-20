import React from 'react';
import PropTypes from 'prop-types';
import { ErrorMessage } from './error-message';

Input.propTypes = {
  wrapUsing: PropTypes.string,
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
        wrapUsing="div"
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
  { wrapUsing, type, name, register, placeholder, label, errors = {}, ...rest }
) {
  const WrapTag = wrapUsing || React.Fragment;
  return (
    <WrapTag>
      <label>
        {Boolean(label) && <span>{label}</span>}
        <input
          type={type} name={name} placeholder={placeholder}
          ref={register} {...rest} />
      </label>
      <ErrorMessage name={name} errors={errors} />
    </WrapTag>
  );
};
