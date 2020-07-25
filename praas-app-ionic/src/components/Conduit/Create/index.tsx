import React, { useCallback } from 'react';
import { IonGrid, IonRow, IonCol, IonCard } from '@ionic/react';
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
