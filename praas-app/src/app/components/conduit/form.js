import React from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { Formik, Field, Form, ErrorMessage } from 'formik';

import Alert from 'components/alert';

import { addConduit } from 'store/conduit/create';

import style from './form.scss';
import { cx } from 'tiny';

function conduit(props) {
  const { changeMode, dispatch } = props;
  const initialValues = {
    conduit: {
      suriApiKey: '',
      suriType: '',
      suri: '',
      whitelist: '',
      racm: '',
      desciption: '',
    }
  };
  const conduitSchema = Yup.object({
    conduit: Yup.object({
      suriApiKey: Yup.string()
        .required('Service endpoint API key is required'),
      suriType: Yup.string()
        .required('Service endpoint type is required'),
      suri: Yup.string()
        .required('Service endpoint uri is required'),
      whitelist: Yup.string()
        .required('Whitelist (ip addresses) is required'),
      racm: Yup.string()
        .required('Request access control is required'),
      description: Yup.string(),
    })
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={conduitSchema}
      render={ConduitForm}
      onSubmit={(values, actions) => {
        const conduit = values.conduit;
        dispatch(addConduit({ conduit }, actions, changeMode));
      }}
    />
  );
}

conduit.propTypes = {
  changeMode: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function ConduitForm(props) {
  const { isSubmitting, status } = props;
  const classes = cx(['submit', { 'spinner': isSubmitting }]);

  return (
    <Form className={style.createConduit}>
      <h2 className={style.header}>Create a new conduit</h2>
      {
        status && <Alert klass="alert-danger" message={status.errors} />
      }
      <Field name="conduit.suriApiKey" placeholder="Service endpoint API Key" type="text" required />
      <ErrorMessage name="conduit.suriApiKey" component="div" className="error" />

      <Field name="conduit.suriType" placeholder="Select Type" component="select" required>
        <option value="google">Google Sheets</option>
        <option value="airtable">AirTable</option>
        <option value="ssheets">Smart sheets</option>
      </Field>
      <ErrorMessage name="conduit.suriType" component="div" className="error" />

      <Field name="conduit.suri" placeholder="Service endpoint uri" type="text" required />
      <ErrorMessage name="conduit.suri" component="div" className="error" />

      <Field name="conduit.whitelist" placeholder="Whitelist" type="text" required />
      <ErrorMessage name="conduit.whitelist" component="div" className="error" />

      <Field name="conduit.racm" placeholder="Select Type" component="select" required>
        <option value="get">GET</option>
        <option value="post">POST</option>
        <option value="delete">DELETE</option>
        <option value="update">UPDATE</option>
      </Field>
      <ErrorMessage name="conduit.suriType" component="div" className="error" />

      <Field name="conduit.description" placeholder="Description of the endpoint" type="text" />
      <ErrorMessage name="conduit.description" component="div" className="error" />

      <button type="submit" disabled={isSubmitting === true} className={classes}>Submit</button>
    </Form>
  );
};

ConduitForm.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
};

export default conduit;
