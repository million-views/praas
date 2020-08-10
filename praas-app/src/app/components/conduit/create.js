import React from 'react';
import { useDispatch } from 'react-redux';
import { Formik } from 'formik';
import PropTypes from 'prop-types';

import ConduitForm from './form';
import { conduit as conduitSchema } from 'app/schema';
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
