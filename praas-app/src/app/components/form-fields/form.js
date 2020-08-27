import React from 'react';
import PropTypes from 'prop-types';

import { Alert } from 'components';

Form.propTypes = {
  methods: PropTypes.object,
  onSubmit: PropTypes.func,
  errors: PropTypes.object
};

/*
A thin wrapper to ease the requirement of having to pass `register` and
`errors` props to `input` elements of a form.

Usage:
const {formState, ...methods } = useForm(...);
const onSubmit = (data) => console.log(data);

let disabled = true;
if (formState.isDirty && formState.isValid && formState.isSubmitting === false) {
  disabled = false;
};

<Form onSubmit={onSubmit} methods={methods}>
  ...
  <div>
    <Input
      type="password"
      name="user.password" placeholder="Password" />
  </div>
  <button type="submit" disabled={disabled}>Submit</button>
</Form>

NOTE:
- works only on those input elements that have a name attribute
- handles only level 1 children; won't work if `input` fields
  are nested in other elements inside the form.
*/
export function Form({ methods, children, onSubmit, errors = {}, ...rest }) {
  const { handleSubmit, formState } = methods;

  let disabled = true;

  // console.log(
  //   'formStat(isDirty, isValid, isSubmitting): ',
  //   formState.isDirty, formState.isValid, formState.isSubmitting
  // );

  if (formState.isDirty && formState.isValid && formState.isSubmitting === false) {
    disabled = false;
  };

  let afterSubmitErrors = null;
  if (errors && Object.keys(errors).length) {
    afterSubmitErrors = <Alert klass="alert-danger" message={errors} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {
        afterSubmitErrors
      }
      {
        React.Children.map(children, child => {
          let formifiedChild = child;
          // console.log('formifiedChild', child);
          if (child?.props?.name) {
            formifiedChild = React.createElement(child.type, {
              ...{
                ...child.props,
                register: methods.register,
                errors: methods.errors,
                key: child.props.name
              }
            });
          }

          // add enable/disable state logic
          if (child?.props?.type === 'submit') {
            // console.log('found submit, adding state...');
            formifiedChild = React.createElement(child.type, {
              ...{
                ...child.props,
                key: child.props.name,
                disabled
              }
            });
          }

          return formifiedChild;
        })
      }
    </form>
  );
};
