import React, { useState } from 'react';
import {
  IonRow,
  IonCol,
  IonButtons,
  IonButton,
  IonIcon,
  IonAlert,
  IonRouterLink,
} from '@ionic/react';
import { createOutline, trashOutline } from 'ionicons/icons';

import './style.scss';

type Props = {
  conduit: Conduit;
  onDelete: (id: string | number) => void;
};
const ListItem = ({ conduit, onDelete }: Props) => {
  const [deletePrompt, setDeletePrompt] = useState(false);
  return (
    <IonRow key={conduit.id} className="table-row ion-align-items-center">
      <IonCol className="table-col" size="3">
        {conduit.description}
      </IonCol>
      <IonCol className="table-col" size="2">
        {conduit.suriType}
      </IonCol>
      <IonCol className="table-col" size="3">
        {conduit.curi}
      </IonCol>
      <IonCol className="table-col ion-text-capitalize" size="2">
        {conduit.status}
      </IonCol>
      <IonCol className="table-col" size="2">
        <IonButtons>
          <IonButton
            type="button"
            fill="clear"
            size="small"
            color="dark"
            className="ion-button--round"
            href={`conduit/${conduit.id}`}
            routerDirection="forward"
          >
            <IonIcon icon={createOutline} slot="icon-only" />
          </IonButton>
          <IonButton
            type="button"
            fill="clear"
            size="small"
            onClick={() => setDeletePrompt(true)}
          >
            <IonIcon
              className="home-page__icon--delete"
              icon={trashOutline}
              slot="icon-only"
            />
          </IonButton>
          <IonAlert
            isOpen={deletePrompt}
            header="Delete Conduit"
            message="Are you sure you want to delete?"
            onDidDismiss={() => setDeletePrompt(false)}
            buttons={[
              'Cancel',
              {
                text: 'Delete',
                role: 'delete',
                cssClass: 'list-item__alert-button--delete',
                handler: () => onDelete(conduit.id),
              },
            ]}
          />
        </IonButtons>
      </IonCol>
    </IonRow>
  );
};

export default ListItem;
