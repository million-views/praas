import React, { useEffect, useCallback } from 'react';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react';
import { RouteComponentProps, Redirect } from 'react-router';
import { connect } from 'react-redux';
import { getConduit } from '../../../store/conduit/get';
import { updateConduit } from '../../../store/conduit/edit';
import ConduitForm from '../Form';

type MatchParams = {
  id: string;
};
interface Props extends RouteComponentProps<MatchParams> {
  conduit: Conduit;
  getConduit: (id: string) => void;
  updateConduit: (conduit: Conduit) => void;
}

const Conduit: React.FC<Props> = ({
  match,
  conduit,
  getConduit,
  updateConduit,
}) => {
  const {
    params: { id },
  } = match;

  useEffect(() => {
    getConduit(id);
  }, []);

  const handleUpdate = useCallback(
    (conduit) => {
      updateConduit({ ...conduit, id });
    },
    [id, updateConduit]
  );

  return (
    <IonGrid fixed>
      {conduit?.id ? (
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <h1>Edit Conduit</h1>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <ConduitForm onSave={handleUpdate} conduit={conduit} />
          </IonCardContent>
        </IonCard>
      ) : null}
    </IonGrid>
  );
};
const mapStateToProps = ({ conduit }: any) => ({
  conduit: conduit?.current?.item,
});
export default connect(mapStateToProps, { getConduit, updateConduit })(Conduit);
