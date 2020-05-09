import React, { useCallback } from 'react';
import { IonPage, IonContent, IonGrid } from '@ionic/react';
import ConduitForm from '../Form';

import { connect } from 'react-redux';
import Header from '../../../components/Header';
import { addConduit } from '../../../store/conduit/create';

interface Props {
  addConduit: (conduit: any) => void;
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
    <IonPage className="conduit-create-page">
      <Header />
      <IonContent>
        <IonGrid>
          <ConduitForm onSave={handleCreate} conduit={conduit} />
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default connect(undefined, { addConduit })(ConduitCreate);
