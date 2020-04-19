import React from 'react';
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
import { useFormik } from 'formik';
import { connect } from 'react-redux';
import Header from '../../components/Header';
import { loginUser } from '../../store/user/login';

import './style.scss';

type Props = {
  loginUser: (data: any, formikActions: any) => void;
};

const LoginPage: React.FC<Props> = ({ loginUser }) => {
  const formik = useFormik({
    initialValues: { email: '', password: '' },
    onSubmit: (values: any, actions: any) => {
      loginUser({ user: values }, actions);
    },
  });

  return (
    <IonPage className="login-page">
      <Header />
      <IonContent>
        <form onSubmit={formik.handleSubmit}>
          <IonGrid>
            <IonRow className="ion-justify-content-center">
              <IonCol sizeXs="12" sizeSm="4" className="text-align-center">
                <IonItem>
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={formik.values.email}
                    onIonChange={(event) => {
                      formik.values.email = event.detail.value!;
                    }}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="floating">Password</IonLabel>
                  <IonInput
                    type="password"
                    value={formik.values.password}
                    onIonChange={(event) => {
                      formik.values.password = event.detail.value!;
                    }}
                  />
                </IonItem>
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
  console.log(user);
  return { user };
};

export default connect(mapStateToProps, { loginUser })(LoginPage);
