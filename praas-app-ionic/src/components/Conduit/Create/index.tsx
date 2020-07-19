import React, { useCallback } from 'react';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/react';
import ConduitForm from '../Form';

import { connect } from 'react-redux';
import { addConduit } from '../../../store/conduit/create';

interface Props {
  addConduit: (conduit: Conduit) => void;
}

const conduit = {
  racm: [],
  allowlist: [], // is optional
  // allowlist: [{ ip: '', comment: '', status: 'inactive' }],
};

const ConduitCreate: React.FC<Props> = ({ addConduit }) => {
  const handleCreate = useCallback(
    (conduit) => {
      addConduit(conduit);
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
        <ConduitForm onSave={handleCreate} conduit={conduit} isCreating />
      </IonCard>
    </IonGrid>
  );
};

export default connect(undefined, { addConduit })(ConduitCreate);
