import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { Formik } from 'formik';

import ConduitForm from './form';

import { updateConduit, getConduit } from 'store/conduit/edit';
import { createDraft, updateDraft } from 'store/conduit/draft';

class EditConduitForm extends Component {
  constructor(props) {
    super(props);
    this.handleFieldUpdates = this.handleFieldUpdates.bind(this);
  }

  componentDidMount() {
    const { conduit } = this.props;
    this.props.createDraft(conduit);
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
            buttonLabel="Edit Conduit"
            handleFieldUpdates={this.handleFieldUpdates}
            draftConduit={draftConduit}
            changeMode={changeMode} />}
        onSubmit={(_values, actions) => {
          // const conduit = values.conduit;
          dispatch(updateConduit({ conduit: draftConduit }, actions, changeMode));
        }
        }
      />
    );
  }
}

EditConduitForm.propTypes = {
  conduit: PropTypes.object,
  draftConduit: PropTypes.object,
  changeMode: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  createDraft: PropTypes.func.isRequired,
  updateDraft: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    draftConduit: state.conduit.draft,
    conduit: getConduit(state, ownProps.cid)
  };
};

const mapDispatchToProps = (dispatch) => (
  {
    dispatch,
    createDraft: (conduit) => dispatch(createDraft(conduit)),
    updateDraft: (field, value) => dispatch(updateDraft(field, value)),
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(EditConduitForm);
