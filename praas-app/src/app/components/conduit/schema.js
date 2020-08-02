import * as Yup from 'yup';

const schema = Yup.object({
  suriApiKey: Yup.string().required('Service endpoint API key is required'),
  suriType: Yup.string().required('Service endpoint type is required'),
  suriObjectKey: Yup.string().required('Service endpoint object path is required'),
  racm: Yup.array()
    .of(Yup.string())
    .required('Request access control is required'),
  description: Yup.string().required('Description is required'),
  status: Yup.string().oneOf(['active', 'inactive']),
});

export default schema;
