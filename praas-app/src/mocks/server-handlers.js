import { rest } from 'msw';

// Mock resource server REST API.
//
// Recommnded reading:
// - https://kentcdodds.com/blog/unit-vs-integration-vs-e2e-tests
// - https://kentcdodds.com/blog/how-to-know-what-to-test
// - https://kentcdodds.com/blog/make-your-test-fail
// - https://kentcdodds.com/blog/write-tests
//

const login = (req, res, ctx) => {
  // console.log('-->>', req.body);
  const errorResponse = {
    errors: {
      credentials: 'email or password is invalid'
    }
  };

  const successResponse = {
    user: {
      id: 5,
      firstName: 'User',
      lastName: '',
      email: req.body.email,
      token: 'header.payload.signature'
    }
  };

  const { email, password } = req.body.user;
  if (email === 'user@example.org' && password === '709$3cR31') {
    return res(ctx.json(successResponse));
  } else {
    return res(
      ctx.status(422, 'You are so good!'),
      ctx.json(errorResponse)
    );
  }
};

const signup = (req, res, ctx) => {
  const errorResponse = {
    errors: {
      email: 'email must be unique'
    }
  };

  const successResponse = {
    user: {
      id: 6,
      firstName: 'User',
      lastName: '',
      email: req.body.email,
      token: 'header.payload.signature'
    }
  };

  const { firstName, email, password } = req.body.user;
  if (firstName === 'User' && email === 'user2@example.org' && password === '709$3cR31') {
    return res(ctx.json(successResponse));
  } else {
    return res(
      ctx.status(422, 'You are so good!'),
      ctx.json(errorResponse)
    );
  }
};

export const handlers = [
  rest.post('/users/login', login),
  rest.post('/users', signup),
];
