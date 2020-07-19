import React from 'react';
import { render, screen } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';
import { act } from 'react-dom/test-utils';
import ConduitPage from '../index';
import { MockRouterProvider, MockStoreProvider } from '../../../mocks';

let apiCalledTimes: number = 0;
const server = setupServer(
  rest.post('http://localhost:4000/conduits', (req, res, ctx) => {
    apiCalledTimes = apiCalledTimes + 1;
    return res(ctx.json({ conduit: { id: 7, curi: 'td-4zw3s.trickle.cc' } }));
  })
);

const ProviderWrapper: React.FC = ({ children }) => {
  return (
    <MockRouterProvider initialEntries={['/conduit/create']}>
      <MockStoreProvider>{children}</MockStoreProvider>
    </MockRouterProvider>
  );
};

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Conduit create Page', () => {
  const props = {
    match: {
      path: '/conduit',
    },
  };

  it('should render the page', async () => {
    const { baseElement } = render(<ConduitPage {...props} />, {
      wrapper: ProviderWrapper,
    });
    const apiKey = await screen.findByTitle('API Key');
    const suriType = await screen.findByTitle('SURI Type');
    const suri = await screen.findByTitle('SURI');
    const addIPButton = await screen.findByText('Add IP Address');
    const racm = document.querySelectorAll('[name^="racm"][role="toggle"]');
    const description = await screen.findByTitle('Description');
    const statusRadio = document.querySelectorAll('[name="status"]');
    const submitButton = await screen.findByText('Submit');
    const backButton = await screen.findByText('Add IP Address');

    expect(baseElement).toBeDefined();
    expect(apiKey).toBeInTheDocument();
    expect(suriType).toBeInTheDocument();
    expect(suri).toBeInTheDocument();
    expect(addIPButton).toBeInTheDocument();
    expect(racm).toHaveLength(4);
    expect(description).toBeInTheDocument();
    expect(statusRadio).toHaveLength(2);
    expect(submitButton).toBeInTheDocument();
    expect(backButton).toBeInTheDocument();
  });

  it('should have add IP allowlist fields', async () => {
    const { container } = render(<ConduitPage {...props} />, {
      wrapper: ProviderWrapper,
    });

    const addIPButton = await screen.findByText('Add IP Address');

    await act(async () => {
      fireEvent.click(addIPButton);
    });

    const ipField = document.querySelector('[name="allowlist[0].ip"]');
    const commentField = document.querySelector(
      '[name="allowlist[0].comment"]'
    );
    const allowListStatus = document.querySelectorAll(
      '[name="allowlist[0].status"]'
    );

    expect(ipField).toBeInTheDocument();
    expect(commentField).toBeInTheDocument();
    expect(allowListStatus).toHaveLength(2);

    const removeIPButton = await screen.findByText('X');
    expect(removeIPButton).toBeInTheDocument();
  });

  it('should show form errors', async () => {
    render(<ConduitPage {...props} />, {
      wrapper: ProviderWrapper,
    });

    const submitButton = await screen.findByText('Submit');

    await act(async () => {
      fireEvent.submit(submitButton);
    });

    const apiKeyError = await screen.findByText('Api key is required');
    const suriTypeError = await screen.findByText('Service type required');
    const suriError = await screen.findByText(
      'Service Endpoint uri is required'
    );
    // const racmError = await screen.findByText(
    //   'Select atleast on request method'
    // );
    const descriptionError = await screen.findByTitle('Description');

    expect(apiKeyError).toBeInTheDocument();
    expect(suriTypeError).toBeInTheDocument();
    expect(suriError).toBeInTheDocument();
    // expect(racmError).toBeInTheDocument();
    expect(descriptionError).toBeInTheDocument();
  });

  it('should show errors for allowlist', async () => {
    render(<ConduitPage {...props} />, {
      wrapper: ProviderWrapper,
    });

    const submitButton = await screen.findByText('Submit');
    const addIPButton = await screen.findByText('Add IP Address');

    await act(async () => {
      fireEvent.click(addIPButton);
    });

    await act(async () => {
      fireEvent.submit(submitButton);
    });

    const ipFieldError = await screen.findByText('IP Address Required');
    expect(ipFieldError).toBeInTheDocument();
  });

  it('shoiuld show errors for invalid inputs', async () => {
    render(<ConduitPage {...props} />, {
      wrapper: ProviderWrapper,
    });

    const submitButton = await screen.findByText('Submit');
    const addIPButton = await screen.findByText('Add IP Address');

    await act(async () => {
      fireEvent.click(addIPButton);
    });

    const suriType = await screen.findByTitle('SURI Type');

    fireEvent.ionChange(suriType, 'suri type');

    await act(async () => {
      fireEvent.submit(submitButton);
    });

    const suriTypeError = await screen.findByText('Invalid service type');

    expect(suriTypeError).toBeInTheDocument();
  });

  it('should submit form with valid values', async () => {
    const { container } = render(<ConduitPage {...props} />, {
      wrapper: ProviderWrapper,
    });

    const submitButton = await screen.findByText('Submit');
    const addIPButton = await screen.findByText('Add IP Address');

    await act(async () => {
      fireEvent.click(addIPButton);
    });

    const apiKey = await screen.findByTitle('API Key');
    const suriType = await screen.findByTitle('SURI Type');
    const suri = await screen.findByTitle('SURI');
    const ipField = document.querySelector('[name="allowlist[0].ip"]');
    const commentField = document.querySelector(
      '[name="allowlist[0].comment"]'
    );
    const allowListStatus = document.querySelector(
      '[name="group_allowlist[0].status"]'
    );

    const racm = document.querySelectorAll('[name^="racm"][role="toggle"]');
    const description = await screen.findByTitle('Description');
    const statusRadio = document.querySelector('[name="group_status"]');

    fireEvent.ionChange(apiKey, 'S3C23TK3Y');
    fireEvent.ionChange(suriType, 'Airtable');
    fireEvent.ionChange(suri, 'http://example.com/235');
    if (ipField) {
      fireEvent.ionChange(ipField, '127.0.0.1');
    }
    if (commentField) {
      fireEvent.ionChange(commentField, 'Sample IP');
    }
    fireEvent.ionChange(allowListStatus, 'active');
    // fireEvent.click(racm[1]);
    fireEvent.ionChange(description, 'Sample Description');
    fireEvent.ionChange(statusRadio, 'active');

    await act(async () => {
      fireEvent.submit(submitButton);
    });

    expect(apiCalledTimes).toBe(1);
  });
});
