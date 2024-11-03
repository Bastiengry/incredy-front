import '../../../public/appConfig';
import {DefaultBodyType, http, HttpResponse, StrictRequest} from 'msw';
import {setupServer} from 'msw/node';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {createMemoryRouter, RouterProvider} from 'react-router-dom';
import EditTopic from '../EditTopic';
import {EditorProps} from 'primereact/editor';
import {useParams} from 'react-router-dom';
import {Api} from '../../api';

const mockEditor = jest.fn();
jest.mock('primereact/editor', () => ({
  Editor: ({value, onTextChange}: EditorProps) => {
    mockEditor(({value}: any) => ({value}));
    return (
      <input
        type="text"
        aria-label="mock-editor"
        value={value || ''}
        onChange={e =>
          onTextChange &&
          onTextChange({
            htmlValue: e?.target.value || '',
            textValue: e?.target.value || '',
            delta: undefined,
            source: '',
          })
        }
      />
    );
  },
}));

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str: string) => str,
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

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useNavigate: () => mockUseNavigate,
  useParams: jest.fn(),
}));

jest.mock('@react-keycloak/web', () => ({
  ...jest.requireActual('@react-keycloak/web'),
  useKeycloak: jest.fn().mockImplementation(() => ({
    keycloak: null,
  })),
}));

const dataValueTopic1 = {
  data: {
    id: 1,
    title: 'title1',
    text: 'text1',
    createdDate: '2024-09-25 19:20:11',
    lastModifiedDate: '2024-09-25 19:20:11',
    creatorUser: 'user',
  },
  message: [],
  status: 'SUCCESS',
};

const server = setupServer();

