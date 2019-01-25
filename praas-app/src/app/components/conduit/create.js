import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { Formik } from 'formik';

import ConduitForm from './form';

import { addConduit } from 'store/conduit/create';
import { createDraft, updateDraft } from 'store/conduit/draft';

class CreateConduitForm extends Component {
  constructor(props) {
    super(props);
    this.handleFieldUpdates = this.handleFieldUpdates.bind(this);
  }

  componentDidMount() {
    this.props.createDraft();
  }

  handleFieldUpdates(e) {
    const field = e.target.name;
    const value = e.target.value;
    this.props.updateDraft(field, value);
  }

  render() {
    const { changeMode, dispatch, draftConduit } = this.props;
    const initialValues = {
      suriApiKey: '',
      suriType: '',
      suri: '',
      whitelist: '',
      racm: '',
      description: '',
    };
    const conduitSchema = Yup.object({
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
      description: Yup.string()
        .required('Description is required'),
    });

    return (
      <Formik
        initialValues={initialValues}
        validationSchema={conduitSchema}
        render={props =>
          <ConduitForm {...props}
            status={''}
            buttonLabel="Create Conduit"
            handleFieldUpdates={this.handleFieldUpdates}
            draftConduit={draftConduit}
            changeMode={changeMode} />}
        onSubmit={(_values, actions) => {
          // const conduit = values.conduit;
          dispatch(addConduit({ conduit: draftConduit }, actions, changeMode));
        }
        }
      />
    );
  }
}

CreateConduitForm.propTypes = {
  draftConduit: PropTypes.object,
  changeMode: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  createDraft: PropTypes.func.isRequired,
  updateDraft: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => (
  {
    draftConduit: state.conduit.draft
  }
);

const mapDispatchToProps = (dispatch) => (
  {
    dispatch,
    createDraft: () => dispatch(createDraft()),
    updateDraft: (field, value) => dispatch(updateDraft(field, value)),
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(CreateConduitForm);
