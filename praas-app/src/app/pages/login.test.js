import React from 'react';

import {
  screen, waitFor, waitForElementToBeRemoved,
  userEvent,
  renderComponentUnderTest
} from 'mocks';
import Login from './login';

// TODO:
// - revisit these tests after we redesign the UI to be ARIA compliant
// - follow best practices and avoid common mistakes as outlined at:
//  - https://testing-library.com/docs/guide-which-query
//  - https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
describe('Login Page', () => {
  const subjectsUnderTest = () => {
    const heading = screen.getByRole('heading', {
      name: /login to your account/i
    });

    const email = screen.getByPlaceholderText(/email - jane@test.com/i);
    const password = screen.getByPlaceholderText(/password/i);
    const submit = screen.getByRole('button', { name: /submit/i });
    return { heading, email, password, submit };
  };

  const renderPage = () => {
    const result = renderComponentUnderTest(
      <Login data="pony-foo" />,
      { initialEntries: ['/login'] }
    );

    return {
      container: result.container,
    };
  };

  it('should render login form', async () => {
    renderPage();
    const { heading, email, password, submit } = subjectsUnderTest();

    expect(heading).toBeInTheDocument();
    expect(email).toBeInTheDocument();
    expect(password).toBeInTheDocument();
    expect(submit).toBeInTheDocument();
    expect(submit).toBeDisabled();
  });

  it('should disallow form submit action on validation errors', async () => {
    renderPage();
    const { email, password, submit } = subjectsUnderTest();
    // click on email, type anything, clear and tab out to trigger error(s)
    userEvent.click(email);
    expect(email).toHaveFocus();
    userEvent.type(email, 'will be cleared{backspace}{backspace}');
    userEvent.clear(email);
    userEvent.tab();

    await waitFor(() => {
      const emailCheck = screen.getByText(/email is required/i);
      expect(emailCheck).toBeInTheDocument();
      expect(submit).toBeDisabled();
    });

    // type invalid email and tab out to trigger error(s)
    userEvent.type(email, 'Hello, World!');
    await waitFor(() => {
      // FIXME! rtl is eating space; dig more into normalizer options
      expect(email.value).toBe('Hello,World!');

      const emailCheck = screen.getByText(/invalid email address/i);
      expect(emailCheck).toBeInTheDocument();
      expect(emailCheck).toHaveClass('error');
      expect(submit).toBeDisabled();
    });

    // type short password
    userEvent.type(password, 'pas');
    await waitFor(() => {
      expect(password.value).toBe('pas');
      const passwordCheck = screen.getByText(/password too short/i);
      expect(passwordCheck).toBeInTheDocument();
      expect(passwordCheck).toHaveClass('error');
      expect(submit).toBeDisabled();
    });

    // fill in correct details, submit button should be enabled
    userEvent.clear(email);
    userEvent.clear(password);

    userEvent.type(email, 'tester@testing.paradise');
    userEvent.type(password, 'password');

    await waitFor(() => {
      expect(email.value).toBe('tester@testing.paradise');
      expect(password.value).toBe('password');
      expect(submit).toBeEnabled();
    });
  });

  it('should display error message on login failure', async () => {
    renderPage();
    const { email, password, submit } = subjectsUnderTest();
    // eslint-disable-next-line testing-library/no-debug
    // screen.debug(email);
    userEvent.type(email, 'tester@testing.paradise');
    userEvent.type(password, 'password');

    await waitFor(() => {
      expect(email.value).toBe('tester@testing.paradise');
      expect(password.value).toBe('password');
      expect(submit).toBeEnabled();
    });

    userEvent.click(submit);

    await waitFor(() => {
      const serverError = screen.getByText(/email or password is invalid/i);
      expect(serverError).toBeInTheDocument();
    });
  });

  it('should navigate to main view on login success', async () => {
    renderPage();
    const { email, password, submit } = subjectsUnderTest();

    // look for a known anchor on this page...
    const signup = screen.getByText(/signup/i);
    expect(signup).toBeInTheDocument();

    userEvent.type(email, 'user@example.org');
    userEvent.type(password, '709$3cR31');
    await waitFor(() => {
      expect(email.value).toBe('user@example.org');
      expect(password.value).toBe('709$3cR31');
      expect(submit).toBeEnabled();
    });

    // signup should be gone from dom, since login navigates to home...
    userEvent.click(submit);

    // this fails with RHF but works with Formik
    // await waitForElementToBeRemoved(signup);

    // this doesn't work either...
    // await waitForElementToBeRemoved(() => signup);

    // this works... moving on...it is probably a doc bug!
    await waitForElementToBeRemoved(() => screen.getByText(/signup/i));

    // ... instead of checking for 'signup's absence (because you can't ?)
    // check for presence of an element that appears due to state transition
    await waitFor(() => {
      const logout = screen.getByText(/logout/i);
      expect(logout).toBeInTheDocument();
      expect(logout).toHaveClass('icon-logout');
    });
  });
});
