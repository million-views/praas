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
export function Checkbox({ name, register, value, label }) {
  return (
    <label>
      <input
        type="checkbox" name={name} defaultValue={value}
        ref={register} />
      {Boolean(label) && <span className="checkable">{label}</span>}
    </label>
  );
};

CheckboxGroup.propTypes = {
  name: PropTypes.string.isRequired,
  register: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape(
        {
          value: PropTypes.string.isRequired,
          label: PropTypes.string,
        }
      ).isRequired
    )
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
      <div>
        <span>Conduit allowed operations</span>
        <div>
          <span>
            <CheckboxGroup
              name="racm" register={register}
              options={accessControl} errors={errors} />
          </span>
        </div>
      </div>
    ...
  );
```
*/

export function CheckboxGroup(
  { name, register, options = [], errors = {} }
) {
  return (
    <>
      {options.map((option) => {
        return (
          <Checkbox
            key={option.value}
            name={name}
            register={register}
            label={option.label}
            value={option.value} />
        );
      })}
      <ErrorMessage name={name} errors={errors} />
    </>
  );
};
