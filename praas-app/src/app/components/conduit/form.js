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
const Checkbox = (props) => {
  console.log('checkbox props: ', props);
  const { push, remove, form } = props;
  return (
    <div>
      {categories.map(category => (
        <label key={category.id}>
          <input
            name="racm"
            type="checkbox"
            value={category.id}
            checked={form.values.racm.includes(category.id)}
            onChange={e => {
              if (e.target.checked) {
                push(category.id);
              } else {
                const idx = form.values.racm.indexOf(category.id);
                remove(idx);
              }
            }}
          />
          {category.name}
        </label>
      ))}
    </div>
  );
};

const IpAddress = ({
  field, form: { touched, errors }, ...props
}) =>
  (
    <div className="col">
      <input {...field} type="text" placeholder="IP Address" />
      {
        touched[field.name] && errors[field.name] &&
        <div className="field-error">{errors[field.name]}</div>
      }
    </div>
  );

const Comment = ({
  field, form: { touched, errors }, ...props
}) =>
  (
    <div className="col">
      <input {...field} type="text" placeholder="Comment" />
      {
        touched[field.name] && errors[field.name] &&
        <div className="field-error">{errors[field.name]}</div>
      }
    </div>
  );

const IpState = ({
  field, form: { touched, errors }, ...props
}) =>
  (
    <div className="col">
      <input {...field} type="radio" value="Active" />Active
      <input {...field} checked type="radio" value="Inactive" />Inactive
      {
        touched[field.name] && errors[field.name] &&
        <div className="field-error">{errors[field.name]}</div>
      }
    </div>
  );

const Whitelist = (props) => {
  const { push, remove, form } = props;
  return (
    <React.Fragment>
      {form.values.whitelist &&
        form.values.whitelist.length > 0 &&
        form.values.whitelist.map((address, index) => (
          <div key={index} className="row">
            <Field name={`whitelist[${index}].address`} component={IpAddress} />
            <Field name={`whitelist[${index}].comment`} component={Comment} />
            <Field name={`whitelist[${index}].state`} component={IpState} />
            <div className="col">
              <button type="button" onClick={() => remove(index)}>
                X
              </button>
            </div>
          </div>
        ))}
      <button
        type="button"
        onClick={() => push({ address: '', comment: '', state: '' })}
        className="secondary"
      >
        Add IP Address
      </button>
    </React.Fragment>
  );
};

function ConduitForm(props) {
  console.log('props in form: ', props);
  const {
    buttonLabel,
    changeMode,
    isSubmitting,
    status,
  } = props;
  const classes = cx(['submit', { 'spinner': isSubmitting }]);

  return (
    <Form >
      <h2 >{buttonLabel}</h2>
      {
        status && <Alert klass="alert-danger" message={status.errors} />
      }
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
        <option value="google">Google Sheets</option>
        <option value="airtable">AirTable</option>
        <option value="ssheets">Smart sheets</option>
      </Field>
      <ErrorMessage name="suriType" component="div" className="error" />

      <Field
        name="suri"
        placeholder="Service endpoint uri"
        type="text"
        required
      />
      <ErrorMessage name="suri" component="div" className="error" />

      <FieldArray name="whitelist" component={Whitelist} />
      <FieldArray name="racm" component={Checkbox} />

      <Field
        name="description"
        placeholder="Description of the endpoint"
        type="text"
        required
      />
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
  changeMode: PropTypes.func,
  isSubmitting: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
};

export default ConduitForm;
