import React from 'react';
import { Router } from '@reach/router';

const App = () => (
  <Router>
    <Home path="/" />
    <Test path="test" />
  </Router>
);

const Home = () => (
  <div>
    <h2> Welcome </h2>
  </div>
);

const Test = () => (
  <div>
    <h2> Welcome test </h2>
  </div>
);

export default App;
