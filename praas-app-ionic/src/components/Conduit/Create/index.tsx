import React, { useCallback } from 'react';
import { IonGrid, IonRow, IonCol, IonCard } from '@ionic/react';
import ConduitForm from '../Form';

import { connect } from 'react-redux';
import { addConduit } from '../../../store/conduit/create';

interface Props {
  addConduit: (conduit: Conduit) => void;
}

const conduit = {};

const ConduitCreate: React.FC<Props> = ({ addConduit }) => {
  const handleCreate = useCallback(
    (conduit) => {
      addConduit(conduit);
    },
    [addConduit]
  );
  return (
    <IonGrid>
      <IonRow className="ion-justify-content-center">
        <IonCol sizeXs="12" sizeXl="8">
          <IonCard>
            <ConduitForm onSave={handleCreate} conduit={conduit} />
          </IonCard>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default connect(undefined, { addConduit })(ConduitCreate);
