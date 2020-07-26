import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { Formik } from 'formik';

import ConduitForm from './form';

import { updateConduit, getConduit } from 'store/conduit/edit';

EditConduitForm.propTypes = {
  cid: PropTypes.number,
  changeView: PropTypes.func.isRequired,
};

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

function EditConduitForm ({ changeView, cid }) {
  const conduit = useSelector(state => getConduit(state, cid));
  const dispatch = useDispatch();
  const initialValues = {
    suriApiKey: conduit.suriApiKey,
    suriType: conduit.suriType,
    suri: conduit.suri,
    allowlist: conduit.allowlist,
    racm: conduit.racm,
    status: conduit.status,
    description: conduit.description,
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={conduitSchema}
      enableReinitialize
      render={(props) => (
        <ConduitForm
          {...props}
          buttonLabel="Save Conduit"
          cid={cid}
          changeView={changeView}
          conduit={conduit}
          handleFieldUpdates
          status=""
        />
      )}
      onSubmit={(values, actions) => {
        console.log('in edit form, values: ', values);
        dispatch(
          updateConduit(
            { conduit: { ...values, id: conduit.id } },
            actions,
            changeView
          )
        );
      }}
    />
  );
}

export default EditConduitForm;
