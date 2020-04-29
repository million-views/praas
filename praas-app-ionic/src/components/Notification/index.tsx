import React from 'react';
import { IonToast } from '@ionic/react';
import { useSelector, useDispatch } from 'react-redux';
import { clearNotification } from '../../store/notification';

const Notification: React.FC = () => {
  const notificationState = useSelector((state: any) => state.notification);
  const dispatch = useDispatch();

  const isToastOpen = !!notificationState.message;
  return (
    <IonToast
      isOpen={isToastOpen}
      onDidDismiss={() => dispatch(clearNotification)}
      position="top"
      message={notificationState.message}
      duration={1000}
    />
  );
};

export default Notification;
