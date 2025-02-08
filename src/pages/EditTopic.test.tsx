import '../../public/appConfig';
import { render, screen, waitFor } from '@testing-library/react';
import {
  createMemoryRouter,
  RouterProvider,
} from 'react-router';
import EditTopic from './EditTopic';
import { EditorProps } from 'primereact/editor';
import { Api } from '../api';
import * as TestNotification from '../notification';
import userEvent from '@testing-library/user-event';
import AppConfConstants from '../AppConfConstants';

const mockFetch = jest.fn();

global.fetch = jest.fn(mockFetch) as jest.Mock;

const mockEditor = jest.fn();
jest.mock('primereact/editor', () => ({
  Editor: ({ value, onTextChange }: EditorProps) => {
    mockEditor(({ value }: { value: string | null }) => ({ value }));
    return (
      <input
        type="text"
        aria-label="mock-editor"
        value={value || ''}
        onChange={e =>
          onTextChange
          && onTextChange({
            htmlValue: e?.target.value || '',
            textValue: e?.target.value || '',
            delta: undefined,
            source: 'user',
          })}
      />
    );
  },
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

const mockUseNavigate = jest.fn().mockImplementation(() => {});
const mockUseParam = jest.fn().mockImplementation(() => {});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  // Returns a function
  useNavigate: () => mockUseNavigate,
  // Return an object
  useParams: () => mockUseParam(),
}));

const mockUseKeycloak = jest.fn().mockImplementation(() => {
  return {
    keycloak: null,
  };
});

jest.mock('../keycloak', () => ({
  useKeycloak: () => mockUseKeycloak(),
}));

jest.mock('../notification', () => ({
  useNotification: jest.fn().mockReturnValue({
    notify: () => {},
  }),
}));

const mockNotify = jest.fn();

