import React, { useEffect, useCallback } from 'react';
import { IonPage, IonContent, IonGrid } from '@ionic/react';
import { RouteComponentProps } from 'react-router';

import { connect } from 'react-redux';
import Header from '../../components/Header';
import { getConduit } from '../../store/conduit/get';
import { updateConduit } from '../../store/conduit/edit';
import EditConduit from './Edit';

type MatchParams = {
  id: string;
};
interface Props extends RouteComponentProps<MatchParams> {
  conduit: Array<any>;
  getConduit: (id: string) => void;
  updateConduit: (conduit: any) => void;
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
    <IonPage className="conduit-detail-page">
      <Header />
      <IonContent>
        <IonGrid>
          <EditConduit onUpdate={handleUpdate} conduit={conduit} />
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
const mapStateToProps = ({ conduit }: any) => ({
  conduit: conduit?.current?.item,
});
export default connect(mapStateToProps, { getConduit, updateConduit })(Conduit);
