import React from 'react';

import {
  screen, waitFor, waitForElementToBeRemoved
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderComponentUnderTest } from 'mocks';
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
    return renderComponentUnderTest(
      <Login data="pony-foo" />,
      { initialEntries: ['/login'] }
    );
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

  // FIXME!
  // At the moment Formik and Browser behaviours are not in sync. We have to
  // type something and then press submit to see the error message.
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
    // FIXME! either formik or rtl is eating space!
    expect(email).toHaveAttribute('value', 'Hello,World!');
    await waitFor(() => {
      const emailCheck = screen.getByText(/invalid email address/i);
      expect(emailCheck).toBeInTheDocument();
      expect(emailCheck).toHaveClass('error');
      expect(submit).toBeDisabled();
    });

    // type short password
    userEvent.type(password, 'pas');
    expect(password).toHaveAttribute('value', 'pas');
    await waitFor(() => {
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
      expect(email).toHaveAttribute('value', 'tester@testing.paradise');
      expect(password).toHaveAttribute('value', 'password');
      expect(submit).toBeEnabled();
    });
  });

  it('should display error message on login failure', async () => {
    renderPage();
    const { email, password, submit } = subjectsUnderTest();

    userEvent.type(email, 'tester@testing.paradise');
    userEvent.type(password, 'password');
    userEvent.click(submit);
    await waitFor(() => {
      const serverError = screen.getByText(/email or password is invalid/i);
      expect(serverError).toBeInTheDocument();
    });
  });

  it('should navigate to main view on login success', async () => {
    renderPage();
    const { email, password, submit } = subjectsUnderTest();

    userEvent.type(email, 'user@example.org');
    userEvent.type(password, '709$3cR31');

    const signup = screen.getByText(/signup/i);
    expect(signup).toBeInTheDocument();
    userEvent.click(submit);

    await waitForElementToBeRemoved(signup);
    // signup is gone from dom! instead of looking for its absence
    // check for the presence of another element that appears due
    // to state transition

    await waitFor(() => {
      const logout = screen.getByText(/logout/i);
      expect(logout).toBeInTheDocument();
      expect(logout).toHaveClass('icon-logout');
    });
  });
});
