import React from 'react';

import { screen, getNodeText, renderComponentUnderTest } from 'mocks';
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
      // eslint-disable-next-line testing-library/no-debug
      screen.debug(result.container);
    }

    return {
      container: result.container,
    };
  };

  it('should have a branding', async () => {
    renderHeader('/', { inflight: false, loggedIn: false });
    const brand = screen.getByText(/conduits.xyz/i);
    expect(brand).toBeInTheDocument();
    expect(getNodeText(brand)).toMatch(/conduits.xyz/i);
  });

  it('should contextually turn on busy indicator', async () => {
    const { container } = renderHeader(
      '/',
      { inflight: true, loggedIn: false },
      false
    );

    const busyIndicator = container.querySelector(
      '[role="progressbar"][aria-live="polite"][aria-busy="true"]'
    );

    expect(busyIndicator).toBeInTheDocument();
  });

  it('should have signup action when on login path', async () => {
    renderHeader('/login', { inflight: false, loggedIn: false });
    const signup = screen.getByText(/signup/i);
    expect(signup).toBeInTheDocument();
    expect(getNodeText(signup)).toMatch(/signup/i);
  });

  it('should have logout action when logged in', async () => {
    renderHeader('/', { inflight: false, loggedIn: true });
    const logout = screen.getByText(/logout/i);
    expect(logout).toBeInTheDocument();
    expect(getNodeText(logout)).toMatch(/logout/i);
  });

  it('should have signin action when on signup path', async () => {
    renderHeader('/signup', { inflight: false, loggedIn: false });
    const login = screen.getByText(/login/i);
    expect(login).toBeInTheDocument();
    expect(getNodeText(login)).toMatch(/login/i);
  });

  xit('should have a help action', async () => {
    // const { sut } = renderHeader('/', { inflight: false, loggedIn: false });
  });
});