describe('The EditTopic component', () => {
  beforeAll(() => {
    jest.spyOn(TestNotification, 'useNotification').mockReturnValue({
      notify: mockNotify,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays empty editor if open in ADD mode', async () => {
    // Mocks the path parameters in the URL
    mockUseParam.mockReturnValue({ topicId: 'add' });

    // Renders the component
    const router = createMemoryRouter([{ path: '*', element: <EditTopic /> }]);
    render(<RouterProvider router={router} />);

    // Checks that the input for the title is empty
    const titleElement = await screen.findByLabelText('title');
    expect(titleElement).toHaveValue('');

    // Checks that the input for the editor is empty
    const editorElement = await screen.findByLabelText('mock-editor');
    expect(editorElement).toHaveValue('');

    // Checks that there is no request in direction of the backend
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('displays the topic in EDIT mode', async () => {
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
    });

    // Mocks the path parameters in the URL
    mockUseParam.mockReturnValue({ topicId: '1' });

    // Renders the component
    const router = createMemoryRouter([{ path: '*', element: <EditTopic /> }]);
    render(<RouterProvider router={router} />);

    // Checks that the input for the title is empty
    const titleElement = await screen.findByLabelText('title');
    expect(titleElement).toHaveValue(dataValue.title);

    // Checks that the input for the editor is empty
    const editorElement = await screen.findByLabelText('mock-editor');
    expect(editorElement).toHaveValue(dataValue.text);
  });

  it('displays an error when trying to edit a topic and the backend responds with error 400', async () => {
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
    });

    // Mocks the path parameters in the URL
    mockUseParam.mockReturnValue({ topicId: '1' });

    // Renders the component
    const router = createMemoryRouter([{ path: '*', element: <EditTopic /> }]);
    render(<RouterProvider router={router} />);

    // Checks that the error message is displayed
    const messageComponent = await screen.findByLabelText('error-message');
    expect(messageComponent).toHaveTextContent('topic.editTopic.error.loadingTopicError');
    expect(mockT).toHaveBeenCalledWith('topic.editTopic.error.loadingTopicError', { errorMessage: 'TEST ERROR\n' });

    // Check CALL of error notification
    expect(mockNotify).toHaveBeenCalledWith('ERROR', expect.stringContaining('TEST ERROR'));
  });

  it('displays an error when trying to edit a topic and fetch error thrown', async () => {
    // Mocks the fetch
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === AppConfConstants.APP_PREFIX + Api.Topic.get(1)
        && init?.method === 'GET'
      ) {
        throw new Error('FETCH ERROR');
      }
    });

    // Mocks the path parameters in the URL
    mockUseParam.mockReturnValue({ topicId: '1' });

    // Renders the component
    const router = createMemoryRouter([{ path: '*', element: <EditTopic /> }]);
    render(<RouterProvider router={router} />);

    // Checks that the error message is displayed
    const messageComponent = await screen.findByLabelText('error-message');
    expect(messageComponent).toHaveTextContent('topic.editTopic.error.loadingTopicError');
    expect(mockT).toHaveBeenCalledWith('topic.editTopic.error.loadingTopicError', { errorMessage: expect.stringContaining('FETCH ERROR') });

    // Check CALL of error notification
    expect(mockNotify).toHaveBeenCalledWith('ERROR', 'global.error.unexpectedError');
  });

  it('displays an error when trying to edit a topic and fetch throw null', async () => {
    // Mocks the fetch
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === AppConfConstants.APP_PREFIX + Api.Topic.get(1)
        && init?.method === 'GET'
      ) {
        throw null;
      }
    });

    // Mocks the path parameters in the URL
    mockUseParam.mockReturnValue({ topicId: '1' });

    // Renders the component
    const router = createMemoryRouter([{ path: '*', element: <EditTopic /> }]);
    render(<RouterProvider router={router} />);

    // Checks that the error message is displayed
    const messageComponent = await screen.findByLabelText('error-message');
    expect(messageComponent).toHaveTextContent('topic.editTopic.error.loadingTopicError');
    expect(mockT).toHaveBeenCalledWith('topic.editTopic.error.loadingTopicError', { errorMessage: '' });

    // Check CALL of error notification
    expect(mockNotify).toHaveBeenCalledWith('ERROR', 'global.error.unexpectedError');
  });

  it('should be able to save changes in ADD mode and response is success', async () => {
    // Mocks the fetch response to creation
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === AppConfConstants.APP_PREFIX + Api.Topic.create()
        && init?.method === 'POST'
      ) {
        return Promise.resolve({
          status: 201,
        });
      }
    });

    // Mocks the path parameter in the URL to open topic creation page
    mockUseParam.mockReturnValue({ topicId: 'add' });

    // Renders the component
    const router = createMemoryRouter([{ path: '*', element: <EditTopic /> }]);
    render(<RouterProvider router={router} />);

    // Gets the components to fill
    const titleComponent = await screen.findByLabelText('title');
    expect(titleComponent).toHaveValue('');
    const editorComponent = await screen.findByLabelText('mock-editor');
    expect(editorComponent).toHaveValue('');

    // Set data
    await waitFor(() => userEvent.type(titleComponent, 'new title 1'));
    expect(titleComponent).toHaveValue('new title 1');
    await waitFor(() => userEvent.type(editorComponent, 'new content 1'));
    expect(editorComponent).toHaveValue('new content 1');

    // Click on submit button
    const submitButton = await waitFor(async () =>
      screen.findByRole('button', {
        name: 'submit',
      }),
    );
    await waitFor(async () => submitButton.click());

    // Check API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.create(),
        {
          method: 'POST',
          body: JSON.stringify({
            title: 'new title 1',
            text: 'new content 1',
          }),
          headers: { 'content-type': 'application/json' },
        },
      );
    });

    // Check the redirection to the page containing the list of topics
    expect(mockUseNavigate).toHaveBeenCalledWith('/');
  });

  it('notifies error when saving changes in ADD mode and backend response is error 400', async () => {
    // Mocks the fetch response to creation
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === AppConfConstants.APP_PREFIX + Api.Topic.create()
        && init?.method === 'POST'
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
    });

    // Mocks the path parameter in the URL to open topic creation page
    mockUseParam.mockReturnValue({ topicId: 'add' });

    // Renders the component
    const router = createMemoryRouter([{ path: '*', element: <EditTopic /> }]);
    render(<RouterProvider router={router} />);

    // Gets the components to fill
    const titleComponent = await screen.findByLabelText('title');
    expect(titleComponent).toHaveValue('');
    const editorComponent = await screen.findByLabelText('mock-editor');
    expect(editorComponent).toHaveValue('');

    // Set data
    await waitFor(() => userEvent.type(titleComponent, 'new title 1'));
    expect(titleComponent).toHaveValue('new title 1');
    await waitFor(() => userEvent.type(editorComponent, 'new content 1'));
    expect(editorComponent).toHaveValue('new content 1');

    // Click on submit button
    const submitButton = await waitFor(async () =>
      screen.findByRole('button', {
        name: 'submit',
      }),
    );
    await waitFor(async () => submitButton.click());

    // Check API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.create(),
        {
          method: 'POST',
          body: JSON.stringify({
            title: 'new title 1',
            text: 'new content 1',
          }),
          headers: { 'content-type': 'application/json' },
        },
      );
    });

    // Check CALL of error notification
    expect(mockNotify).toHaveBeenCalledWith('ERROR', expect.stringContaining('TEST ERROR'));
  });

  it('notifies error when saving changes in ADD mode and fetch error thrown', async () => {
    // Mocks the fetch response to creation
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === AppConfConstants.APP_PREFIX + Api.Topic.create()
        && init?.method === 'POST'
      ) {
        throw new Error('FETCH ERROR');
      }
    });

    // Mocks the path parameter in the URL to open topic creation page
    mockUseParam.mockReturnValue({ topicId: 'add' });

    // Renders the component
    const router = createMemoryRouter([{ path: '*', element: <EditTopic /> }]);
    render(<RouterProvider router={router} />);

    // Gets the components to fill
    const titleComponent = await screen.findByLabelText('title');
    expect(titleComponent).toHaveValue('');
    const editorComponent = await screen.findByLabelText('mock-editor');
    expect(editorComponent).toHaveValue('');

    // Set data
    await waitFor(() => userEvent.type(titleComponent, 'new title 1'));
    expect(titleComponent).toHaveValue('new title 1');
    await waitFor(() => userEvent.type(editorComponent, 'new content 1'));
    expect(editorComponent).toHaveValue('new content 1');

    // Click on submit button
    const submitButton = await waitFor(async () =>
      screen.findByRole('button', {
        name: 'submit',
      }),
    );
    await waitFor(async () => submitButton.click());

    // Check API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.create(),
        {
          method: 'POST',
          body: JSON.stringify({
            title: 'new title 1',
            text: 'new content 1',
          }),
          headers: { 'content-type': 'application/json' },
        },
      );
    });

    // Check CALL of error notification
    expect(mockNotify).toHaveBeenCalledWith('ERROR', expect.stringContaining('FETCH ERROR'));
  });

  it('notifies error when saving changes in ADD mode and fetch throw null', async () => {
    // Mocks the fetch response to creation
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === AppConfConstants.APP_PREFIX + Api.Topic.create()
        && init?.method === 'POST'
      ) {
        throw null;
      }
    });

    // Mocks the path parameter in the URL to open topic creation page
    mockUseParam.mockReturnValue({ topicId: 'add' });

    // Renders the component
    const router = createMemoryRouter([{ path: '*', element: <EditTopic /> }]);
    render(<RouterProvider router={router} />);

    // Gets the components to fill
    const titleComponent = await screen.findByLabelText('title');
    expect(titleComponent).toHaveValue('');
    const editorComponent = await screen.findByLabelText('mock-editor');
    expect(editorComponent).toHaveValue('');

    // Set data
    await waitFor(() => userEvent.type(titleComponent, 'new title 1'));
    expect(titleComponent).toHaveValue('new title 1');
    await waitFor(() => userEvent.type(editorComponent, 'new content 1'));
    expect(editorComponent).toHaveValue('new content 1');

    // Click on submit button
    const submitButton = await waitFor(async () =>
      screen.findByRole('button', {
        name: 'submit',
      }),
    );
    await waitFor(async () => submitButton.click());

    // Check API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.create(),
        {
          method: 'POST',
          body: JSON.stringify({
            title: 'new title 1',
            text: 'new content 1',
          }),
          headers: { 'content-type': 'application/json' },
        },
      );
    });

    // Check CALL of error notification
    expect(mockNotify).toHaveBeenCalledWith('ERROR', 'global.error.unexpectedError');
  });

  it('should be able to save changes in EDIT mode', async () => {
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
    });

    // Mocks the path parameter in the URL to open topic creation page
    mockUseParam.mockReturnValue({ topicId: '1' });

    // Renders the component
    const router = createMemoryRouter([{ path: '*', element: <EditTopic /> }]);
    render(<RouterProvider router={router} />);

    // Gets the components to fill
    const titleComponent = await screen.findByLabelText('title');
    expect(titleComponent).toHaveValue('title1');
    const editorComponent = await screen.findByLabelText('mock-editor');
    expect(editorComponent).toHaveValue('text1');

    // Set data
    await waitFor(() => userEvent.clear(titleComponent));
    await waitFor(() => userEvent.type(titleComponent, 'new title 1'));
    expect(titleComponent).toHaveValue('new title 1');
    await waitFor(() => userEvent.clear(editorComponent));
    await waitFor(() => userEvent.type(editorComponent, 'new content 1'));
    expect(editorComponent).toHaveValue('new content 1');

    // Clear the fetch mock.
    mockFetch.mockClear();

    // Click on submit button
    const submitButton = await waitFor(async () =>
      screen.findByRole('button', {
        name: 'submit',
      }),
    );
    await waitFor(async () => submitButton.click());

    // Check API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.update(1),
        {
          method: 'PUT',
          body: expect.stringMatching(/"title":"new title 1".*"text":"new content 1"/),
          headers: { 'content-type': 'application/json' },
        },
      );
    });
  });

  it('notifies error when saving changes in EDIT mode and backend response is error 400', async () => {
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
      if (url === AppConfConstants.APP_PREFIX + Api.Topic.get(1)
        && init?.method === 'GET') {
        return Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              data: dataValue,
              messages: [],
            }),
        });
      } else if (url === AppConfConstants.APP_PREFIX + Api.Topic.get(1)
        && init?.method === 'PUT') {
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
    });

    // Mocks the path parameter in the URL to open topic creation page
    mockUseParam.mockReturnValue({ topicId: '1' });

    // Renders the component
    const router = createMemoryRouter([{ path: '*', element: <EditTopic /> }]);
    render(<RouterProvider router={router} />);

    // Gets the components to fill
    const titleComponent = await screen.findByLabelText('title');
    expect(titleComponent).toHaveValue('title1');
    const editorComponent = await screen.findByLabelText('mock-editor');
    expect(editorComponent).toHaveValue('text1');

    // Set data
    await waitFor(() => userEvent.clear(titleComponent));
    await waitFor(() => userEvent.type(titleComponent, 'new title 1'));
    expect(titleComponent).toHaveValue('new title 1');
    await waitFor(() => userEvent.clear(editorComponent));
    await waitFor(() => userEvent.type(editorComponent, 'new content 1'));
    expect(editorComponent).toHaveValue('new content 1');

    // Clear the fetch mock.
    mockFetch.mockClear();

    // Click on submit button
    const submitButton = await waitFor(async () =>
      screen.findByRole('button', {
        name: 'submit',
      }),
    );
    await waitFor(async () => submitButton.click());

    // Check API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.update(1),
        {
          method: 'PUT',
          body: expect.stringMatching(/"title":"new title 1".*"text":"new content 1"/),
          headers: { 'content-type': 'application/json' },
        },
      );
    });

    // Check CALL of error notification
    expect(mockNotify).toHaveBeenCalledWith('ERROR', expect.stringContaining('TEST ERROR'));
  });

  it('notifies error when saving changes in EDIT mode and fetch error thrown', async () => {
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
      if (url === AppConfConstants.APP_PREFIX + Api.Topic.get(1)
        && init?.method === 'GET') {
        return Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              data: dataValue,
              messages: [],
            }),
        });
      } else if (url === AppConfConstants.APP_PREFIX + Api.Topic.get(1)
        && init?.method === 'PUT') {
        throw new Error('FETCH ERROR');
      }
    });

    // Mocks the path parameter in the URL to open topic creation page
    mockUseParam.mockReturnValue({ topicId: '1' });

    // Renders the component
    const router = createMemoryRouter([{ path: '*', element: <EditTopic /> }]);
    render(<RouterProvider router={router} />);

    // Gets the components to fill
    const titleComponent = await screen.findByLabelText('title');
    expect(titleComponent).toHaveValue('title1');
    const editorComponent = await screen.findByLabelText('mock-editor');
    expect(editorComponent).toHaveValue('text1');

    // Set data
    await waitFor(() => userEvent.clear(titleComponent));
    await waitFor(() => userEvent.type(titleComponent, 'new title 1'));
    expect(titleComponent).toHaveValue('new title 1');
    await waitFor(() => userEvent.clear(editorComponent));
    await waitFor(() => userEvent.type(editorComponent, 'new content 1'));
    expect(editorComponent).toHaveValue('new content 1');

    // Clear the fetch mock.
    mockFetch.mockClear();

    // Click on submit button
    const submitButton = await waitFor(async () =>
      screen.findByRole('button', {
        name: 'submit',
      }),
    );
    await waitFor(async () => submitButton.click());

    // Check API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.update(1),
        {
          method: 'PUT',
          body: expect.stringMatching(/"title":"new title 1".*"text":"new content 1"/),
          headers: { 'content-type': 'application/json' },
        },
      );
    });

    // Check CALL of error notification
    expect(mockNotify).toHaveBeenCalledWith('ERROR', expect.stringContaining('FETCH ERROR'));
  });

  it('notifies error when saving changes in EDIT mode and fetch throw null', async () => {
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
      if (url === AppConfConstants.APP_PREFIX + Api.Topic.get(1)
        && init?.method === 'GET') {
        return Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              data: dataValue,
              messages: [],
            }),
        });
      } else if (url === AppConfConstants.APP_PREFIX + Api.Topic.get(1)
        && init?.method === 'PUT') {
        throw null;
      }
    });

    // Mocks the path parameter in the URL to open topic creation page
    mockUseParam.mockReturnValue({ topicId: '1' });

    // Renders the component
    const router = createMemoryRouter([{ path: '*', element: <EditTopic /> }]);
    render(<RouterProvider router={router} />);

    // Gets the components to fill
    const titleComponent = await screen.findByLabelText('title');
    expect(titleComponent).toHaveValue('title1');
    const editorComponent = await screen.findByLabelText('mock-editor');
    expect(editorComponent).toHaveValue('text1');

    // Set data
    await waitFor(() => userEvent.clear(titleComponent));
    await waitFor(() => userEvent.type(titleComponent, 'new title 1'));
    expect(titleComponent).toHaveValue('new title 1');
    await waitFor(() => userEvent.clear(editorComponent));
    await waitFor(() => userEvent.type(editorComponent, 'new content 1'));
    expect(editorComponent).toHaveValue('new content 1');

    // Clear the fetch mock.
    mockFetch.mockClear();

    // Click on submit button
    const submitButton = await waitFor(async () =>
      screen.findByRole('button', {
        name: 'submit',
      }),
    );
    await waitFor(async () => submitButton.click());

    // Check API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.update(1),
        {
          method: 'PUT',
          body: expect.stringMatching(/"title":"new title 1".*"text":"new content 1"/),
          headers: { 'content-type': 'application/json' },
        },
      );
    });

    // Check CALL of error notification
    expect(mockNotify).toHaveBeenCalledWith('ERROR', 'global.error.unexpectedError');
  });

  it('Cancels the modification when clicking on cancel button', async () => {
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
      if (url === AppConfConstants.APP_PREFIX + Api.Topic.get(1)
        && init?.method === 'GET') {
        return Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              data: dataValue,
              messages: [],
            }),
        });
      }
    });

    // Mocks the path parameter in the URL to open topic creation page
    mockUseParam.mockReturnValue({ topicId: '1' });

    // Renders the component
    const router = createMemoryRouter([{ path: '*', element: <EditTopic /> }]);
    render(<RouterProvider router={router} />);

    // Gets the components to fill
    const titleComponent = await screen.findByLabelText('title');
    expect(titleComponent).toHaveValue('title1');
    const editorComponent = await screen.findByLabelText('mock-editor');
    expect(editorComponent).toHaveValue('text1');

    // Set data
    await waitFor(() => userEvent.clear(titleComponent));
    await waitFor(() => userEvent.type(titleComponent, 'new title 1'));
    expect(titleComponent).toHaveValue('new title 1');
    await waitFor(() => userEvent.clear(editorComponent));
    await waitFor(() => userEvent.type(editorComponent, 'new content 1'));
    expect(editorComponent).toHaveValue('new content 1');

    // Clear the fetch mock.
    mockFetch.mockClear();

    // Click on cancel button
    const cancelButton = await waitFor(async () =>
      screen.findByRole('button', {
        name: 'cancel',
      }),
    );
    await waitFor(async () => cancelButton.click());

    // Check data resetted
    expect(titleComponent).toHaveValue('title1');
    expect(editorComponent).toHaveValue('text1');

    // No call to fetch
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows error if undefined topic ID', async () => {
    // Mocks the path parameter in the URL to open topic creation page
    mockUseParam.mockReturnValue({ topicId: undefined });

    // Renders the component
    const router = createMemoryRouter([{ path: '*', element: <EditTopic /> }]);
    render(<RouterProvider router={router} />);

    // Gets the component to display the error
    const errorMessageComponent = await screen.findByLabelText('error-message');

    // Check that an error is displayed.
    expect(errorMessageComponent).toHaveTextContent('topic.editTopic.error.missingTopicIdInUrl');

    // No call to fetch
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows error if BAD topic ID', async () => {
    // Mocks the path parameter in the URL to open topic creation page
    mockUseParam.mockReturnValue({ topicId: 'BAD_TOPIC_ID' });

    // Renders the component
    const router = createMemoryRouter([{ path: '*', element: <EditTopic /> }]);
    render(<RouterProvider router={router} />);

    // Gets the component to display the error
    const errorMessageComponent = await screen.findByLabelText('error-message');

    // Check that an error is displayed.
    expect(errorMessageComponent).toHaveTextContent('topic.editTopic.error.missingTopicIdInUrl');

    // No call to fetch
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
