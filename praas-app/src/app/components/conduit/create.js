import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Formik } from 'formik';

import ConduitForm from './form';
import conduitSchema from './schema';

import { addConduit } from 'store/conduit/create';

CreateConduitForm.propTypes = {
  changeView: PropTypes.func.isRequired,
};

function CreateConduitForm({ changeView }) {
  const initialValues = {
    suriApiKey: '',
    suriType: 'airtable',
    suriObjectKey: '',
    racm: ['GET'],
    description: '',
    status: 'inactive',
  };

  const dispatch = useDispatch();

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={conduitSchema}
      onSubmit={(values, actions) => {
        console.log('in create form, values: ', values);
        dispatch(addConduit({ conduit: { ...values } }, actions, changeView));
      }}
    >
      {(props) => (
        <ConduitForm
          {...props}
          buttonLabel="Create Conduit"
          changeView={changeView}
          status=""
        />
      )}
    </Formik>
  );
};

export default CreateConduitForm;
