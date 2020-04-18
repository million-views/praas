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
import { withRouter, RouteComponentProps } from 'react-router';
import { useForm } from 'react-hook-form';
import Header from '../../components/Header';
import { loginUser } from '../../store/user/login';
import signinSchema from './schema';

import './style.scss';

type Props = {
  user: any;
  loginUser: (data: any) => void;
};

const SignIn: React.FC<Props & RouteComponentProps> = ({
  user,
  loginUser,
  history,
}) => {
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
    <IonPage className="signin-page">
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
                <div className="error">{errors.email?.message}</div>
                <IonItem>
                  <IonLabel position="floating">Password</IonLabel>
                  <IonInput type="password" name="password" ref={register()} />
                </IonItem>
                <div className="error">{errors.password?.message}</div>
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

export default connect(mapStateToProps, { loginUser })(withRouter(SignIn));