beforeAll(() => {
  global.TextEncoder = require('util').TextEncoder;
  server.listen();
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('The edit topic component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display empty editor if open in add mode', async () => {
    useParams.mockReturnValue({topicId: 'add'});

    const router = createMemoryRouter([{path: '*', element: <EditTopic />}]);
    render(<RouterProvider router={router} />);
    const titleElement = await screen.findByLabelText('title');
    expect(titleElement).toHaveValue('');
    const editorElement = await screen.findByLabelText('mock-editor');
    expect(editorElement).toHaveValue('');
  });

  it('should display the topic when editing one', async () => {
    useParams.mockReturnValue({topicId: '1'});

    const myGetHandler = http.get(
      APP_CONFIG.BACKEND_PREFIX + Api.Topic.update(1),
      () => {
        return HttpResponse.json(dataValueTopic1);
      },
    );
    server.use(myGetHandler);

    const router = createMemoryRouter([{path: '*', element: <EditTopic />}]);
    render(<RouterProvider router={router} />);
    const titleElement = await screen.findByLabelText('title');
    expect(titleElement).toHaveValue(dataValueTopic1.data.title);
    const editorElement = await screen.findByLabelText('mock-editor');
    expect(editorElement).toHaveValue(dataValueTopic1.data.text);
  });

  it('should be able to save changes in add mode', async () => {
    useParams.mockReturnValue({topicId: 'add'});

    let postRequestObject: StrictRequest<DefaultBodyType>;
    let postRequestData: any;
    const myPostHandler = http.post(
      APP_CONFIG.BACKEND_PREFIX + Api.Topic.create(),
      async ({request, params}) => {
        postRequestObject = request;
        postRequestData = await request.clone().json();
        return HttpResponse.json({});
      },
    );
    server.use(myPostHandler);

    const router = createMemoryRouter([{path: '*', element: <EditTopic />}]);
    render(<RouterProvider router={router} />);

    // Gets the elements
    const titleElement = await screen.findByLabelText('title');
    expect(titleElement).toHaveValue('');
    const editorElement = await screen.findByLabelText('mock-editor');
    expect(editorElement).toHaveValue('');

    // Set data
    fireEvent.change(titleElement, {target: {value: 'new title 1'}});
    expect(titleElement).toHaveValue('new title 1');
    fireEvent.change(editorElement, {target: {value: 'new content 1'}});
    expect(editorElement).toHaveValue('new content 1');

    // Click on submit button
    const submitButton = await waitFor(async () =>
      screen.findByRole('button', {
        name: 'submit',
      }),
    );
    await waitFor(async () => submitButton.click());

    // Check API call
    await waitFor(() =>
      expect(postRequestObject).toEqual(
        expect.objectContaining({
          method: 'POST',
          url: 'http://localhost/incredy/api/v1/topic',
        }),
      ),
    );

    await waitFor(() =>
      expect(postRequestData).toEqual(
        expect.objectContaining({
          title: 'new title 1',
          text: 'new content 1',
        }),
      ),
    );
  });

  it('should be able to save changes in edit mode', async () => {
    useParams.mockReturnValue({topicId: '1'});

    const myGetHandler = http.get(
      APP_CONFIG.BACKEND_PREFIX + Api.Topic.get(1),
      () => {
        return HttpResponse.json(dataValueTopic1);
      },
    );
    server.use(myGetHandler);

    let putRequestObject: StrictRequest<DefaultBodyType>;
    let putRequestData: any;
    const myPutHandler = http.put(
      APP_CONFIG.BACKEND_PREFIX + Api.Topic.update(1),
      async ({request, params}) => {
        putRequestObject = request;
        putRequestData = await request.clone().json();
        return HttpResponse.json({});
      },
    );
    server.use(myPutHandler);

    const router = createMemoryRouter([{path: '*', element: <EditTopic />}]);
    render(<RouterProvider router={router} />);

    // Gets the elements
    const titleElement = await screen.findByLabelText('title');
    expect(titleElement).toHaveValue(dataValueTopic1.data.title);
    const editorElement = await screen.findByLabelText('mock-editor');
    expect(editorElement).toHaveValue(dataValueTopic1.data.text);

    // Update data
    fireEvent.change(titleElement, {target: {value: 'new title 1'}});
    expect(titleElement).toHaveValue('new title 1');
    fireEvent.change(editorElement, {target: {value: 'new content 1'}});
    expect(editorElement).toHaveValue('new content 1');

    // Click on submit button
    const submitButton = await screen.findByRole('button', {
      name: 'submit',
    });
    await waitFor(async () => submitButton.click());

    // Check API call
    await waitFor(() =>
      expect(putRequestObject).toEqual(
        expect.objectContaining({
          method: 'PUT',
          url: 'http://localhost/incredy/api/v1/topic/1',
        }),
      ),
    );

    await waitFor(() =>
      expect(putRequestData).toEqual(
        expect.objectContaining({
          title: 'new title 1',
          text: 'new content 1',
        }),
      ),
    );
  });

  it('should be able to cancel changes in add mode', async () => {
    useParams.mockReturnValue({topicId: 'add'});

    let postCalled: boolean = false;
    const myPostHandler = http.post(
      APP_CONFIG.BACKEND_PREFIX + Api.Topic.create(),
      async ({request, params}) => {
        postCalled = true;
        return HttpResponse.json({});
      },
    );
    server.use(myPostHandler);

    const router = createMemoryRouter([{path: '*', element: <EditTopic />}]);
    render(<RouterProvider router={router} />);

    // Gets the elements
    const titleElement = await screen.findByLabelText('title');
    expect(titleElement).toHaveValue('');
    const editorElement = await screen.findByLabelText('mock-editor');
    expect(editorElement).toHaveValue('');

    // Set data
    fireEvent.change(titleElement, {target: {value: 'new title 1'}});
    expect(titleElement).toHaveValue('new title 1');
    fireEvent.change(editorElement, {target: {value: 'new content 1'}});
    expect(editorElement).toHaveValue('new content 1');

    // Click on cancel button
    const cancelButton = await waitFor(async () =>
      screen.findByRole('button', {
        name: 'cancel',
      }),
    );
    await waitFor(async () => cancelButton.click());

    // Checks that the form is resetted
    expect(titleElement).toHaveValue('');
    expect(editorElement).toHaveValue('');

    // Check API call
    await waitFor(() => expect(postCalled).toEqual(false));
  });

  it('should be able to cancel changes in edit mode', async () => {
    useParams.mockReturnValue({topicId: '1'});

    const myGetHandler = http.get(
      APP_CONFIG.BACKEND_PREFIX + Api.Topic.get(1),
      () => {
        return HttpResponse.json(dataValueTopic1);
      },
    );
    server.use(myGetHandler);

    let putCalled: boolean = false;
    const myPutHandler = http.put(
      APP_CONFIG.BACKEND_PREFIX + Api.Topic.update(1),
      async ({request, params}) => {
        putCalled = true;
      },
    );
    server.use(myPutHandler);

    const router = createMemoryRouter([{path: '*', element: <EditTopic />}]);
    render(<RouterProvider router={router} />);

    // Gets the elements
    const titleElement = await screen.findByLabelText('title');
    expect(titleElement).toHaveValue(dataValueTopic1.data.title);
    const editorElement = await screen.findByLabelText('mock-editor');
    expect(editorElement).toHaveValue(dataValueTopic1.data.text);

    // Update data
    fireEvent.change(titleElement, {target: {value: 'new title 1'}});
    expect(titleElement).toHaveValue('new title 1');
    fireEvent.change(editorElement, {target: {value: 'new content 1'}});
    expect(editorElement).toHaveValue('new content 1');

    // Click on cancel button
    const cancelButton = await screen.findByRole('button', {
      name: 'cancel',
    });
    await waitFor(async () => cancelButton.click());

    // Check API call
    await waitFor(() =>
      expect(titleElement).toHaveValue(dataValueTopic1.data.title),
    );
    await waitFor(() =>
      expect(editorElement).toHaveValue(dataValueTopic1.data.text),
    );

    await waitFor(() => expect(putCalled).toEqual(false));
  });
});
