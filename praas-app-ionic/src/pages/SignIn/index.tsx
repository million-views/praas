import React from 'react';
import { IonContent, IonPage, IonGrid } from '@ionic/react';
import './style.scss';
import Header from '../../components/Header';

const SignIn: React.FC = () => {
  return (
    <IonPage>
      <Header />
      <IonContent>
        <IonGrid></IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default SignIn;
