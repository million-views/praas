import React, { useCallback } from 'react';
import { IonGrid } from '@ionic/react';
import ConduitForm from '../Form';

import { connect } from 'react-redux';
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
    <IonGrid>
      <ConduitForm onSave={handleCreate} conduit={conduit} />
    </IonGrid>
  );
};

export default connect(undefined, { addConduit })(ConduitCreate);
