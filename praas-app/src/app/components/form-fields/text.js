import React from 'react';
import PropTypes from 'prop-types';
import { Input } from './input';

Text.propTypes = {
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
      <Text
        name="description"
        register={register}
        placeholder="A short note to remember"
        label="Description"
      />
    ...
  );
```
*/
export function Text(props) {
  return <Input type="text" {...props} />;
};

// TODO:
// - If there's a need for a TextArea, then add that in this module
