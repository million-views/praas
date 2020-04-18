import * as Yup from 'yup';

const signupSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'Must be longer than 2 characters')
    .max(20, 'Nice try, nobody has a first name that long')
    .required("Don't be shy. Tell us your first name"),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Must be longer than 8 characters')
    .required('Passphrase is required'),
});

export default signupSchema;
