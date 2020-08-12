import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';

import configureStore from 'store';

// options:
// - initialEntries: An array of `location`s in the history stack. These
//   may be full-blown location objects with `{ pathname, search, hash,
//   state }` or simple string URLs.
// - initialState: initial data for redux store, if any
function renderComponentUnderTest(component, options = {}) {
  const fixture = ({ children }) => {
    const store = configureStore(options.initialState || {});
    const initialEntries = options.initialEntries || ['/'];
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </Provider>
    );
  };

  return {
    ...render(component, { wrapper: fixture })
  };
};

export { renderComponentUnderTest };
