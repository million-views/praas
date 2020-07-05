import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { RouteComponentProps, Route, Switch } from 'react-router';
import Header from '../../components/Header';
import EditConduit from '../../components/Conduit/Edit';
import CreateConduit from '../../components/Conduit/Create';

type MatchParams = {
  id: string;
};
interface Props extends RouteComponentProps<MatchParams> {}

const Conduit: React.FC<Props> = ({ match }) => {
  const { path } = match;

  return (
    <IonPage className="conduit-detail-page">
      <Header />
      <IonContent>
        <Switch>
          <Route exact path={`${path}/create`} component={CreateConduit} />
          <Route exact path={`${path}/:id`} component={EditConduit} />
        </Switch>
      </IonContent>
    </IonPage>
  );
};

export default Conduit;
