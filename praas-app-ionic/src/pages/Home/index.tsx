import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import Header from '../../components/Header';

interface Props extends RouteComponentProps {
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
