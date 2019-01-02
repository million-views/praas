import React from 'react';
import { Router } from '@reach/router';

const App = () => (
  <Router>
    <Home path="/" />
  </Router>
);

const Home = () => (
  <div>
    <h2> Welcome </h2>
  </div>
);

export default App;
