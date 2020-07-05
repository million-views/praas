import * as Yup from 'yup';

const signinSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(2, 'Must be longer than 8 characters')
    .required('Passphrase is required'),
});

export default signinSchema;
