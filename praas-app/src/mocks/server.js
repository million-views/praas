import { setupServer } from 'msw/node';
import { rest } from 'msw';

import { handlers } from './server-handlers';

// mock the server:
// requests to server are intercepted and directed to handlers that mimic
// server responses
const server = setupServer(...handlers);

// ideally all mock handlers should go into `server-handlers`; in case
// we need to override a mocked handler, a test can do so by using these
// two exports - readup msw docs on how.
export { server, rest };
