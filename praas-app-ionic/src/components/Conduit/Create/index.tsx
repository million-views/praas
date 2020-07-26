import React, { useCallback } from 'react';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react';
import ConduitForm from '../Form';

import { connect } from 'react-redux';
import { addConduit } from '../../../store/conduit/create';
import { RouteComponentProps } from 'react-router';

interface Props extends RouteComponentProps {
  addConduit: (conduit: Conduit) => void;
}

const conduit = {
  racm: [],
  status: 'inactive',
};

const ConduitCreate: React.FC<Props> = ({ history, addConduit }) => {
  const handleCreate = useCallback(
    (conduit) => {
      (addConduit(conduit) as any).then((response: any) => {
        if (response.conduit) {
          history.replace('/');
        }
      });
    },
    [addConduit]
  );
  return (
    <IonGrid fixed>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>
            <h1>Create Conduit</h1>
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <ConduitForm onSave={handleCreate} conduit={conduit} />
        </IonCardContent>
      </IonCard>
    </IonGrid>
  );
};

export default connect(undefined, { addConduit })(ConduitCreate);
