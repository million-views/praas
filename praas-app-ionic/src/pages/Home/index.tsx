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
              <IonCardTitle>
                <h1>Conduits</h1>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid className="table">
                <IonRow className="table-header">
                  <IonCol className="table-header-col">
                    <h2>Description</h2>
                  </IonCol>
                  <IonCol className="table-header-col">
                    <h2>Type</h2>
                  </IonCol>
                  <IonCol className="table-header-col">
                    <h2>Conduit Endpoint</h2>
                  </IonCol>
                  <IonCol className="table-header-col">
                    <h2>Status</h2>
                  </IonCol>
                  <IonCol className="table-header-col">
                    <h2>Actions</h2>
                  </IonCol>
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
