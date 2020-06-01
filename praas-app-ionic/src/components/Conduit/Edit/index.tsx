import React, { useEffect, useCallback } from 'react';
import { IonGrid, IonRow, IonCol, IonCard } from '@ionic/react';
import { RouteComponentProps } from 'react-router';
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
    <IonGrid>
      {conduit?.id ? (
        <IonRow className="ion-justify-content-center">
          <IonCol sizeXs="12" sizeXl="8">
            <IonCard>
              <ConduitForm onSave={handleUpdate} conduit={conduit} />
            </IonCard>
          </IonCol>
        </IonRow>
      ) : null}
    </IonGrid>
  );
};
const mapStateToProps = ({ conduit }: any) => ({
  conduit: conduit?.current?.item,
});
export default connect(mapStateToProps, { getConduit, updateConduit })(Conduit);
