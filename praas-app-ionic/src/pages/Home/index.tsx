import React, { useEffect, ReactText } from 'react';
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonFab,
  IonFabButton,
  IonText,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/react';
import { add, createOutline, trashOutline } from 'ionicons/icons';
import { connect } from 'react-redux';
import Header from '../../components/Header';
import { listConduits } from '../../store/conduit/list';
import './style.scss';
import ListItem from '../../components/Conduit/List/ListItem';
import { deleteConduit } from '../../store/conduit/del';

interface Props {
  conduits: Array<Conduit>;
  listConduits: () => void;
  deleteConduit: (id: ReactText) => void;
}

const Home: React.FC<Props> = ({ conduits, listConduits, deleteConduit }) => {
  useEffect(() => {
    listConduits();
  }, []);

  return (
    <IonPage>
      <Header />
      <IonContent className="home-page">
        {!conduits.length && (
          <IonRow className="ion-justify-content-center no-conduits">
            <IonCol className="ion-text-center">
              <IonText>
                <h3>
                  You have no conduits available. Click on the + button to
                  create one
                </h3>
              </IonText>
            </IonCol>
          </IonRow>
        )}
        {!!conduits.length && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Conduits</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid className="table">
                <IonRow className="ion-margin-bottom table-header">
                  <IonCol className="table-header-col">Description</IonCol>
                  <IonCol className="table-header-col">Type</IonCol>
                  <IonCol className="table-header-col">Conduit Endpoint</IonCol>
                  <IonCol className="table-header-col">Status</IonCol>
                  <IonCol className="table-header-col">Actions</IonCol>
                </IonRow>
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
            </IonCardContent>
          </IonCard>
        )}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton color="primary" href="/conduit/create">
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
