import React from 'react';
import { render, screen } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';
import { act } from 'react-dom/test-utils';
import SignupPage from '../index';
import { MockRouterProvider, MockStoreProvider } from '../../../mocks';

const server = setupServer(
  rest.post('http://localhost:4000/users/', (req, res, ctx) => {
    return res(
      ctx.json({
        user: {
          id: 5,
          firstName: 'Bob',
          lastName: null,
          email: 'user@example.org',
          token: 'header.payload.signature',
        },
      })
    );
  })
);

const ProviderWrapper: React.FC = ({ children }) => {
  return (
    <MockRouterProvider>
      <MockStoreProvider>{children}</MockStoreProvider>;
    </MockRouterProvider>
  );
};

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Signup Page', () => {
  it('should render the page', async () => {
    const { baseElement } = render(<SignupPage />, {
      wrapper: ProviderWrapper,
    });
    expect(baseElement).toBeDefined();
    const firstName = await screen.findByTitle('First Name');
    const email = await screen.findByTitle('Email');
    const password = await screen.findByTitle('Password');
    const submitButton = await screen.findByText('Submit');
    expect(firstName).toBeInTheDocument();
    expect(email).toBeInTheDocument();
    expect(password).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('should have required form errors', async () => {
    render(<SignupPage />, {
      wrapper: ProviderWrapper,
    });

    const submitButton = await screen.findByText('Submit');

    await act(async () => {
      fireEvent.submit(submitButton);
    });

    const firstNameError = await screen.findByText(
      'Must be longer than 2 characters'
    );
    const emailError = await screen.findByText('Email is required');
    const passwordError = await screen.findByText(
      'Must be longer than 8 characters'
    );
    expect(firstNameError).toBeInTheDocument();
    expect(emailError).toBeInTheDocument();
    expect(passwordError).toBeInTheDocument();
  });

  it('should have invalid form errors', async () => {
    render(<SignupPage />, {
      wrapper: ProviderWrapper,
    });

    const firstName = await screen.findByTitle('First Name');
    const email = await screen.findByTitle('Email');
    const password = await screen.findByTitle('Password');
    fireEvent.ionChange(firstName, 'S');
    fireEvent.ionChange(email, 'invalid email');
    fireEvent.ionChange(password, '1');
    const submitButton = await screen.findByText('Submit');

    await act(async () => {
      fireEvent.submit(submitButton);
    });

    const firstNameError = await screen.findByText(
      'Must be longer than 2 characters'
    );
    const emailError = await screen.findByText('Invalid email address');
    const passwordError = await screen.findByText(
      'Must be longer than 8 characters'
    );
    expect(firstNameError).toBeInTheDocument();
    expect(emailError).toBeInTheDocument();
    expect(passwordError).toBeInTheDocument();
  });

  it('should have submit valid form', async () => {
    const replaceMock = jest.fn();
    const props = {
      history: { replace: replaceMock },
    };
    render(<SignupPage {...props} />, {
      wrapper: ProviderWrapper,
    });

    const firstName = await screen.findByTitle('First Name');
    const email = await screen.findByTitle('Email');
    const password = await screen.findByTitle('Password');
    fireEvent.ionChange(firstName, 'Bob');
    fireEvent.ionChange(email, 'user@example.org');
    fireEvent.ionChange(password, '709$3cR31');

    expect(firstName).toHaveValue('Bob');
    expect(email).toHaveValue('user@example.org');
    expect(password).toHaveValue('709$3cR31');

    const submitButton = await screen.findByText('Submit');

    await act(async () => {
      fireEvent.submit(submitButton);
    });

    await act(async () => {}); // required to force redux changes

    expect(replaceMock).toBeCalledTimes(1);
    expect(replaceMock).toBeCalledWith('/');
  });
});
