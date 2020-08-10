import React from 'react';

import { MockRouterProvider } from './mock-router-provider';
import { MockStoreProvider } from './mock-store-provider';

function MockProvider({ children }) {
  return (
    <MockStoreProvider>
      <MockRouterProvider>
        {children}
      </MockRouterProvider>
    </MockStoreProvider>
  );
};

export { MockProvider };
