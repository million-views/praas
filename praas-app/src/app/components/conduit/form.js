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

const Status = ({ field, form: { values, touched, errors } }) => {
  return (
    <span>
      <label>
        <input
          {...field}
          type="radio"
          defaultChecked={values.status === 'active'}
          value="active"
        />
        <span className="checkable">Active</span>
      </label>
      <label>
        <input
          {...field}
          type="radio"
          defaultChecked={values.status === 'inactive'}
          value="inactive"
        />
        <span className="checkable">Inactive</span>
      </label>
      {touched[field.name] && errors[field.name] && (
        <div className="field-error">{errors[field.name]}</div>
      )}
    </span>
  );
};

function ConduitForm(props) {
  // console.log('props in form: ', props);
  const { buttonLabel, changeView, isSubmitting, status, cid } = props;
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
        <option value="googleSheets">Google Sheets</option>
        <option value="airtable">Airtable</option>
        <option value="email">Email</option>
      </Field>
      <ErrorMessage name="suriType" component="div" className="error" />

      <Field
        name="suriObjectKey"
        placeholder="Service endpoint object path"
        type="text"
        required
      />
      <ErrorMessage name="suriObjectKey" component="div" className="error" />

      <div style={{ display: 'flex' }}>
        <div style={{ flexGrow: 3 }} className="card">
          <h4>Allowed operations: </h4>
          <FieldArray name="racm" component={Racm} />
        </div>
        <span style={{ flexGrow: 1 }}> </span>
        <div className="card" style={{ flexGrow: 1 }}>
          <h4>Status:</h4>
          <Field name="status" component={Status} />
        </div>
      </div>

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
        onClick={() => changeView('list', 'cancel', cid, 'components/form')}
        className={classes}
      >
        Cancel
      </button>
    </Form>
  );
}

ConduitForm.propTypes = {
  buttonLabel: PropTypes.string.isRequired,
  changeView: PropTypes.func,
  isSubmitting: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
};

export default ConduitForm;
