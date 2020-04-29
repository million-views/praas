import React from 'react';
import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useDispatch } from 'react-redux';

import AuthenticatedRoute from './components/AuthenticatedRoute';
import Signup from './pages/Signup';
import LoginPage from './pages/Login';
import Home from './pages/Home';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './styles/common.scss';
import Notification from './components/Notification';
import { createSuccessNotification } from './store/notification';

const App: React.FC = () => {
  const dispatch = useDispatch();
  dispatch(createSuccessNotification('hello world'));
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/signup" component={Signup} />
          <Route exact path="/login" component={LoginPage} />
          <AuthenticatedRoute exact path="/" component={Home} />
        </IonRouterOutlet>
      </IonReactRouter>
      <Notification />
    </IonApp>
  );
};

export default App;
