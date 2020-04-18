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
  IonButton,
} from '@ionic/react';
import { useForm } from 'react-hook-form';

import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import * as Yup from 'yup';
import Header from '../../components/Header';
import { registerUser } from '../../store/user/registration';
import './style.scss';

type Props = {
  user: any;
  registerUser: (data: any) => void;
};

const signupSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'Must be longer than 2 characters')
    .max(20, 'Nice try, nobody has a first name that long')
    .required("Don't be shy. Tell us your first name"),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(2, 'Must be longer than 8 characters')
    .required('Passphrase is required'),
});
const Signup: React.FC<Props & RouteComponentProps> = ({
  user,
  history,
  registerUser,
}) => {
  const { register, handleSubmit } = useForm({
    defaultValues: { firstName: '', email: '', password: '' },
    validationSchema: signupSchema,
  });

  const onSubmit = (values: any) => {
    registerUser({ user: values });
  };

  useEffect(() => {
    if (user.login.loggedIn) history.replace('/');
  }, [user, history]);

  return (
    <IonPage className="signup-page">
      <Header />
      <IonContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <IonGrid>
            <IonRow className="ion-justify-content-center">
              <IonCol sizeXs="12" sizeSm="4" className="text-align-center">
                <IonItem>
                  <IonLabel position="floating">Name</IonLabel>
                  <IonInput type="text" name="firstName" ref={register()} />
                </IonItem>
                {/* <div className="error">{errors.firstName}</div> */}
                <IonItem>
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput type="email" name="email" ref={register()} />
                </IonItem>
                {/* <div className="error">{errors.email}</div> */}
                <IonItem>
                  <IonLabel position="floating">Password</IonLabel>
                  <IonInput type="password" name="password" ref={register()} />
                </IonItem>
                {/* <div className="error">{errors.password}</div> */}
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
