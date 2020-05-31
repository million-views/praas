import React, { useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButtons,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonText,
} from '@ionic/react';
import { add, createOutline, trashOutline } from 'ionicons/icons';
import { connect } from 'react-redux';
import Header from '../../components/Header';
import { listConduits } from '../../store/conduit/list';
import './style.scss';
import noop from '../../utils/noop';

interface Props {
  conduits: Array<Conduit>;
  listConduits: () => void;
}

const Home: React.FC<Props> = ({ conduits, listConduits }) => {
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
          <IonGrid fixed className="table">
            <IonRow className="table-header">
              <IonCol className="table-header-col">Description</IonCol>
              <IonCol className="table-header-col">Type</IonCol>
              <IonCol className="table-header-col">Service Endpoint</IonCol>
              <IonCol className="table-header-col">Status</IonCol>
              <IonCol className="table-header-col">Action</IonCol>
            </IonRow>

            {conduits.map((conduit) => {
              return (
                <IonRow key={conduit.id} className="table-row">
                  <IonCol className="table-col">{conduit.description}</IonCol>
                  <IonCol className="table-col">{conduit.suriType}</IonCol>
                  <IonCol className="table-col">{conduit.suri}</IonCol>
                  <IonCol className="table-col">{conduit.status}</IonCol>
                  <IonCol className="table-col">
                    <IonButtons>
                      <IonButton
                        type="button"
                        fill="clear"
                        size="small"
                        href={`conduit/${conduit.id}`}
                      >
                        <IonIcon className="icon edit" icon={createOutline} />
                        <i className="far fa-edit"></i>
                      </IonButton>
                      <IonButton
                        type="button"
                        fill="clear"
                        size="small"
                        onClick={noop}
                      >
                        <IonIcon className="icon delete" icon={trashOutline} />
                      </IonButton>
                    </IonButtons>
                  </IonCol>
                </IonRow>
              );
            })}
          </IonGrid>
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
export default connect(mapStateToProps, { listConduits })(Home);
