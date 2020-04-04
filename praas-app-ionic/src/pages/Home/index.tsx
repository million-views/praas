import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import Header from '../../components/Header';
const Home: React.FC = () => {
  return (
    <IonPage>
      <Header />
      <IonContent>Home Page</IonContent>
    </IonPage>
  );
};

export default Home;
