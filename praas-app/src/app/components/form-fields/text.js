import React from 'react';
import { Input } from './input';

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
        title="Note to self"
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
