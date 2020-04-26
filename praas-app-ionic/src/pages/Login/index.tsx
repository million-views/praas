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
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { useForm } from 'react-hook-form';
import Header from '../../components/Header';
import Error from '../../components/Error';
import { loginUser } from '../../store/user/login';
import signinSchema from './schema';

import './style.scss';

interface Props extends RouteComponentProps {
  user: any;
  loginUser: (data: any) => void;
}

const LoginPage: React.FC<Props> = ({ user, loginUser, history }) => {
  const { register, handleSubmit, errors } = useForm({
    defaultValues: { email: '', password: '' },
    validationSchema: signinSchema,
  });

  const onSubmit = (values: any) => {
    loginUser({ user: values });
  };

  useEffect(() => {
    if (user.login.loggedIn) history.replace('/');
  }, [user, history]);

  return (
    <IonPage className="login-page">
      <Header />
      <IonContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <IonGrid>
            <IonRow className="ion-justify-content-center">
              <IonCol sizeXs="12" sizeSm="4" className="text-align-center">
                <IonItem>
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput type="email" name="email" ref={register()} />
                </IonItem>
                <Error message={errors.email?.message}></Error>
                <IonItem>
                  <IonLabel position="floating">Password</IonLabel>
                  <IonInput type="password" name="password" ref={register()} />
                </IonItem>
                <Error message={errors.password?.message}></Error>
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

export default connect(mapStateToProps, { loginUser })(LoginPage);
