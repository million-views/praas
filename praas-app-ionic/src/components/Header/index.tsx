import React from 'react';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle
} from '@ionic/react';

const Header: React.FC = () => {
  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle>PRAAS</IonTitle>
        <IonButtons slot="end">
          <IonButton fill="outline" slot="primary" href="/signup">
            Signup
          </IonButton>
          <IonButton fill="outline" href="/signin">
            Signin
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};
export default Header;
