import * as Yup from 'yup';
import { conduitTypes } from '../options';

const conduitSchema = Yup.object().shape({
  suriApiKey: Yup.string().required('Api key is required'),
  suriType: Yup.string()
    .oneOf(
      conduitTypes.map((conduitType) => conduitType.value),
      'Invalid service type'
    )
    .required('Service type required'),
  suri: Yup.string().required('Service Endpoint uri is required'),
  allowlist: Yup.array()
    .of(
      Yup.object().shape({
        ip: Yup.string().required('IP Address Required'),
        comment: Yup.string().notRequired(),
        status: Yup.string().required('IP status required'),
      })
    )
    .min(0)
    .max(4),
  racm: Yup.object()
    .shape({
      GET: Yup.boolean(),
      POST: Yup.boolean(),
      PATCH: Yup.boolean(),
      DELETE: Yup.boolean(),
    })
    .test('customCheckboxTest', '', (racm) => {
      /* Can be extended later by iterating over the object keys */
      if (racm.GET || racm.POST || racm.PATCH || racm.DELETE) {
        return true;
      }
      return new Yup.ValidationError(
        'Select atleast on request method',
        null,
        'racm'
      );
    }),

  description: Yup.string().required('Description is required'),
});
export default conduitSchema;
