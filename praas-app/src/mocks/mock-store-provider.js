import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'store';

export function MockStoreProvider({ children }) {
  const mockStore = configureStore({
    /* test data, if any, goes here */
  });
  return <Provider store={mockStore}>{children}</Provider>;
};
