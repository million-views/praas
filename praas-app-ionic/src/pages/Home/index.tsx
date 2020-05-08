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
} from '@ionic/react';
import { createOutline, trashOutline } from 'ionicons/icons';
import { connect } from 'react-redux';
import Header from '../../components/Header';
import { listConduits } from '../../store/conduit/list';
import './style.scss';

interface Props {
  conduits: Array<any>;
  listConduits: () => void;
}

const Home: React.FC<Props> = ({ conduits, listConduits }) => {
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
            <IonRow className="table-row">
              <IonCol className="table-col ion-text-center">
                No conduits available.
              </IonCol>
            </IonRow>
          )}
          {conduits.map((conduit) => {
            return (
              <IonRow className="table-row">
                <IonCol className="table-col">{conduit.description}</IonCol>
                <IonCol className="table-col">{conduit.suriType}</IonCol>
                <IonCol className="table-col">{conduit.suri}</IonCol>
                <IonCol className="table-col">{conduit.state}</IonCol>
                <IonCol className="table-col">
                  <IonButtons>
                    <IonButton
                      type="button"
                      fill="clear"
                      size="small"
                      href={`conduit/${conduit.id}  `}
                    >
                      <IonIcon className="icon edit" icon={createOutline} />
                      <i className="far fa-edit"></i>
                    </IonButton>
                    <IonButton
                      type="button"
                      fill="clear"
                      size="small"
                      onClick={() => {}}
                    >
                      <IonIcon className="icon delete" icon={trashOutline} />
                    </IonButton>
                  </IonButtons>
                </IonCol>
              </IonRow>
            );
          })}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
const mapStateToProps = ({ conduit }: any) => ({
  conduits: conduit?.list?.conduits || [],
});
export default connect(mapStateToProps, { listConduits })(Home);
