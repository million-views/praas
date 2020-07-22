import React from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray, Form, ErrorMessage } from 'formik';

import Alert from 'components/alert';
import { cx } from 'tiny';

const categories = [
  { id: 'GET', name: 'GET' },
  { id: 'POST', name: 'POST' },
  { id: 'DELETE', name: 'DELETE' },
  { id: 'PATCH', name: 'PATCH' },
];

/* eslint react/prop-types: 0 */
const Racm = (props) => {
  const { push, remove, form } = props;
  return (
    <div>
      {categories.map((category) => (
        <label key={category.id}>
          <input
            name="racm"
            type="checkbox"
            value={category.id}
            checked={form.values.racm.includes(category.id)}
            onChange={(e) => {
              if (e.target.checked) {
                push(category.id);
              } else {
                const idx = form.values.racm.indexOf(category.id);
                remove(idx);
              }
            }}
          />
          <span className="checkable">{category.name}</span>
        </label>
      ))}
      {form.touched.racm && form.errors.racm && (
        <div className="field-error">{form.errors.racm}</div>
      )}
    </div>
  );
};

function ConduitForm(props) {
  console.log('props in form: ', props);
  const { buttonLabel, changeMode, isSubmitting, status } = props;
  const classes = cx(['submit', { spinner: isSubmitting }]);

  return (
    <Form>
      <h2>{buttonLabel}</h2>
      {status && <Alert klass="alert-danger" message={status.errors} />}
      <Field
        name="suriApiKey"
        placeholder="Service endpoint API Key"
        type="text"
        required
      />
      <ErrorMessage name="suriApiKey" component="div" className="error" />

      <Field
        name="suriType"
        placeholder="Select Type"
        component="select"
        required
      >
        <option value="Google Sheets">Google Sheets</option>
        <option value="Airtable">Airtable</option>
        <option value="Smartsheet">Smartsheet</option>
      </Field>
      <ErrorMessage name="suriType" component="div" className="error" />

      <Field
        name="suri"
        placeholder="Service endpoint uri"
        type="text"
        required
      />
      <ErrorMessage name="suri" component="div" className="error" />
      <FieldArray name="racm" component={Racm} />

      <Field
        name="description"
        placeholder="Description of the endpoint"
        type="text"
        required
      />
      <ErrorMessage name="description" component="div" className="error" />

      <button
        type="submit"
        disabled={isSubmitting === true}
        className={classes}
      >
        {buttonLabel}
      </button>
      <button
        type="button"
        onClick={() => changeMode('list')}
        className={classes}
      >
        Cancel
      </button>
    </Form>
  );
}

ConduitForm.propTypes = {
  buttonLabel: PropTypes.string.isRequired,
  changeMode: PropTypes.func,
  isSubmitting: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
};

export default ConduitForm;
