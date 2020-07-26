import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { Formik } from 'formik';

import ConduitForm from './form';

import { addConduit } from 'store/conduit/create';

const conduitSchema = Yup.object({
  suriApiKey: Yup.string().required('Service endpoint API key is required'),
  suriType: Yup.string().required('Service endpoint type is required'),
  suri: Yup.string().required('Service endpoint uri is required'),
  racm: Yup.array()
    .of(Yup.string())
    .required('Request access control is required'),
  description: Yup.string().required('Description is required'),
  status: Yup.string().oneOf(['active', 'inactive']),
});

CreateConduitForm.propTypes = {
  changeView: PropTypes.func.isRequired,
};

function CreateConduitForm({ changeView }) {
  const initialValues = {
    suriApiKey: '',
    suriType: 'Airtable',
    suri: '',
    racm: ['GET'],
    description: '',
    status: 'inactive',
  };

  const dispatch = useDispatch();

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={conduitSchema}
      render={(props) => (
        <ConduitForm
          {...props}
          buttonLabel="Create Conduit"
          changeView={changeView}
          status=""
        />
      )}
      onSubmit={(values, actions) => {
        console.log('in create form, values: ', values);
        dispatch(addConduit({ conduit: { ...values } }, actions, changeView));
      }}
    />
  );
};

export default CreateConduitForm;
