import React from 'react';
import PropTypes from 'prop-types';
import { Field, Form, ErrorMessage } from 'formik';

import Alert from 'components/alert';

import style from './form.scss';
import { cx } from 'tiny';

function ConduitForm(props) {
  console.log('props in editform: ', props);
  const {
    buttonLabel,
    isSubmitting,
    status,
    // touched,
    draftConduit,
    handleChange,
    handleFieldUpdates,
    changeMode } = props;
  const classes = cx(['submit', { 'spinner': isSubmitting }]);

  return (
    <Form className={style.createConduit}>
      <h2 className={style.header}>{buttonLabel}</h2>
      {
        status && <Alert klass="alert-danger" message={status.errors} />
      }
      <Field
        name="suriApiKey"
        value={draftConduit.suriApiKey}
        placeholder="Service endpoint API Key"
        type="text"
        required
        onChange={(e) => { handleChange(e); handleFieldUpdates(e); }}
      />
      <ErrorMessage name="suriApiKey" component="div" className="error" />

      <Field
        name="suriType"
        value={draftConduit.suriType}
        placeholder="Select Type"
        component="select"
        required
        onChange={(e) => { handleChange(e); handleFieldUpdates(e); }}>
        <option value="google">Google Sheets</option>
        <option value="airtable">AirTable</option>
        <option value="ssheets">Smart sheets</option>
      </Field>
      <ErrorMessage name="suriType" component="div" className="error" />

      <Field
        name="suri"
        value={draftConduit.suri}
        placeholder="Service endpoint uri"
        type="text"
        required
        onChange={(e) => { handleChange(e); handleFieldUpdates(e); }} />
      <ErrorMessage name="suri" component="div" className="error" />

      <Field
        name="whitelist"
        value={draftConduit.whitelist}
        placeholder="Whitelist"
        type="text"
        required
        onChange={(e) => { handleChange(e); handleFieldUpdates(e); }} />
      <ErrorMessage name="whitelist" component="div" className="error" />

      <Field
        name="racm"
        value={draftConduit.racm}
        placeholder="Select Type"
        component="select"
        required
        onChange={(e) => { handleChange(e); handleFieldUpdates(e); }}>
        <option value="get">GET</option>
        <option value="post">POST</option>
        <option value="delete">DELETE</option>
        <option value="update">UPDATE</option>
      </Field>
      <ErrorMessage name="racm" component="div" className="error" />

      <Field
        name="description"
        value={draftConduit.description}
        placeholder="Description of the endpoint"
        type="text"
        required
        onChange={(e) => { handleChange(e); handleFieldUpdates(e); }} />
      <ErrorMessage name="description" component="div" className="error" />

      <button type="submit" disabled={isSubmitting === true} className={classes}>
        {buttonLabel}
      </button>
      <button type="button" onClick={() => changeMode('list')} className={classes}>
        Cancel
      </button>
    </Form>
  );
};

ConduitForm.propTypes = {
  buttonLabel: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
  // touched: PropTypes.object,
  draftConduit: PropTypes.object,
  handleChange: PropTypes.func.isRequired,
  handleFieldUpdates: PropTypes.func.isRequired,
  changeMode: PropTypes.func,
};

export default ConduitForm;
