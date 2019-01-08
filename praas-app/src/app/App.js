import React from 'react';
import { Router } from '@reach/router';
import { Header } from 'components';
import Signup from './routes/signup';

const App = () => (
  <div>
    <Router>
      <Home path="/" />
      <Signup path="signup" />
    </Router>
  </div>
);

const Home = () => (
  <div>
    <Header title="Conduits - pipe data to your storage" />
    <h2>A conduit is a handle to a RESTful service endpoint</h2>
  </div>
);

export default App;
