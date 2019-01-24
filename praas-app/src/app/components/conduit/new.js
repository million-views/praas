import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { Formik } from 'formik';

import ConduitForm from './form';

import { addConduit } from 'store/conduit/create';

class NewConduitForm extends Component {
  // componentDidMount() {
  //   this.props.createDraft();
  // }

  handleSubmit(e) {
    e.preventDefault();
  }

  render() {
    const { changeMode, dispatch } = this.props;
    const initialValues = {
      conduit: {
        suriApiKey: '',
        suriType: '',
        suri: '',
        whitelist: '',
        racm: '',
        desciption: '',
      }
    };
    const conduitSchema = Yup.object({
      conduit: Yup.object({
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
        description: Yup.string(),
      })
    });

    return (
      <Formik
        initialValues={initialValues}
        validationSchema={conduitSchema}
        render={ConduitForm}
        onSubmit={(values, actions) => {
          const conduit = values.conduit;
          dispatch(addConduit({ conduit }, actions, changeMode));
        }}
      />
    );
  }
}

NewConduitForm.propTypes = {
  changeMode: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

// const mapDispatchToProps = (dispatch) => (
//   {
//     createDraft: () => dispatch(createDraft()),
//   }
// );

export default connect(null, null)(NewConduitForm);
