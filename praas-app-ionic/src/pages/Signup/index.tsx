import React, { useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonInput,
  IonButton
} from '@ionic/react';
import { useFormik } from 'formik';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import * as Yup from 'yup';
import Header from '../../components/Header';
import { registerUser } from '../../store/user/registration';
import './style.scss';

type Props = {
  user: any;
  registerUser: (data: any, formikActions: any) => void;
};

const signupSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'Must be longer than 2 characters')
    .max(20, 'Nice try, nobody has a first name that long')
    .required("Don't be shy. Tell us your first name"),
  email: Yup.string()
    .email('Invalid email address')
    .min(23, 'Must be longer than 2 characters')
    .required('Email is required'),
  password: Yup.string()
    .min(2, 'Must be longer than 8 characters')
    .required('Passphrase is required')
});
const Signup: React.FC<Props & RouteComponentProps> = ({
  user,
  history,
  registerUser
}) => {
  const formik = useFormik({
    initialValues: { firstName: '', email: '', password: '' },
    validationSchema: signupSchema,
    onSubmit: (values, actions) => {
      registerUser({ user: values }, actions);
    }
  });

  useEffect(() => {
    if (user.login.loggedIn) history.replace('/');
  }, [user, history]);

  console.log(formik.errors);

  return (
    <IonPage className="signup-page">
      <Header />
      <IonContent>
        <form noValidate onSubmit={formik.handleSubmit}>
          <IonGrid>
            <IonRow className="ion-justify-content-center">
              <IonCol sizeXs="12" sizeSm="4" className="text-align-center">
                <IonItem>
                  <IonLabel position="floating">Name</IonLabel>
                  <IonInput
                    type="text"
                    name="firstName"
                    onIonChange={event => {
                      formik.values.firstName = event.detail.value!;
                    }}
                    value={formik.values.firstName}
                  />
                </IonItem>
                <div className="error">{formik.errors.firstName}</div>
                <IonItem>
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={formik.values.email}
                    onIonChange={event => {
                      formik.values.email = event.detail.value!;
                    }}
                  />
                </IonItem>
                <div className="error">{formik.errors.email}</div>
                <IonItem>
                  <IonLabel position="floating">Password</IonLabel>
                  <IonInput
                    type="password"
                    value={formik.values.password}
                    onIonChange={event => {
                      formik.values.password = event.detail.value!;
                    }}
                  />
                </IonItem>
                <div className="error">{formik.errors.password}</div>
                <IonButton type="submit" color="primary">
                  Submit
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </form>
      </IonContent>
    </IonPage>
  );
};

const mapStateToProps = ({ user }: any) => {
  return { user };
};

export default connect(mapStateToProps, { registerUser })(withRouter(Signup));
