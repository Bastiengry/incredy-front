import '../../public/appConfig';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { Api } from '../api';
import ViewTopic from './ViewTopic';
import { EditorProps } from 'primereact/editor';
import * as TestNotification from '../notification';
import AppConfConstants from '../AppConfConstants';

const mockFetch = jest.fn();

global.fetch = jest.fn(mockFetch) as jest.Mock;

const mockUseParams = jest.fn().mockImplementation(() => {});
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
}));

const mockUseKeycloak = jest.fn().mockImplementation(() => {
  return {
    keycloak: null,
  };
});

jest.mock('../keycloak', () => ({
  useKeycloak: () => mockUseKeycloak(),
}));

const mockT = jest.fn().mockImplementation((str: string) => str);
jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: mockT,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

jest.mock('../notification', () => ({
  useNotification: jest.fn().mockReturnValue({
    notify: () => {},
  }),
}));

const mockEditor = jest.fn();
jest.mock('../components', () => ({
  Editor: (editorProps: EditorProps) => {
    const { value } = editorProps;
    mockEditor(editorProps);
    return <>{value}</>;
  },
}));

const mockNotify = jest.fn();

describe('The ViewTopic component', () => {
  beforeAll(() => {
    jest.spyOn(TestNotification, 'useNotification').mockReturnValue({
      notify: mockNotify,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders well', async () => {
    const dataValue = {
      id: 1,
      title: 'title1',
      text: 'text1',
      createdDate: '2024-09-25 19:20:11',
      lastModifiedDate: '2024-09-25 19:20:11',
      creatorUser: 'user',
    };

    // Mocks the fetch
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === AppConfConstants.APP_PREFIX + Api.Topic.get(1)
        && init?.method === 'GET'
      ) {
        return Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              data: dataValue,
              messages: [],
            }),
        });
      }
      return null;
    });

    // Mocks the path parameters in the URL
    mockUseParams.mockReturnValue({ topicId: '1' });

    // Renders the component
    const router = createMemoryRouter([
      { path: '*', element: <ViewTopic /> },
    ]);
    render(<RouterProvider router={router} />);

    // Checks the call of API to get the data
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.get(1),
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      ),
    );

    // Checks that the header is displayed properly.
    const header = await screen.findByRole('heading', { level: 1 });
    expect(header).toHaveTextContent('title1');
  });

  it('show error message when reading data if backend return error 400', async () => {
    // Mocks the fetch
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === AppConfConstants.APP_PREFIX + Api.Topic.get(1)
        && init?.method === 'GET'
      ) {
        return Promise.resolve({
          status: 400,
          json: () =>
            Promise.resolve({
              data: undefined,
              messages: [{
                type: 'ERROR',
                code: 'TEST_ERROR',
                message: 'TEST ERROR',
              }],
            }),
        });
      }
      return null;
    });

    // Mocks the path parameters in the URL
    mockUseParams.mockReturnValue({ topicId: '1' });

    // Renders the component
    const router = createMemoryRouter([
      { path: '*', element: <ViewTopic /> },
    ]);
    render(<RouterProvider router={router} />);

    // Checks the call of API to get the data
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.get(1),
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      ),
    );

    // Checks the call of the notification component
    expect(mockNotify).toHaveBeenCalledWith('ERROR', 'TEST ERROR');

    // Checks that the error message is displayed
    const errorMessageComponent = await screen.findByLabelText('error-message');
    expect(errorMessageComponent).toHaveTextContent('topic.viewTopic.error.loadingTopicError');
    expect(mockT).toHaveBeenCalledWith('topic.viewTopic.error.loadingTopicError', { errorMessage: 'TEST ERROR\n' });
  });

  it('show error message when reading data if fetch throw error', async () => {
    // Mocks the fetch
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === AppConfConstants.APP_PREFIX + Api.Topic.get(1)
        && init?.method === 'GET'
      ) {
        throw null;
      }
      return null;
    });

    // Mocks the path parameters in the URL
    mockUseParams.mockReturnValue({ topicId: '1' });

    // Renders the component
    const router = createMemoryRouter([
      { path: '*', element: <ViewTopic /> },
    ]);
    render(<RouterProvider router={router} />);

    // Checks the call of API to get the data
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.get(1),
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      ),
    );

    // Check CALL of error notification
    expect(mockNotify).toHaveBeenCalledWith('ERROR', 'global.error.unexpectedError');

    // Checks that the error message is displayed
    const errorMessageComponent = await screen.findByLabelText('error-message');
    expect(errorMessageComponent).toHaveTextContent('topic.viewTopic.error.loadingTopicError');
    expect(mockT).toHaveBeenCalledWith('topic.viewTopic.error.loadingTopicError', { errorMessage: '' });
  });

  it('show error message when missing topic ID in URL', async () => {
    // Mocks the path parameters in the URL
    mockUseParams.mockReturnValue({ topicId: undefined });

    // Renders the component
    const router = createMemoryRouter([
      { path: '*', element: <ViewTopic /> },
    ]);
    render(<RouterProvider router={router} />);

    // Checks that the error message is displayed
    const errorMessageComponent = await screen.findByLabelText('error-message');
    expect(errorMessageComponent).toHaveTextContent('topic.viewTopic.error.missingTopicIdInUrl');

    // Check no call of fetch
    expect(mockFetch).not.toHaveBeenCalled();

    // Check CALL of error notification
    expect(mockNotify).toHaveBeenCalledWith('ERROR', 'topic.viewTopic.error.missingTopicIdInUrl');
  });
});
