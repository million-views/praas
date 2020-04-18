import React from 'react';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
} from '@ionic/react';
import { connect } from 'react-redux';
import { logoutUser } from '../../store/user/login';

type Props = {
  user: any;
  logoutUser: () => void;
};
const Header: React.FC<Props> = ({ user, logoutUser }) => {
  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle>PRAAS</IonTitle>
        <IonButtons slot="end">
          {!user.login.loggedIn && (
            <>
              <IonButton fill="outline" slot="primary" href="/signup">
                Signup
              </IonButton>
              <IonButton fill="outline" href="/signin">
                Signin
              </IonButton>
            </>
          )}
          {user.login.loggedIn && (
            <IonButton fill="outline" slot="primary" onClick={logoutUser}>
              Logout
            </IonButton>
          )}
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

const mapStateToProps = ({ user }: any) => ({
  user,
});
export default connect(mapStateToProps, { logoutUser })(Header);
