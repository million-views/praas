import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { connect } from 'react-redux';
import Header from '../../components/Header';

interface Props {
  user: any;
}

const Home: React.FC<Props> = ({ user }) => {
  return (
    <IonPage>
      <Header />
      <IonContent>Home Page</IonContent>
    </IonPage>
  );
};
const mapStateToProps = ({ user }: any) => ({
  user,
});
export default connect(mapStateToProps)(Home);
