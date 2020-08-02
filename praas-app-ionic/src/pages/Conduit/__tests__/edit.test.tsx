import React from 'react';
import { render, screen } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';
import { act } from 'react-dom/test-utils';
import ConduitPage from '../index';
import { MockRouterProvider, MockStoreProvider } from '../../../mocks';
import { wrap } from 'module';

let apiCalledTimes: number = 0;
const server = setupServer(
  rest.get('http://localhost:4000/conduits/1', (req, res, ctx) => {
    return res(
      ctx.json({
        conduit: {
          id: 1,
          suriApiKey: 'SECRET',
          suriType: 'Airtable',
          suriObjectKey: 'asdf',
          curi: 'td-obj7u.trickle.cc',
          allowlist: [],
          racm: ['POST'],
          throttle: true,
          status: 'active',
          description: 'Description',
          hiddenFormField: [],
          userId: 1,
        },
      })
    );
  }),

  rest.patch('http://localhost:4000/conduits/1', (req, res, ctx) => {
    apiCalledTimes = apiCalledTimes + 1;
    return res(
      ctx.json({
        conduit: {
          id: 1,
          suriApiKey: 'S3CR3T',
          suriType: 'Airtable',
          suriObjectKey: null,
          suri: 'http://example.org',
          curi: 'td-obj7u.trickle.cc',
          allowlist: [],
          racm: ['POST'],
          throttle: true,
          status: 'active',
          description: 'Description',
          hiddenFormField: [],
          userId: 1,
        },
      })
    );
  })
);

const ProviderWrapper: React.FC = ({ children }) => {
  return (
    <MockRouterProvider initialEntries={['/conduit/1']}>
      <MockStoreProvider>{children}</MockStoreProvider>
    </MockRouterProvider>
  );
};

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Conduit edit Page', () => {
  const props = {
    match: {
      path: '/conduit',
    },
  };

  it('should render the page', async () => {
    const { baseElement, container } = render(<ConduitPage {...props} />, {
      wrapper: ProviderWrapper,
    });

    await act(async () => {});

    const apiKey = await screen.findByTitle('API Key');
    const suriType = await screen.findByTitle('SURI Type');
    const suriObjectKey = await screen.findByTitle('SURI Object Key');

    const description = await screen.findByTitle('Description');
    const statusRadio = document.querySelector('[name="group_status"]');

    expect(baseElement).toBeDefined();
    expect(apiKey.value).toBe('SECRET');
    expect(suriType.value).toBe('Airtable');
    expect(suriObjectKey.value).toBe('asdf');
    expect(description.value).toBe('Description');
    expect(statusRadio.value).toBe('active');
  });

  it('should submit edited form', async () => {
    render(<ConduitPage {...props} />, {
      wrapper: ProviderWrapper,
    });

    await act(async () => {});

    const apiKey = await screen.findByTitle('API Key');

    const submitButton = await screen.findByText('Submit');

    fireEvent.ionChange(apiKey, 'S3CR3T');

    expect(apiKey.value).toBe('S3CR3T');

    await act(async () => {
      fireEvent.submit(submitButton);
    });

    await act(async () => {});

    expect(apiCalledTimes).toBe(1);
  });
});
