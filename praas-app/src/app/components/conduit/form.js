import React from 'react';

const ConduitForm = (props) => {
  //  const { isSubmitting, status } = props;
  //  const classes = cs(['submit', {'spinner': isSubmitting}]);

  return (
    <h2>Create a new conduit</h2>
  );
};

export default ConduitForm;

// function SignupForm(props) {
//   const { isSubmitting, status } = props;
//   const classes = cx(['submit', { 'spinner': isSubmitting }]);
//   return (
//     <Form className={style.signup}>
//       <h2 className={style.header}>Create your account</h2>
//       {
//         status && <Alert klass="alert-danger" message={status.errors} />
//       }
//       <Field name="user.firstName" placeholder="First name" type="text" required />
//       <ErrorMessage name="user.firstName" component="div" className="error" />

//       <Field name="user.email" placeholder="Email - jane@test.com" type="email" required />
//       <ErrorMessage name="user.email" component="div" className="error" />

//       <Field name="user.password" placeholder="Password" type="password" required />
//       <ErrorMessage name="user.password" component="div" className="error" />

//       <button type="submit" disabled={isSubmitting === true} className={classes}>Submit</button>
//     </Form>
//   );
// };
