import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { Formik } from 'formik';

import ConduitForm from './form';

import { addConduit } from 'store/conduit/create';

class CreateConduitForm extends Component {
  render() {
    const { changeMode, dispatch } = this.props;
    const initialValues = {
      suriApiKey: '',
      suriType: 'Airtable',
      suri: '',
      racm: [],
      description: '',
      status: 'inactive',
    };

    const conduitSchema = Yup.object({
      suriApiKey: Yup.string().required('Service endpoint API key is required'),
      suriType: Yup.string().required('Service endpoint type is required'),
      suri: Yup.string().required('Service endpoint uri is required'),
      racm: Yup.array()
        .of(Yup.string())
        .required('Request access control is required'),
      description: Yup.string().required('Description is required'),
      status: Yup.string().oneOf(['active', 'inactive']),
    });

    return (
      <Formik
        initialValues={initialValues}
        validationSchema={conduitSchema}
        render={(props) => (
          <ConduitForm
            {...props}
            buttonLabel="Create Conduit"
            changeMode={changeMode}
            status=""
          />
        )}
        onSubmit={(values, actions) => {
          // console.log('in create form, values: ', values);
          dispatch(addConduit({ conduit: { ...values } }, actions, changeMode));
        }}
      />
    );
  }
}

CreateConduitForm.propTypes = {
  changeMode: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

export default connect(null, mapDispatchToProps)(CreateConduitForm);
