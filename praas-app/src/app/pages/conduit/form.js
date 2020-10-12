import React, { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers';
import PropTypes from 'prop-types';

// import { Header } from 'components';
import {
  Text, Select, CheckboxGroup, RadioGroup, Form
} from 'components/form-fields';
import { conduit as conduitSchema } from 'app/schema';

import { addConduit, updateConduit, getConduit } from 'store/conduit';

const conduitAccessControl = [
  { name: 'get', value: 'GET', label: 'List' },
  { name: 'post', value: 'POST', label: 'Add' },
  { name: 'put', value: 'PUT', label: 'Replace' },
  { name: 'patch', value: 'PATCH', label: 'Update' },
  { name: 'delete', value: 'DELETE', label: 'Delete' },
];

const conduitStatus = [
  { name: 'active', value: 'active', label: 'Active' },
  { name: 'inactive', value: 'inactive', label: 'Inactive' },
];

const conduitSupportedEndpoints = [
  { value: 'googleSheets', label: 'Google Sheets' },
  { value: 'airtable', label: 'Airtable' },
  { value: 'email', label: 'Email' },
];

const getInitialValues = (conduit) => {
  if (!conduit) {
    return {
      conduit: {
        suriApiKey: '',
        suriType: 'airtable',
        suriObjectKey: '',
        racm: ['GET'],
        description: '',
        status: 'inactive',
      }
    };
  } else {
    return {
      conduit: { ...conduit }
    };
  }
};

ConduitForm.propTypes = {
  heading: PropTypes.string.isRequired,
  send: PropTypes.func.isRequired,
  sendActionLabel: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  conduit: PropTypes.object,
};

function ErrorFallback({ error, componentStack, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}> {error.message} </pre>
      <pre>{componentStack}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function ConduitForm(
  { heading, send, sendActionLabel, onSuccess, onCancel, conduit }
) {
  const [remoteErrors, setRemoteErrors] = useState({});
  const methods = useForm({
    mode: 'all',
    resolver: yupResolver(conduitSchema),
    defaultValues: getInitialValues(conduit)
  });

  const handleClearErrors = () => methods.clearErrors();
  const onSubmit = async (data) => {
    const conduit = data.conduit;
    try {
      const result = await send(conduit);
      setRemoteErrors({});
      Promise.resolve(result).then((result) => onSuccess(result));
      // navigate('/login', { state: result });
    } catch (errors) {
      setRemoteErrors(errors);
    }
  };

  // TODO:
  // - a more sophisticated error recovery
  // - perhaps bring up a modal to submit the stack trace?
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback} onReset={handleClearErrors}>
      <h2>{heading}</h2>
      <Form onSubmit={onSubmit} methods={methods} errors={remoteErrors}>
        <Text
          name="conduit.suriApiKey"
          placeholder="Service endpoint API Key" />
        <Select
          name="conduit.suriType" placeholder="Select conduit type"
          options={conduitSupportedEndpoints} />
        <Text
          name="conduit.suriObjectKey"
          placeholder="Service endpoint object path" />
        <CheckboxGroup
          name="conduit.racm" title="Allowed Operations:"
          options={conduitAccessControl} />
        <br />
        <RadioGroup
          name="conduit.status" title="Status: "
          options={conduitStatus} />
        <br />
        <Text
          name="conduit.description"
          placeholder="Description of the endpoint" />
        <button type="submit">{sendActionLabel}</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </Form>
    </ErrorBoundary>
  );
};

/* eslint react/prop-types: 0 */

export function CreateConduitForm({ changeView }) {
  const dispatch = useDispatch();
  const send = (conduit) => dispatch(addConduit({ conduit }));
  const onSuccess = (result) =>
    changeView('list', 'refresh', result.id, 'conduit/create/success');
  const onCancel = () =>
    changeView('list', 'cancel', undefined, 'conduit/create/cancel');

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ConduitForm
        heading="Create Conduit"
        send={send} sendActionLabel="Create Conduit"
        onSuccess={onSuccess} onCancel={onCancel} />
    </ErrorBoundary>
  );
};

export function EditConduitForm({ changeView, cid }) {
  const dispatch = useDispatch();
  const conduit = useSelector(state => getConduit(state, cid));
  const send = (conduit) =>
    dispatch(updateConduit({ conduit: { ...conduit, id: cid } }));
  const onSuccess = (result) =>
    changeView('list', 'refresh', result.id, 'conduit/edit/success');
  const onCancel = () =>
    changeView('list', 'cancel', undefined, 'conduit/edit/cancel');
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ConduitForm
        send={send} onSuccess={onSuccess} onCancel={onCancel}
        conduit={conduit}
        heading="Update Conduit" sendActionLabel="Save Conduit" />
    </ErrorBoundary>
  );
};
