import React from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray, Form, ErrorMessage } from 'formik';

import Alert from 'components/alert';

import style from './form.scss';
import { cx } from 'tiny';

function ConduitForm(props) {
  console.log('props in form: ', props);
  const {
    buttonLabel,
    changeMode,
    isSubmitting,
    status,
    values
  } = props;
  const categories = [
    { id: 'GET', name: 'GET' },
    { id: 'POST', name: 'POST' },
    { id: 'DELETE', name: 'DELETE' },
    { id: 'PATCH', name: 'PATCH' },
  ];
  const classes = cx(['submit', { 'spinner': isSubmitting }]);

  return (
    <Form className={style.createConduit}>
      <h2 className={style.header}>{buttonLabel}</h2>
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

      <Field
        name="whitelist"
        placeholder="Whitelist"
        type="text"
        required
      />
      <ErrorMessage name="whitelist" component="div" className="error" />

      <FieldArray
        name="racm"
        render={arrayHelpers => (
          <div>
            {categories.map(category => (
              <div key={category.id}>
                <label>
                  <input
                    name="racm"
                    type="checkbox"
                    value={category.id}
                    checked={values.racm.includes(category.id)}
                    onChange={e => {
                      if (e.target.checked) arrayHelpers.push(category.id);
                      else {
                        const idx = values.racm.indexOf(category.id);
                        arrayHelpers.remove(idx);
                      }
                    }}
                  />{''}
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        )} />

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
  values: PropTypes.object,
};

export default ConduitForm;
