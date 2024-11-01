import '../../../public/appConfig';
import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';
import {render, screen, waitFor, within} from '@testing-library/react';
import {createMemoryRouter, RouterProvider} from 'react-router-dom';
import EditTopic from '../EditTopic';
import {EditorProps} from 'primereact/editor';
import {useParams} from 'react-router-dom';

const mockEditor = jest.fn();
jest.mock('primereact/editor', () => ({
  Editor: ({value}: EditorProps) => {
    mockEditor(({value}: any) => ({value}));
    return <>{value}</>;
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

const server = setupServer(
  http.get('/incredy/api/v1/topic/1', () => {
    return HttpResponse.json(dataValueTopic1);
  }),
);

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
    useParams.mockReturnValue({});
    const router = createMemoryRouter([{path: '*', element: <EditTopic />}]);
    render(<RouterProvider router={router} />);
    const editor = await screen.findByLabelText('editor');
    expect(editor).toHaveTextContent('');
  });

  it('should display the topic when editing one', async () => {
    useParams.mockReturnValue({topicId: '1'});
    const router = createMemoryRouter([{path: '*', element: <EditTopic />}]);
    render(<RouterProvider router={router} />);
    const editor = await screen.findByLabelText('editor');
    expect(editor).toHaveTextContent(dataValueTopic1.data.text);
  });
});
