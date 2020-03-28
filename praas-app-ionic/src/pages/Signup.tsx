import React from 'react';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonTitle } from '@ionic/react';
class Signup extends React.Component {
  render() {
    return (
      <>
        <IonHeader>
          <IonToolbar>
            <IonTitle>PRAAS</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="outline" slot="primary" href="/signup">
                Signup
              </IonButton>
              <IonButton fill="outline" href="/login">
                Login
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
      </>
    )
  }
}

export default Signup;