import React from 'react';
import PropTypes from 'prop-types';
import { ErrorMessage } from './error-message';

Select.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
  register: PropTypes.func,
  placeholder: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape(
      {
        value: PropTypes.string.isRequired,
        label: PropTypes.string
      }
    ).isRequired
  ),
  multiple: PropTypes.bool,
  errors: PropTypes.object,
};

/***
Usage:
```code
  const supportedEndpoints = [
    {value: "googleSheets", label: "Google Sheets"},
    {value: "airtable", label: "Airtable"},
    {value: "email", label: "Email"}
  ];

  const { register, handleSubmit, errors } = useForm({
    mode: "onChange",
    defaultValues: {
      ...
      suriType: "googleSheets"
      ...
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
    ...
    <div>
      <span>Conduit backend service type</span>
      <div>
        <Select
          name="suriType" register={register}
          title="Select conduit type"
          options={supportedEndpoints} errors={errors} />
      </div>
    </div>
    ...
  );
```
*/
export function Select({
  name, title, register, placeholder,
  options = [], multiple = false, errors = {},
  ...rest
}) {
  return (
    <div>
      {title ? <h5>{title}</h5> : null}
      <select
        name={name} placeholder={placeholder}
        multiple={multiple}
        ref={register} {...rest}>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ErrorMessage name={name} errors={errors} />
    </div>
  );
};
