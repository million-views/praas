import React from 'react';
import PropTypes from 'prop-types';
import { ErrorMessage } from './error-message';

Radio.propTypes = {
  name: PropTypes.string.isRequired,
  register: PropTypes.func,
  value: PropTypes.string,
  label: PropTypes.string,
};
/***
Usage:
  <Radio
    name="racm"
    register={register}
    value="get"
    label="List"
  />
*/

export function Radio({ name, register, value, label, ...rest }) {
  return (
    <label>
      <input
        type="radio" name={name} defaultValue={value}
        ref={register} {...rest} />
      {Boolean(label) && <span className="checkable">{label}</span>}
    </label>
  );
};

RadioGroup.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
  register: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape(
      {
        name: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        label: PropTypes.string,
      }
    ).isRequired
  ),
  errors: PropTypes.object,
};
/***
Usage:
```code
  const status = [
    {name: 'active', value: 'active', label: 'Active'},
    {name: 'inactive', value: 'inactive', label: 'Inactive'},
  ];

  const { register, handleSubmit } = useForm({
    mode: "onChange",
    defaultValues: {
      ...
      status: "inactive",
      ...
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
    ...
      <RadioGroup
        name="status" title="Conduit status:"
        options={status} errors={errors} />
    ...
  );
```
*/

export function RadioGroup(
  { name, title, register, options = [], errors = {}, ...rest }
) {
  return (
    <div>
      {title ? <h5>{title}</h5> : null}
      <span>
        {options.map((option) => {
          return (
            <Radio
              key={option.value}
              name={name} register={register}
              value={option.value} label={option.label} {...rest} />
          );
        })}
      </span>
      <ErrorMessage name={name} errors={errors} />
    </div>
  );
};
