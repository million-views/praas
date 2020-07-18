import React, { useEffect } from 'react';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonButton,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { useForm, FormContext } from 'react-hook-form';
import Header from '../../components/Header';
import Input from '../../components/Form/Input';
import FormFieldWithError from '../../components/FormFieldWithError';
import { loginUser } from '../../store/user/login';
import signinSchema from './schema';

import './style.scss';

interface Props extends RouteComponentProps {
  user: any;
  loginUser: (data: any) => void;
}

export const LoginPage: React.FC<Props> = (props) => {
  const { user, loginUser, history } = props;
  const formMethods = useForm({
    defaultValues: { email: '', password: '' },
    validationSchema: signinSchema,
  });

  const { handleSubmit, errors } = formMethods;

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
        <IonGrid fixed>
          <IonRow className="ion-justify-content-center">
            <IonCol sizeXs="12" sizeXl="8">
              <IonCard>
                <IonCardHeader className="ion-text-center">
                  <IonCardTitle color="dark">Login</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <FormContext {...formMethods}>
                    <form noValidate onSubmit={handleSubmit(onSubmit)}>
                      <IonGrid>
                        <IonRow>
                          <IonCol>
                            <FormFieldWithError error={errors.email}>
                              <IonLabel position="floating">Email</IonLabel>
                              <Input
                                type="email"
                                name="email"
                                value=""
                                title="Email"
                              />
                            </FormFieldWithError>
                            <FormFieldWithError error={errors.password}>
                              <IonLabel position="floating">Password</IonLabel>
                              <Input
                                type="password"
                                name="password"
                                value=""
                                title="Password"
                              />
                            </FormFieldWithError>
                            <IonButton
                              type="submit"
                              color="primary"
                              expand="full"
                            >
                              Submit
                            </IonButton>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </form>
                  </FormContext>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

const mapStateToProps = ({ user }: any) => {
  return { user };
};

export default connect(mapStateToProps, { loginUser })(LoginPage);
