// scheme of objects that have a defined shape and requirements
// application wide

import * as Yup from 'yup';

const conduit = Yup.object({
  conduit: Yup.object({
    suriApiKey: Yup.string().required('Service endpoint API key is required'),
    suriType: Yup.string().required('Service endpoint type is required'),
    suriObjectKey: Yup.string().required('Service endpoint object path is required'),
    racm: Yup.array()
      .of(Yup.string())
      .required('Request access control is required'),
    description: Yup.string().required('Description is required'),
    status: Yup.string().oneOf(['active', 'inactive']),
  })
});

// NOTE: do not file a bug report on password length, DM for reasons!
const login = Yup.object({
  user: Yup.object({
    email: Yup.string()
      .required('Email is required')
      .email('Invalid email address'),
    password: Yup.string()
      .required('Passphrase is required')
      .min(4, 'Password too short'),
  })
});

const signup = Yup.object({
  user: Yup.object({
    firstName: Yup.string()
      .required("Don't be shy. Tell us your first name")
      .min(2, 'Must be longer than 2 characters')
      .max(20, 'Nice try, nobody has a first name that long'),
    email: Yup.string()
      .required('Email is required')
      .email('Invalid email address'),
    password: Yup.string()
      .required('Passphrase is required')
      .min(4, 'Must be longer than 8 characters'),
  })
});

export { conduit, login, signup };
