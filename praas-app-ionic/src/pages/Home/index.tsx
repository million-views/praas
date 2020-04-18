import React, { useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import Header from '../../components/Header';

type Props = {
  user: any;
};
const Home: React.FC<Props & RouteComponentProps> = ({ user, history }) => {
  useEffect(() => {
    if (!user.login.loggedIn) history.replace('/signin');
  }, [user, history]);
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
export default connect(mapStateToProps)(withRouter(Home));
