import React from 'react';
import PropTypes from 'prop-types';
import { ErrorMessage } from './error-message';

Checkbox.propTypes = {
  name: PropTypes.string.isRequired,
  register: PropTypes.func,
  value: PropTypes.string,
  label: PropTypes.string.isRequired,
};
/***
Usage:
  <Checkbox
    name="racm"
    register={register}
    label="List"
    value="get"
  />
*/
export function Checkbox({ name, register, value, label, ...rest }) {
  return (
    <label>
      <input
        type="checkbox" name={name} defaultValue={value}
        ref={register} {...rest} />
      {Boolean(label) && <span className="checkable">{label}</span>}
    </label>
  );
};

CheckboxGroup.propTypes = {
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
  const accessControl = [
    {name: 'get', value: 'get', label: 'List'},
    {name: 'post', value: 'post', label: 'Add'},
    {name: 'put', value: 'put', label: 'Update'},
    {name: 'delete', value: 'delete', label: 'Delete'},
  ];

  const { register, handleSubmit } = useForm({
    mode: "onChange",
    defaultValues: {
      ...
      racm: ["get", "put"],
      ...
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
    ...
      <CheckboxGroup
        name="racm" title="Allowed Operations:"
        options={accessControl} errors={errors} />
    ...
  );
```
*/

export function CheckboxGroup(
  { name, title, register, options = [], errors = {}, ...rest }
) {
  return (
    <div>
      {title ? <h5>{title}</h5> : null}
      <span>
        {options.map((option) => {
          return (
            <Checkbox
              key={option.value}
              name={name}
              register={register}
              label={option.label}
              value={option.value} {...rest} />
          );
        })}
      </span>
      <ErrorMessage name={name} errors={errors} inline />
    </div>
  );
};
