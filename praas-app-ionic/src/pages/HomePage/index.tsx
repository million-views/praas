import React, { useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonFab,
  IonFabButton,
} from '@ionic/react';
import { add } from 'ionicons/icons';
import { connect } from 'react-redux';
import Header from '../../components/Header';
import ListItem from '../../components/Conduit/List/ListItem';
import { listConduits } from '../../store/conduit/list';
import { deleteConduit } from '../../store/conduit/del';
import './style.scss';

interface Props {
  conduits: Array<Conduit>;
  listConduits: () => void;
  deleteConduit: (id: string | number) => void;
}

const Home: React.FC<Props> = ({ conduits, listConduits, deleteConduit }) => {
  useEffect(() => {
    listConduits();
  }, []);
  return (
    <IonPage className="home-page">
      <Header />
      <IonContent>
        <IonGrid className="table">
          <IonRow className="table-header">
            <IonCol className="table-header-col">Description</IonCol>
            <IonCol className="table-header-col">Type</IonCol>
            <IonCol className="table-header-col">Service Endpoint</IonCol>
            <IonCol className="table-header-col">Status</IonCol>
            <IonCol className="table-header-col">Action</IonCol>
          </IonRow>
          {!conduits.length && (
            <IonRow key="empty-table" className="table-row">
              <IonCol className="table-col ion-text-center">
                No conduits available.
              </IonCol>
            </IonRow>
          )}
          {conduits.map((conduit) => {
            return (
              <ListItem
                key={conduit.id}
                conduit={conduit}
                onDelete={deleteConduit}
              />
            );
          })}
        </IonGrid>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton href="/conduit/create">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};
const mapStateToProps = ({
  conduit,
}: {
  conduit: { list: { conduits: Array<Conduit> } };
}) => ({
  conduits: conduit.list.conduits,
});
export default connect(mapStateToProps, { listConduits, deleteConduit })(Home);
