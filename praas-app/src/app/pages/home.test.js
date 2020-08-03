// import '@testing-library/jest-dom';
// import React from 'react';
// import { rest } from 'msw';
// import { setupServer } from 'msw/node';
// import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import Login from '../src/components/Login';

// const fakeUserResponse = { token: 'mocked_user_token' };

// const server = setupServer(
//   rest.post('/login', (req, res, ctx) => {
//     // Respond with a mocked user token that gets persisted
//     // in the `sessionStorage` by the `Login` component.
//     return res(ctx.json({ token: 'mocked_user_token' }));
//   })
// );

// // Enable API mocking before tests.
// beforeAll(() => server.listen());

// // Reset any runtime request handlers we may add during the tests.
// afterEach(() => server.resetHandlers());

// // Disable API mocking after the tests are done.
// afterAll(() => server.close());

// test('allows the user to log in', async () => {
//   render(<Login />);
//   userEvent.type(
//     screen.getByRole('textbox', { name: /username/i }),
//     'john.maverick'
//   );
//   userEvent.type(
//     screen.getByRole('textbox', { name: /password/i }),
//     'super-secret'
//   );
//   userEvent.click(screen.getByText(/submit/i));
//   const alert = await screen.findByRole('alert');

//   // Assert successful login state
//   expect(alert).toHaveTextContent(/welcome/i);
//   expect(window.sessionStorage.getItem('token')).toEqual(fakeUserResponse.token);
// });

// test('handles login exception', () => {
//   server.use(
//     rest.post('/login', (req, res, ctx) => {
//       // Respond with "500 Internal Server Error" status for this test.
//       return res(
//         ctx.status(500),
//         ctx.json({ message: 'Internal Server Error' })
//       );
//     })
//   );

//   render(<Login />);
//   userEvent.type(
//     screen.getByRole('textbox', { name: /username/i }),
//     'john.maverick'
//   );
//   userEvent.type(
//     screen.getByRole('textbox', { name: /password/i }),
//     'super-secret'
//   );
//   userEvent.click(screen.getByText(/submit/i));

//   // Assert meaningful error message shown to the user
//   expect(alert).toHaveTextContent(/sorry, something went wrong/i);
//   expect(window.sessionStorage.getItem('token')).toBeNull();
// });
