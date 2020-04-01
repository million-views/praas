import React, { useState } from 'react';
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
import Header from '../../components/Header';
import { signup } from '../../services/api';
import './style.scss';

const Signup: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    signup({ firstName, email, password });
  };
  return (
    <IonPage>
      <Header />
      <IonContent>
        <form noValidate onSubmit={handleFormSubmit}>
          <IonGrid>
            <IonRow className="ion-justify-content-center">
              <IonCol sizeXs="12" sizeSm="4">
                <IonItem>
                  <IonLabel position="floating">Name</IonLabel>
                  <IonInput
                    type="text"
                    onIonChange={event => {
                      setFirstName(event.detail.value!);
                    }}
                    value={firstName}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={email}
                    onIonChange={event => {
                      setEmail(event.detail.value!);
                    }}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="floating">Password</IonLabel>
                  <IonInput
                    type="password"
                    value={password}
                    onIonChange={event => {
                      setPassword(event.detail.value!);
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

export default Signup;
