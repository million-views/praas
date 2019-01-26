import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { Formik } from 'formik';

import ConduitForm from './form';

import { updateConduit, getConduit } from 'store/conduit/edit';

class EditConduitForm extends Component {
  render() {
    const { changeMode, dispatch, conduit } = this.props;
    console.log('conduit in render-editform: ', conduit);
    const initialValues = {
      suriApiKey: conduit.suriApiKey,
      suriType: conduit.suriType,
      suri: conduit.suri,
      whitelist: conduit.whitelist,
      racm: conduit.racm,
      description: conduit.description,
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
        // racm: Yup.array().of(Yup.string())
        .required('Request access control is required'),
      description: Yup.string()
        .required('Description is required'),
    });

    return (
      <Formik
        initialValues={initialValues}
        validationSchema={conduitSchema}
        enableReinitialize
        render={props =>
          <ConduitForm {...props}
            buttonLabel="Edit Conduit"
            changeMode={changeMode}
            conduit={conduit}
            handleFieldUpdates={this.handleFieldUpdates}
            status={''} />}
        onSubmit={(values, actions) => {
          console.log('in edit form, values: ', values);

          dispatch(updateConduit({ conduit: { ...values, id: conduit.id } }, actions, changeMode));
        }
        }
      />
    );
  }
}

EditConduitForm.propTypes = {
  conduit: PropTypes.object,
  changeMode: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    conduit: getConduit(state, ownProps.cid)
  };
};

const mapDispatchToProps = (dispatch) => (
  {
    dispatch,
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(EditConduitForm);
