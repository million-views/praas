import React, { useState } from 'react';
import {
  IonRow,
  IonCol,
  IonButtons,
  IonButton,
  IonIcon,
  IonAlert,
} from '@ionic/react';
import { createOutline, trashOutline } from 'ionicons/icons';

type Props = {
  conduit: Conduit;
  onDelete: (id: string | number) => void;
};
const ListItem = ({ conduit, onDelete }: Props) => {
  const [deletePrompt, setDeletePrompt] = useState(false);
  return (
    <IonRow key={conduit.id} className="table-row">
      <IonCol className="table-col" size="3">
        {conduit.description}
      </IonCol>
      <IonCol className="table-col" size="2">
        {conduit.suriType}
      </IonCol>
      <IonCol className="table-col" size="3">
        {conduit.curi}
      </IonCol>
      <IonCol className="table-col" size="2">
        {conduit.status}
      </IonCol>
      <IonCol className="table-col" size="2">
        <IonButtons>
          <IonButton
            type="button"
            fill="clear"
            size="small"
            href={`conduit/${conduit.id}  `}
          >
            <IonIcon className="icon edit" icon={createOutline} />
            <i className="far fa-edit"></i>
          </IonButton>
          <IonButton
            type="button"
            fill="clear"
            size="small"
            onClick={() => setDeletePrompt(true)}
          >
            <IonIcon className="icon delete" icon={trashOutline} />
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
