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
import Header from '../../components/Header';
import Error from '../../components/Error';
import { registerUser } from '../../store/user/registration';
import signupSchema from './schema';
import './style.scss';

interface Props extends RouteComponentProps {
  user: any;
  registerUser: (data: any) => void;
}

const Signup: React.FC<Props & RouteComponentProps> = ({
  user,
  history,
  registerUser,
}) => {
  const { register, handleSubmit, errors } = useForm({
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
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <IonGrid>
            <IonRow className="ion-justify-content-center">
              <IonCol sizeXs="12" sizeSm="4" className="text-align-center">
                <IonItem>
                  <IonLabel position="floating">Name</IonLabel>
                  <IonInput type="text" name="firstName" ref={register()} />
                </IonItem>
                <Error message={errors.firstName?.message} />
                <IonItem>
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput type="email" name="email" ref={register()} />
                </IonItem>
                <Error message={errors?.email?.message} />
                <IonItem>
                  <IonLabel position="floating">Password</IonLabel>
                  <IonInput type="password" name="password" ref={register()} />
                </IonItem>
                <Error message={errors?.password?.message} />
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
