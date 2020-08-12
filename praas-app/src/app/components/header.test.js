import React from 'react';

import {
  screen, // , // waitFor, waitForElementToBeRemoved
  getNodeText
} from '@testing-library/react';
// import userEvent from '@testing-library/user-event';

import { renderComponentUnderTest } from 'mocks';
import Header from './header';

describe('Header Component', () => {
  // RTL tries very hard to drive home the point that our underlying mark
  // up is not in anyway close to being semantic, by providing a limited
  // set of methods to query the dom on the `screen` object.
  // As we learn more about RTL and the right way to do it, this code may
  // get refactored...
  //
  // For now the emerging pattern that keeps us moving is to return the
  // container and sut object that contains subjects under test. This method
  // can be made generic to suit other test suites.
  //
  // NOTE: RTL seems to be edgy in how it treats aria roles and labels
  const renderHeader = (path, login, dump = false) => {
    const initialState = {
      user: { login }
    };

    const result = renderComponentUnderTest(
      <Header />,
      { initialEntries: [path], initialState }
    );

    if (dump) {
      screen.debug(result.container);
    }

    // fetch the subjects under test and return them in `sut`
    const brand = result.container.querySelector(
      'div>nav>a>span'
    );
    const busyIndicator = result.container.querySelector(
      '[role="progressbar"][aria-live="polite"][aria-busy="true"]'
    );

    return {
      container: result.container,
      sut: {
        brand, busyIndicator,
      }
    };
  };

  it('should have a branding', async () => {
    const { sut } = renderHeader('/', { inflight: false, loggedIn: false });
    expect(sut.brand).toBeInTheDocument();
    expect(getNodeText(sut.brand)).toMatch(/conduits.xyz/i);
  });

  it('should contextually turn on busy indicator', async () => {
    const { sut } = renderHeader('/', { inflight: true, loggedIn: false });

    /* eslint testing-library/no-debug: 0 */
    // screen.debug(sut.busyIndicator);
    expect(sut.busyIndicator).toBeInTheDocument();
  });

  it('should have logout action when logged in', async () => {
    // const { sut } = renderHeader('/', { inflight: false, loggedIn: false });
  });

  it('should have signup action when on login path', async () => {
    // const { sut } = renderHeader('/', { inflight: false, loggedIn: false });
  });

  it('should have signin action when on signup path', async () => {
    // const { sut } = renderHeader('/', { inflight: false, loggedIn: false });
  });

  xit('should have a help action', async () => {
    // const { sut } = renderHeader('/', { inflight: false, loggedIn: false });
  });
});
