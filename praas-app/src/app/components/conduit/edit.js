import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Formik } from 'formik';
import PropTypes from 'prop-types';

import ConduitForm from './form';
import { conduit as conduitSchema } from 'app/schema';

import { updateConduit, getConduit } from 'store/conduit/edit';

EditConduitForm.propTypes = {
  cid: PropTypes.number,
  changeView: PropTypes.func.isRequired,
};

function EditConduitForm ({ changeView, cid }) {
  const conduit = useSelector(state => getConduit(state, cid));
  const dispatch = useDispatch();
  const initialValues = {
    suriApiKey: conduit.suriApiKey,
    suriType: conduit.suriType,
    suriObjectKey: conduit.suriObjectKey,
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
      onSubmit={(values, actions) => {
        dispatch(
          updateConduit(
            { conduit: { ...values, id: conduit.id } },
            actions,
            changeView
          )
        );
      }}
    >
      {(props) => (
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
    </Formik>
  );
}

export default EditConduitForm;
