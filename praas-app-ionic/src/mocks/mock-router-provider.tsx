import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

export const MockRouterProvider: React.FC = ({ children }) => {
  const history = createMemoryHistory();
  return <Router history={history}>{children}</Router>;
};
