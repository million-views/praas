import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers';

Form.propTypes = {
  defaultValues: PropTypes.object,
  validationSchema: PropTypes.object,
  onSubmit: PropTypes.func,
};

export default function Form(
  { defaultValues, validationSchema, children, onSubmit, ...rest }
) {
  const methods = useForm(
    { defaultValues, resolver: yupResolver(validationSchema) }
  );
  const { handleSubmit } = methods;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {React.Children.map(children, child => {
        let formifiedChild = child;
        if (child.props.name) {
          formifiedChild = React.createElement(child.type, {
            ...{
              ...child.props,
              register: methods.register,
              errors: methods.errors,
              key: child.props.name
            }
          });
        }
        return formifiedChild;
       })}
    </form>
  );
};
