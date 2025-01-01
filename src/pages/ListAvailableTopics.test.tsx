import '../../public/appConfig';
import { render, screen, waitFor, within } from '@testing-library/react';
import ListAvailableTopics from './ListAvailableTopics';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import ReactKeycloakWeb from '@react-keycloak/web';
import { Api } from '../api';
import Keycloak, { KeycloakProfile } from 'keycloak-js';
import userEvent from '@testing-library/user-event';
import * as TestNotification from '../notification';
import AppConfConstants from '../AppConfConstants';

const mockFetch = jest.fn();

global.fetch = jest.fn(mockFetch) as jest.Mock;

const t = (str: string) => str;
jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t,
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
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUseNavigate,
}));

jest.mock('@react-keycloak/web', () => ({
  ...jest.requireActual('@react-keycloak/web'),
  useKeycloak: jest.fn().mockImplementation(() => ({
    keycloak: null,
  })),
}));

jest.mock('../notification', () => ({
  useNotification: jest.fn().mockReturnValue({
    notify: () => {},
  }),
}));

const getKeycloakInstance = ({
  authenticated = false,
  preferred_username = null,
  sub = undefined,
}: {
  authenticated?: boolean;
  preferred_username?: string | null;
  sub?: string | undefined;
}): Keycloak => ({
  authenticated,
  tokenParsed: {
    preferred_username: preferred_username || null,
    sub: sub,
  },
  init: (): Promise<boolean> => new Promise(() => {}),
  login: (): Promise<void> => new Promise(() => {}),
  logout: (): Promise<void> => new Promise(() => {}),
  register: (): Promise<void> => new Promise(() => {}),
  accountManagement: (): Promise<void> => new Promise<void>(() => {}),
  createLoginUrl: () => '',
  createLogoutUrl: () => '',
  createRegisterUrl: () => '',
  createAccountUrl: () => '',
  isTokenExpired: () => false,
  updateToken: () => new Promise(() => {}),
  clearToken: () => {},
  hasRealmRole: () => true,
  hasResourceRole: () => false,
  loadUserProfile: (): Promise<KeycloakProfile> => new Promise(() => {}),
  loadUserInfo: (): Promise<object> => new Promise(() => {}),
});

const mockNotify = jest.fn();

describe('The ListAvailableTopics component', () => {
  beforeAll(() => {
    jest.spyOn(TestNotification, 'useNotification').mockReturnValue({
      notify: mockNotify,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display even with no topic available', async () => {
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === AppConfConstants.APP_PREFIX + Api.Topic.getAll()
        && init?.method === 'GET'
      ) {
        return Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              data: [],
              messages: [],
            }),
        });
      }
      return null;
    });
    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);
    render(<RouterProvider router={router} />);

    // Check the call of API to get the data
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.getAll(),
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      ),
    );

    // Check the data table is displayed and empty.
    // Get the table.
    const datatableComponent = await screen.findByTestId('datatable');
    const tableComponent = within(datatableComponent).getByRole('table');

    // BUG IN PRIMEREACT, SPACE IN ROLE, AND SO NOT POSSIBLE TO FILTER ON TBODY
    // Gets the rows  (1 row of header + X rows of data).
    const rowComponents = within(tableComponent).getAllByRole('row');

    // Row 1 : header
    // Row 2 : data row, row indicating that there is no data
    expect(rowComponents.length).toEqual(2);

    // Gets the data rows
    const dataRowComponents = rowComponents.slice(1);

    // 1 data row : the one indicating that there is no data
    expect(dataRowComponents).toHaveLength(1);
    expect(dataRowComponents[0]).toHaveTextContent('topic.listTopics.error.nodata');
  });

  it('displays 2 rows with only view button when 2 topics are returned by backend and not connected', async () => {
    const dataValue = [
      {
        id: 1,
        title: 'title1',
        text: 'text1',
        createdDate: '2024-09-25 19:20:10',
        lastModifiedDate: '2024-09-25 19:20:10',
        creatorUser: 'user',
      },
      {
        id: 2,
        title: 'title2',
        text: 'text2',
        createdDate: '2024-09-25 19:20:11',
        lastModifiedDate: '2024-09-25 19:20:11',
        creatorUser: 'user',
      },
    ];
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === AppConfConstants.APP_PREFIX + Api.Topic.getAll()
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
    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);
    render(<RouterProvider router={router} />);

    // Check the call of API to get the data
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.getAll(),
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      ),
    );

    // Get the datatable component.
    const datatableComponent = await screen.findByTestId('datatable');
    const tableComponent = within(datatableComponent).getByRole('table');
    // const tbodyComponent = within(tableComponent).getAllByRole(' rowgroup');  // BUG IN PRIMEREACT, SPACE IN ROLE, AND SO NOT POSSIBLE TO FILTER ON TBODY

    const rowComponents = within(tableComponent).getAllByRole('row');

    // Line 1 : header
    // Line 2 : data rows
    expect(rowComponents).toHaveLength(3);

    // Gets the data rows
    const dataRowComponents = rowComponents.slice(1);

    // Check data row 0
    const dataRow0Component = dataRowComponents[0];
    const dataRow0Cells = within(dataRow0Component).getAllByRole('cell');
    expect(dataRow0Cells).toHaveLength(2);
    const dataRow0Cell0Component = dataRow0Cells[0];
    expect(dataRow0Cell0Component).toHaveTextContent(dataValue[0].title);
    const dataRow0Cell1Component = dataRow0Cells[1];
    within(dataRow0Cell1Component).getByLabelText('pi-eye');
    expect(
      within(dataRow0Cell1Component).queryByLabelText('pi-pencil'),
    ).not.toBeInTheDocument();
    expect(
      within(dataRow0Cell1Component).queryByLabelText('pi-trash'),
    ).not.toBeInTheDocument();

    // Check data row 1
    const dataRow1Component = dataRowComponents[1];
    const dataRow1Cells = within(dataRow1Component).getAllByRole('cell');
    expect(dataRow1Cells).toHaveLength(2);
    const dataRow1Cell0Component = dataRow1Cells[0];
    expect(dataRow1Cell0Component).toHaveTextContent(dataValue[1].title);
    const dataRow1Cell1Component = dataRow1Cells[1];
    within(dataRow1Cell1Component).getByLabelText('pi-eye');
    expect(
      within(dataRow1Cell1Component).queryByLabelText('pi-pencil'),
    ).not.toBeInTheDocument();
    expect(
      within(dataRow1Cell1Component).queryByLabelText('pi-trash'),
    ).not.toBeInTheDocument();
  });

  it('displays 2 rows with view, edit and delete buttons when 2 topics are returned by backend and connected', async () => {
    const dataValue = [
      {
        id: 1,
        title: 'title1',
        text: 'text1',
        createdDate: '2024-09-25 19:20:10',
        lastModifiedDate: '2024-09-25 19:20:10',
        creatorUser: 'user',
      },
      {
        id: 2,
        title: 'title2',
        text: 'text2',
        createdDate: '2024-09-25 19:20:11',
        lastModifiedDate: '2024-09-25 19:20:11',
        creatorUser: 'user',
      },
    ];

    // Mocks the fetch
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === AppConfConstants.APP_PREFIX + Api.Topic.getAll()
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

    const keycloak = getKeycloakInstance({
      authenticated: true,
      preferred_username: 'user',
      sub: 'user',
    });

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockReturnValue({
      initialized: true,
      keycloak,
    });

    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);

    render(<RouterProvider router={router} />);

    // Check the call of API to get the data
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.getAll(),
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      ),
    );

    // Get the datatable component.
    const datatableComponent = await screen.findByTestId('datatable');
    const tableComponent = within(datatableComponent).getByRole('table');
    // const tbodyComponent = within(tableComponent).getAllByRole(' rowgroup');  // BUG IN PRIMEREACT, SPACE IN ROLE, AND SO NOT POSSIBLE TO FILTER ON TBODY

    const rowComponents = within(tableComponent).getAllByRole('row');

    // Line 1 : header
    // Line 2 : data rows
    expect(rowComponents).toHaveLength(3);

    // Gets the data rows
    const dataRowComponents = rowComponents.slice(1);

    // Check data row 0
    const dataRow0Component = dataRowComponents[0];
    const dataRow0Cells = within(dataRow0Component).getAllByRole('cell');
    expect(dataRow0Cells).toHaveLength(2);
    const dataRow0Cell0Component = dataRow0Cells[0];
    expect(dataRow0Cell0Component).toHaveTextContent(dataValue[0].title);
    const dataRow0Cell1Component = dataRow0Cells[1];
    within(dataRow0Cell1Component).getByLabelText('pi-eye');
    within(dataRow0Cell1Component).getByLabelText('pi-pencil');
    within(dataRow0Cell1Component).getByLabelText('pi-trash');

    // Check data row 1
    const dataRow1Component = dataRowComponents[1];
    const dataRow1Cells = within(dataRow1Component).getAllByRole('cell');
    expect(dataRow1Cells).toHaveLength(2);
    const dataRow1Cell0Component = dataRow1Cells[0];
    expect(dataRow1Cell0Component).toHaveTextContent(dataValue[1].title);
    const dataRow1Cell1Component = dataRow1Cells[1];
    within(dataRow1Cell1Component).getByLabelText('pi-eye');
    within(dataRow1Cell1Component).getByLabelText('pi-pencil');
    within(dataRow1Cell1Component).getByLabelText('pi-trash');
  });

  it('displays "no data" when data returned by backend is null', async () => {
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === AppConfConstants.APP_PREFIX + Api.Topic.getAll()
        && init?.method === 'GET'
      ) {
        return Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              data: null,
              messages: [],
            }),
        });
      }
      return null;
    });
    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);
    render(<RouterProvider router={router} />);

    // Check the call of API to get the data
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.getAll(),
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      ),
    );

    // Check the data table is displayed and empty.
    // Get the table.
    const datatableComponent = await screen.findByTestId('datatable');
    const tableComponent = within(datatableComponent).getByRole('table');

    // BUG IN PRIMEREACT, SPACE IN ROLE, AND SO NOT POSSIBLE TO FILTER ON TBODY
    // Gets the rows  (1 row of header + X rows of data).
    const rowComponents = within(tableComponent).getAllByRole('row');

    // Row 1 : header
    // Row 2 : data row, row indicating that there is no data
    expect(rowComponents.length).toEqual(2);

    // Gets the data rows
    const dataRowComponents = rowComponents.slice(1);

    // 1 data row : the one indicating that there is no data
    expect(dataRowComponents).toHaveLength(1);
    expect(dataRowComponents[0]).toHaveTextContent('topic.listTopics.error.nodata');
  });

  it('shows error notification if backend returns 400', async () => {
    // Mocks the fetch
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === AppConfConstants.APP_PREFIX + Api.Topic.getAll()
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
    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);
    render(<RouterProvider router={router} />);

    // Check the call of API to get the data
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.getAll(),
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      ),
    );

    // Check CALL of error notification
    expect(mockNotify).toHaveBeenCalledWith('ERROR', 'TEST ERROR');

    // Check that the datatable contains error message (because bad answer from backend)
    const datatableComponent = await screen.findByTestId('datatable');
    expect(datatableComponent).toHaveTextContent(
      'topic.listTopics.error.errorLoading',
    );
  });

  it('shows error notification if fetch throw error', async () => {
    // Mocks the fetch
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === AppConfConstants.APP_PREFIX + Api.Topic.getAll()
        && init?.method === 'GET'
      ) {
        throw new Error('FETCH ERROR');
      }
    });

    // Renders the component
    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);
    render(<RouterProvider router={router} />);

    // Check the call of API to get the data
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.getAll(),
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      ),
    );

    // Check CALL of error notification
    expect(mockNotify).toHaveBeenCalledWith('ERROR', expect.stringContaining('FETCH ERROR'),
    );

    // Check that the datatable contains error message (because bad answer from backend)
    const datatableComponent = await screen.findByTestId('datatable');
    expect(datatableComponent).toHaveTextContent(
      'topic.listTopics.error.errorLoading',
    );
  });

  it('shows default error notification if fetch throw null', async () => {
    // Mocks the fetch
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === AppConfConstants.APP_PREFIX + Api.Topic.getAll()
        && init?.method === 'GET'
      ) {
        // eslint-disable-next-line no-throw-literal
        throw null;
      }
    });

    // Renders the component
    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);
    render(<RouterProvider router={router} />);

    // Check the call of API to get the data
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.getAll(),
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      ),
    );

    // Check CALL of error notification
    expect(mockNotify).toHaveBeenCalledWith('ERROR', expect.stringContaining('global.error.unexpectedError'));

    // Check that the datatable contains error message (because bad answer from backend)
    const datatableComponent = await screen.findByTestId('datatable');
    expect(datatableComponent).toHaveTextContent(
      'topic.listTopics.error.errorLoading',
    );
  });

  it('opens topic page when clicking on edit button', async () => {
    const dataValue = [
      {
        id: 1,
        title: 'title1',
        text: 'text1',
        createdDate: '2024-09-25 19:20:10',
        lastModifiedDate: '2024-09-25 19:20:10',
        creatorUser: 'user',
      },
      {
        id: 2,
        title: 'title2',
        text: 'text2',
        createdDate: '2024-09-25 19:20:11',
        lastModifiedDate: '2024-09-25 19:20:11',
        creatorUser: 'user',
      },
    ];

    // Mocks the keycloak
    const keycloak = getKeycloakInstance({
      authenticated: true,
      preferred_username: 'user',
      sub: 'user',
    });

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockReturnValue({
      initialized: true,
      keycloak,
    });

    // Mocks the fetch
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            data: dataValue,
            messages: [],
          }),
      }),
    );

    // Renders the component
    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);

    render(<RouterProvider router={router} />);

    // Get the datatable component.
    const datatableComponent = await screen.findByTestId('datatable');
    const tableComponent = within(datatableComponent).getByRole('table');
    // const tbodyComponent = within(tableComponent).getAllByRole(' rowgroup');  // BUG IN PRIMEREACT, SPACE IN ROLE, AND SO NOT POSSIBLE TO FILTER ON TBODY

    const rowComponents = within(tableComponent).getAllByRole('row');

    // Line 1 : header
    // Line 2 : data rows
    expect(rowComponents).toHaveLength(3);

    // Gets the data rows
    const dataRowComponents = rowComponents.slice(1);

    // Gets data row 0
    const dataRow0Component = dataRowComponents[0];

    // Gets edit button on row 0
    const editButton = await within(dataRow0Component).findByRole('button', {
      name: 'pi-pencil',
    });
    await waitFor(async () => editButton.click());

    expect(mockUseNavigate).toHaveBeenCalledWith('/edittopic/1');
  });

  it('opens topic page when clicking on edit button for topic with ID 0', async () => {
    const dataValue = [
      {
        id: 0,
        title: 'title0',
        text: 'text0',
        createdDate: '2024-09-25 19:20:10',
        lastModifiedDate: '2024-09-25 19:20:10',
        creatorUser: 'user',
      },
      {
        id: 1,
        title: 'title1',
        text: 'text1',
        createdDate: '2024-09-25 19:20:11',
        lastModifiedDate: '2024-09-25 19:20:11',
        creatorUser: 'user',
      },
    ];

    // Mocks the keycloak
    const keycloak = getKeycloakInstance({
      authenticated: true,
      preferred_username: 'user',
      sub: 'user',
    });

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockReturnValue({
      initialized: true,
      keycloak,
    });

    // Mocks the fetch
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            data: dataValue,
            messages: [],
          }),
      }),
    );

    // Renders the component
    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);

    render(<RouterProvider router={router} />);

    // Get the datatable component.
    const datatableComponent = await screen.findByTestId('datatable');
    const tableComponent = within(datatableComponent).getByRole('table');
    // const tbodyComponent = within(tableComponent).getAllByRole(' rowgroup');  // BUG IN PRIMEREACT, SPACE IN ROLE, AND SO NOT POSSIBLE TO FILTER ON TBODY

    const rowComponents = within(tableComponent).getAllByRole('row');

    // Line 1 : header
    // Line 2 : data rows
    expect(rowComponents).toHaveLength(3);

    // Gets the data rows
    const dataRowComponents = rowComponents.slice(1);

    // Gets data row with ID 0
    const dataRowID0Components = dataRowComponents.filter(dataRow => dataRow.textContent?.includes('title0'));

    // Gets edit button on row 0
    const editButton = await within(dataRowID0Components[0]).findByRole('button', {
      name: 'pi-pencil',
    });
    await waitFor(() => editButton.click());

    expect(mockUseNavigate).toHaveBeenCalledWith('/edittopic/0');
  });

  it('deletes topic when clicking on delete button', async () => {
    const dataValue = [
      {
        id: 1,
        title: 'title1',
        text: 'text1',
        createdDate: '2024-09-25 19:20:10',
        lastModifiedDate: '2024-09-25 19:20:10',
        creatorUser: 'user',
      },
      {
        id: 2,
        title: 'title2',
        text: 'text2',
        createdDate: '2024-09-25 19:20:11',
        lastModifiedDate: '2024-09-25 19:20:11',
        creatorUser: 'user',
      },
    ];

    const keycloak = getKeycloakInstance({
      authenticated: true,
      preferred_username: 'user',
      sub: 'user',
    });

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockReturnValue({
      initialized: true,
      keycloak,
    });

    mockFetch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            data: dataValue,
            messages: [],
          }),
      }),
    );

    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);

    render(<RouterProvider router={router} />);

    // Get the datatable component.
    const datatableComponent = await screen.findByTestId('datatable');
    const tableComponent = within(datatableComponent).getByRole('table');
    // const tbodyComponent = within(tableComponent).getAllByRole(' rowgroup');  // BUG IN PRIMEREACT, SPACE IN ROLE, AND SO NOT POSSIBLE TO FILTER ON TBODY

    const rowComponents = within(tableComponent).getAllByRole('row');

    // Line 1 : header
    // Line 2 : data rows
    expect(rowComponents).toHaveLength(3);

    // Gets the data rows
    const dataRowComponents = rowComponents.slice(1);

    // Gets data row 0
    const dataRow0Component = dataRowComponents[0];

    // Click on delete button
    const deleteButton = await within(dataRow0Component).findByRole(
      'button',
      {
        name: 'pi-trash',
      },
    );
    await waitFor(() => deleteButton.click());

    // Validation in confirmation dialog
    const deleteDialog = await screen.findByLabelText('delete-dialog');
    const validateButton = await within(deleteDialog).findByLabelText('yes-button');
    await waitFor(() => validateButton.click());

    // Wait for the confirmation dialog to close
    await waitFor(() => expect(deleteDialog).not.toBeInTheDocument());

    // Checks the call of the delete API.
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      AppConfConstants.APP_PREFIX + Api.Topic.delete(1),
      {
        headers: { 'content-type': 'application/json' },
        method: 'DELETE',
      },
    );

    // Checks the call of the findAll after the delete
    await waitFor(() => {
      expect(mockFetch).toHaveBeenNthCalledWith(
        3,
        AppConfConstants.APP_PREFIX + Api.Topic.getAll(),
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      );
    });
  });

  it('deletes topic when clicking on delete button with ID 0', async () => {
    const dataValue = [
      {
        id: 0,
        title: 'title0',
        text: 'text0',
        createdDate: '2024-09-25 19:20:10',
        lastModifiedDate: '2024-09-25 19:20:10',
        creatorUser: 'user',
      },
      {
        id: 1,
        title: 'title1',
        text: 'text1',
        createdDate: '2024-09-25 19:20:11',
        lastModifiedDate: '2024-09-25 19:20:11',
        creatorUser: 'user',
      },
    ];

    const keycloak = getKeycloakInstance({
      authenticated: true,
      preferred_username: 'user',
      sub: 'user',
    });

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockReturnValue({
      initialized: true,
      keycloak,
    });

    mockFetch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            data: dataValue,
            messages: [],
          }),
      }),
    );

    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);

    render(<RouterProvider router={router} />);

    // Get the datatable component.
    const datatableComponent = await screen.findByTestId('datatable');
    const tableComponent = within(datatableComponent).getByRole('table');
    // const tbodyComponent = within(tableComponent).getAllByRole(' rowgroup');  // BUG IN PRIMEREACT, SPACE IN ROLE, AND SO NOT POSSIBLE TO FILTER ON TBODY

    const rowComponents = within(tableComponent).getAllByRole('row');

    // Line 1 : header
    // Line 2 : data rows
    expect(rowComponents).toHaveLength(3);

    // Gets the data rows
    const dataRowComponents = rowComponents.slice(1);

    // Gets data row 0
    const dataRowID0Components = dataRowComponents.filter(dataRowComponent => dataRowComponent.textContent?.includes('title0'));

    // Click on delete button
    const deleteButton = await within(dataRowID0Components[0]).findByRole(
      'button',
      {
        name: 'pi-trash',
      },
    );
    await waitFor(() => deleteButton.click());

    // Validation in confirmation dialog
    const deleteDialog = await screen.findByLabelText('delete-dialog');
    const validateButton = await within(deleteDialog).findByLabelText('yes-button');
    await waitFor(() => validateButton.click());

    // Wait for the confirmation dialog to close
    await waitFor(() => expect(deleteDialog).not.toBeInTheDocument());

    // Checks the call of the delete API.
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      AppConfConstants.APP_PREFIX + Api.Topic.delete(0),
      {
        headers: { 'content-type': 'application/json' },
        method: 'DELETE',
      },
    );

    // Checks the call of the findAll after the delete
    await waitFor(() => {
      expect(mockFetch).toHaveBeenNthCalledWith(
        3,
        AppConfConstants.APP_PREFIX + Api.Topic.getAll(),
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      );
    });
  });

  it('DOES NOTHING when try to delete topic but CANCEL in confirmation dialog', async () => {
    const dataValue = [
      {
        id: 1,
        title: 'title1',
        text: 'text1',
        createdDate: '2024-09-25 19:20:10',
        lastModifiedDate: '2024-09-25 19:20:10',
        creatorUser: 'user',
      },
      {
        id: 2,
        title: 'title2',
        text: 'text2',
        createdDate: '2024-09-25 19:20:11',
        lastModifiedDate: '2024-09-25 19:20:11',
        creatorUser: 'user',
      },
    ];

    // Mocks the keycloak
    const keycloak = getKeycloakInstance({
      authenticated: true,
      preferred_username: 'user',
      sub: 'user',
    });

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockReturnValue({
      initialized: true,
      keycloak,
    });

    // Mocks the fetch
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            data: dataValue,
            messages: [],
          }),
      }),
    );

    // Renders the component
    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);

    render(<RouterProvider router={router} />);

    // Get the datatable component.
    const datatableComponent = await screen.findByTestId('datatable');
    const tableComponent = within(datatableComponent).getByRole('table');
    // const tbodyComponent = within(tableComponent).getAllByRole(' rowgroup');  // BUG IN PRIMEREACT, SPACE IN ROLE, AND SO NOT POSSIBLE TO FILTER ON TBODY

    const rowComponents = within(tableComponent).getAllByRole('row');

    // Line 1 : header
    // Line 2 : data rows
    expect(rowComponents).toHaveLength(3);

    // Gets the data rows
    const dataRowComponents = rowComponents.slice(1);

    // Gets data row 0
    const dataRow0Component = dataRowComponents[0];

    // Click on delete button
    const deleteButton = await within(dataRow0Component).findByRole(
      'button',
      {
        name: 'pi-trash',
      },
    );
    await waitFor(() => deleteButton.click());

    // Get the confirmation dialog
    const deleteDialog = await screen.findByLabelText('delete-dialog');

    // Click on cancel button in the confirmation dialog
    const cancelButton = await within(deleteDialog).findByLabelText('no-button');
    await waitFor(() => cancelButton.click());

    // Wait for the confirmation dialog to close
    await waitFor(() => expect(deleteDialog).not.toBeInTheDocument());

    // Checks that the delete API is NOT called.
    expect(mockFetch).not.toHaveBeenNthCalledWith(
      2,
      AppConfConstants.APP_PREFIX + Api.Topic.delete(1),
      {
        headers: { 'content-type': 'application/json' },
        method: 'DELETE',
      },
    );
  });

  it('DOES NOTHING when try to delete topic but CLOSE in confirmation dialog', async () => {
    const dataValue = [
      {
        id: 1,
        title: 'title1',
        text: 'text1',
        createdDate: '2024-09-25 19:20:10',
        lastModifiedDate: '2024-09-25 19:20:10',
        creatorUser: 'user',
      },
      {
        id: 2,
        title: 'title2',
        text: 'text2',
        createdDate: '2024-09-25 19:20:11',
        lastModifiedDate: '2024-09-25 19:20:11',
        creatorUser: 'user',
      },
    ];

    // Mocks the keycloak
    const keycloak = getKeycloakInstance({
      authenticated: true,
      preferred_username: 'user',
      sub: 'user',
    });

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockReturnValue({
      initialized: true,
      keycloak,
    });

    // Mocks the fetch
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            data: dataValue,
            messages: [],
          }),
      }),
    );

    // Renders the component
    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);

    render(<RouterProvider router={router} />);

    // Get the datatable component.
    const datatableComponent = await screen.findByTestId('datatable');
    const tableComponent = within(datatableComponent).getByRole('table');
    // const tbodyComponent = within(tableComponent).getAllByRole(' rowgroup');  // BUG IN PRIMEREACT, SPACE IN ROLE, AND SO NOT POSSIBLE TO FILTER ON TBODY

    const rowComponents = within(tableComponent).getAllByRole('row');

    // Line 1 : header
    // Line 2 : data rows
    expect(rowComponents).toHaveLength(3);

    // Gets the data rows
    const dataRowComponents = rowComponents.slice(1);

    // Gets data row 0
    const dataRow0Component = dataRowComponents[0];

    // Click on delete button
    const deleteButton = await within(dataRow0Component).findByRole(
      'button',
      {
        name: 'pi-trash',
      },
    );
    await waitFor(() => deleteButton.click());

    // Get the confirmation dialog
    const deleteDialog = await screen.findByLabelText('delete-dialog');

    // Click on close button in the confirmation dialog
    const closeButton = await within(deleteDialog).findByLabelText(
      'delete-dialog-close-button',
    );
    await waitFor(() => closeButton.click());

    // Wait for the confirmation dialog to close
    await waitFor(() => expect(deleteDialog).not.toBeInTheDocument());

    // Checks that the delete API is NOT called.
    expect(mockFetch).not.toHaveBeenNthCalledWith(
      2,
      AppConfConstants.APP_PREFIX + Api.Topic.delete(1),
      {
        headers: { 'content-type': 'application/json' },
        method: 'DELETE',
      },
    );
  });

  it('opens view topic page when clicking on view button', async () => {
    const dataValue = [
      {
        id: 1,
        title: 'title1',
        text: 'text1',
        createdDate: '2024-09-25 19:20:10',
        lastModifiedDate: '2024-09-25 19:20:10',
        creatorUser: 'user',
      },
      {
        id: 2,
        title: 'title2',
        text: 'text2',
        createdDate: '2024-09-25 19:20:11',
        lastModifiedDate: '2024-09-25 19:20:11',
        creatorUser: 'user',
      },
    ];

    // Mocks the fetch
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            data: dataValue,
            messages: [],
          }),
      }),
    );

    // Renders the component
    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);

    render(<RouterProvider router={router} />);

    // Get the datatable component.
    const datatableComponent = await screen.findByTestId('datatable');
    const tableComponent = within(datatableComponent).getByRole('table');
    // const tbodyComponent = within(tableComponent).getAllByRole(' rowgroup');  // BUG IN PRIMEREACT, SPACE IN ROLE, AND SO NOT POSSIBLE TO FILTER ON TBODY

    const rowComponents = within(tableComponent).getAllByRole('row');

    // Line 1 : header
    // Line 2 : data rows
    expect(rowComponents).toHaveLength(3);

    // Gets the data rows
    const dataRowComponents = rowComponents.slice(1);

    // Gets data row 0
    const dataRow0Component = dataRowComponents[0];

    // Click on view button
    const viewButton = await within(dataRow0Component).findByRole('button', {
      name: 'pi-eye',
    });
    await waitFor(async () => viewButton.click());

    // Checks the call of the navigate to go to view page.
    expect(mockUseNavigate).toHaveBeenCalledWith('/viewtopic/1');
  });

  it('opens view topic page when clicking on view button with ID 0', async () => {
    const dataValue = [
      {
        id: 0,
        title: 'title0',
        text: 'text0',
        createdDate: '2024-09-25 19:20:10',
        lastModifiedDate: '2024-09-25 19:20:10',
        creatorUser: 'user',
      },
      {
        id: 1,
        title: 'title1',
        text: 'text1',
        createdDate: '2024-09-25 19:20:11',
        lastModifiedDate: '2024-09-25 19:20:11',
        creatorUser: 'user',
      },
    ];

    // Mocks the fetch
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            data: dataValue,
            messages: [],
          }),
      }),
    );

    // Renders the component
    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);

    render(<RouterProvider router={router} />);

    // Get the datatable component.
    const datatableComponent = await screen.findByTestId('datatable');
    const tableComponent = within(datatableComponent).getByRole('table');
    // const tbodyComponent = within(tableComponent).getAllByRole(' rowgroup');  // BUG IN PRIMEREACT, SPACE IN ROLE, AND SO NOT POSSIBLE TO FILTER ON TBODY

    const rowComponents = within(tableComponent).getAllByRole('row');

    // Line 1 : header
    // Line 2 : data rows
    expect(rowComponents).toHaveLength(3);

    // Gets the data rows
    const dataRowComponents = rowComponents.slice(1);

    // Gets data row with ID 0
    const dataRowID0Components = dataRowComponents.filter(dataRow => dataRow.textContent?.includes('title0'));

    // Click on view button
    const viewButton = await within(dataRowID0Components[0]).findByRole('button', {
      name: 'pi-eye',
    });
    await waitFor(async () => viewButton.click());

    // Checks the call of the navigate to go to view page.
    expect(mockUseNavigate).toHaveBeenCalledWith('/viewtopic/0');
  });

  it('opens view topic page when selecting a row', async () => {
    const dataValue = [
      {
        id: 1,
        title: 'title1',
        text: 'text1',
        createdDate: '2024-09-25 19:20:10',
        lastModifiedDate: '2024-09-25 19:20:10',
        creatorUser: 'user',
      },
      {
        id: 2,
        title: 'title2',
        text: 'text2',
        createdDate: '2024-09-25 19:20:11',
        lastModifiedDate: '2024-09-25 19:20:11',
        creatorUser: 'user',
      },
    ];

    // Mocks the fetch
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            data: dataValue,
            messages: [],
          }),
      }),
    );

    // Renders the component
    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);

    render(<RouterProvider router={router} />);

    // Get the datatable component.
    const datatableComponent = await screen.findByTestId('datatable');
    const tableComponent = within(datatableComponent).getByRole('table');
    // const tbodyComponent = within(tableComponent).getAllByRole(' rowgroup');  // BUG IN PRIMEREACT, SPACE IN ROLE, AND SO NOT POSSIBLE TO FILTER ON TBODY

    const rowComponents = within(tableComponent).getAllByRole('row');

    // Line 1 : header
    // Line 2 : data rows
    expect(rowComponents).toHaveLength(3);

    // Gets the data rows
    const dataRowComponents = rowComponents.slice(1);

    // Gets data row 0
    const dataRow0Component = dataRowComponents[0];

    // Click on the data row 0
    await waitFor(async () => dataRow0Component.click());

    // Checks the call of the navigate to go to view page.
    expect(mockUseNavigate).toHaveBeenCalledWith('/viewtopic/1');
  });

  it('can filter rows', async () => {
    const dataValue = [
      {
        id: 1,
        title: 'title1',
        text: 'text1',
        createdDate: '2024-09-25 19:20:10',
        lastModifiedDate: '2024-09-25 19:20:10',
        creatorUser: 'user',
      },
      {
        id: 2,
        title: 'title2',
        text: 'text2',
        createdDate: '2024-09-25 19:20:11',
        lastModifiedDate: '2024-09-25 19:20:11',
        creatorUser: 'user',
      },
    ];

    // Mocks the fetch
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === AppConfConstants.APP_PREFIX + Api.Topic.getAll()
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

    // Renders the component
    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);
    render(<RouterProvider router={router} />);

    // Check the call of API to get the data
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.getAll(),
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      ),
    );

    // Get the datatable component.
    const datatableComponent = await screen.findByTestId('datatable');
    const tableComponent = within(datatableComponent).getByRole('table');

    // const tbodyComponent = within(tableComponent).getAllByRole(' rowgroup');  // BUG IN PRIMEREACT, SPACE IN ROLE, AND SO NOT POSSIBLE TO FILTER ON TBODY

    let rowComponents = within(tableComponent).getAllByRole('row');

    // Line 1 : header
    // Line 2 : data rows
    expect(rowComponents).toHaveLength(3);

    // Gets the data rows
    let dataRowComponents = rowComponents.slice(1);
    expect(dataRowComponents).toHaveLength(2);

    // CONTROLS BEFORE FILTERING
    // Check data row 0
    let dataRow0Component = dataRowComponents[0];
    let dataRow0Cells = within(dataRow0Component).getAllByRole('cell');
    expect(dataRow0Cells).toHaveLength(2);
    let dataRow0Cell0Component = dataRow0Cells[0];
    expect(dataRow0Cell0Component).toHaveTextContent('title1');

    // Check data row 1
    let dataRow1Component = dataRowComponents[1];
    let dataRow1Cells = within(dataRow1Component).getAllByRole('cell');
    expect(dataRow1Cells).toHaveLength(2);
    let dataRow1Cell0Component = dataRow1Cells[0];
    expect(dataRow1Cell0Component).toHaveTextContent('title2');

    // ADD FILTER
    // Gets the filter component
    const filterComponent = within(datatableComponent).getByLabelText('filter');
    const filterTextComponent = within(filterComponent).getByLabelText('filter-text');
    userEvent.type(filterTextComponent, 'title2');
    expect(filterTextComponent).toHaveValue('title2');

    // CONTROLS AFTER ADDING FILTER
    // Check data row 0
    rowComponents = within(tableComponent).getAllByRole('row');
    expect(rowComponents).toHaveLength(2); // HEADER + 1 DATA ROW
    dataRowComponents = rowComponents.slice(1);
    dataRow0Component = dataRowComponents[0];
    dataRow0Cells = within(dataRow0Component).getAllByRole('cell');
    expect(dataRow0Cells).toHaveLength(2);
    dataRow0Cell0Component = dataRow0Cells[0];
    expect(dataRow0Cell0Component).toHaveTextContent('title2');

    // CLEAR FILTER
    // Click the clear filter button
    const filterButtonClearComponent = within(filterComponent).getByLabelText(
      'filter-button-clear',
    );
    userEvent.click(filterButtonClearComponent);

    // No filter anymore
    expect(filterTextComponent).toHaveValue('');

    // CONTROLS AFTER CLEARING FILTER
    // Check data rows
    rowComponents = within(tableComponent).getAllByRole('row');
    expect(rowComponents).toHaveLength(3); // HEADER + 2 DATA ROWS
    dataRowComponents = rowComponents.slice(1);

    // Check data row 0
    dataRow0Component = dataRowComponents[0];
    dataRow0Cells = within(dataRow0Component).getAllByRole('cell');
    expect(dataRow0Cells).toHaveLength(2);
    dataRow0Cell0Component = dataRow0Cells[0];
    expect(dataRow0Cell0Component).toHaveTextContent('title1');

    // Check data row 1
    dataRow1Component = dataRowComponents[1];
    dataRow1Cells = within(dataRow1Component).getAllByRole('cell');
    expect(dataRow1Cells).toHaveLength(2);
    dataRow1Cell0Component = dataRow1Cells[0];
    expect(dataRow1Cell0Component).toHaveTextContent('title2');
  });

  it('displays rows even with undefined dates', async () => {
    const dataValue = [
      {
        id: 1,
        title: 'title1',
        text: 'text1',
        createdDate: undefined,
        lastModifiedDate: undefined,
        creatorUser: 'user',
      },
      {
        id: 2,
        title: 'title2',
        text: 'text2',
        createdDate: undefined,
        lastModifiedDate: undefined,
        creatorUser: 'user',
      },
    ];
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url === AppConfConstants.APP_PREFIX + Api.Topic.getAll()
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
    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);
    render(<RouterProvider router={router} />);

    // Check the call of API to get the data
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        AppConfConstants.APP_PREFIX + Api.Topic.getAll(),
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      ),
    );

    // Get the datatable component.
    const datatableComponent = await screen.findByTestId('datatable');
    const tableComponent = within(datatableComponent).getByRole('table');
    // const tbodyComponent = within(tableComponent).getAllByRole(' rowgroup');  // BUG IN PRIMEREACT, SPACE IN ROLE, AND SO NOT POSSIBLE TO FILTER ON TBODY

    const rowComponents = within(tableComponent).getAllByRole('row');

    // Line 1 : header
    // Line 2 : data rows
    expect(rowComponents).toHaveLength(3);
  });

  it('DOES NOT try to open edit topic page when clicking edit button if topic ID is null', async () => {
    const dataValue = [
      {
        id: null,
        title: 'title1',
        text: 'text1',
        createdDate: '2024-09-25 19:20:10',
        lastModifiedDate: '2024-09-25 19:20:10',
        creatorUser: 'user',
      },
      {
        id: 2,
        title: 'title2',
        text: 'text2',
        createdDate: '2024-09-25 19:20:11',
        lastModifiedDate: '2024-09-25 19:20:11',
        creatorUser: 'user',
      },
    ];

    // Mocks the keycloak
    const keycloak = getKeycloakInstance({
      authenticated: true,
      preferred_username: 'user',
      sub: 'user',
    });

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockReturnValue({
      initialized: true,
      keycloak,
    });

    // Mocks the fetch
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            data: dataValue,
            messages: [],
          }),
      }),
    );

    // Renders the component
    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);

    render(<RouterProvider router={router} />);

    // Get the datatable component.
    const datatableComponent = await screen.findByTestId('datatable');
    const tableComponent = within(datatableComponent).getByRole('table');
    // const tbodyComponent = within(tableComponent).getAllByRole(' rowgroup');  // BUG IN PRIMEREACT, SPACE IN ROLE, AND SO NOT POSSIBLE TO FILTER ON TBODY

    const rowComponents = within(tableComponent).getAllByRole('row');

    // Line 1 : header
    // Line 2 : data rows
    expect(rowComponents).toHaveLength(3);

    // Gets the data rows
    const dataRowComponents = rowComponents.slice(1);

    // Gets data row 0
    const dataRow0Component = dataRowComponents[0];

    // Clear the mock before clicking the button.
    mockUseNavigate.mockClear();

    // Click edit button on row 0
    const editButton = await within(dataRow0Component).findAllByRole('button', {
      name: 'pi-pencil',
    });
    await waitFor(async () => editButton[0].click());

    expect(mockUseNavigate).not.toHaveBeenCalled();
  });

  it('DOES NOT try to delete when clicking delete button if topic ID is null', async () => {
    const dataValue = [
      {
        id: null,
        title: 'title1',
        text: 'text1',
        createdDate: '2024-09-25 19:20:10',
        lastModifiedDate: '2024-09-25 19:20:10',
        creatorUser: 'user',
      },
      {
        id: 2,
        title: 'title2',
        text: 'text2',
        createdDate: '2024-09-25 19:20:11',
        lastModifiedDate: '2024-09-25 19:20:11',
        creatorUser: 'user',
      },
    ];

    const keycloak = getKeycloakInstance({
      authenticated: true,
      preferred_username: 'user',
      sub: 'user',
    });

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockReturnValue({
      initialized: true,
      keycloak,
    });

    mockFetch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            data: dataValue,
            messages: [],
          }),
      }),
    );

    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);

    render(<RouterProvider router={router} />);

    // Get the datatable component.
    const datatableComponent = await screen.findByTestId('datatable');
    const tableComponent = within(datatableComponent).getByRole('table');
    // const tbodyComponent = within(tableComponent).getAllByRole(' rowgroup');  // BUG IN PRIMEREACT, SPACE IN ROLE, AND SO NOT POSSIBLE TO FILTER ON TBODY

    const rowComponents = within(tableComponent).getAllByRole('row');

    // Line 1 : header
    // Line 2 : data rows
    expect(rowComponents).toHaveLength(3);

    // Gets the data rows
    const dataRowComponents = rowComponents.slice(1);

    // Gets data row 0
    const dataRow0Component = dataRowComponents[0];

    // Click on delete button
    const deleteButton = await within(dataRow0Component).findAllByRole(
      'button',
      {
        name: 'pi-trash',
      },
    );
    await waitFor(() => deleteButton[0].click());

    // Clear the mock before clicking the button.
    mockFetch.mockClear();

    // Validation in confirmation dialog
    const deleteDialog = await screen.findByLabelText('delete-dialog');
    const validateButton = await within(deleteDialog).findByLabelText('yes-button');
    await waitFor(() => validateButton.click());

    // Wait for the confirmation dialog to close
    await waitFor(() => expect(deleteDialog).not.toBeInTheDocument());

    // Checks the call of the delete API.
    expect(mockFetch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
      }),
    );
  });

  it('DOES NOT try to open view topic page when selecting a row if topic ID is null', async () => {
    const dataValue = [
      {
        id: null,
        title: 'title1',
        text: 'text1',
        createdDate: '2024-09-25 19:20:10',
        lastModifiedDate: '2024-09-25 19:20:10',
        creatorUser: 'user',
      },
      {
        id: 2,
        title: 'title2',
        text: 'text2',
        createdDate: '2024-09-25 19:20:11',
        lastModifiedDate: '2024-09-25 19:20:11',
        creatorUser: 'user',
      },
    ];

    // Mocks the fetch
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            data: dataValue,
            messages: [],
          }),
      }),
    );

    // Renders the component
    const router = createMemoryRouter([
      { path: '*', element: <ListAvailableTopics /> },
    ]);

    render(<RouterProvider router={router} />);

    // Get the datatable component.
    const datatableComponent = await screen.findByTestId('datatable');
    const tableComponent = within(datatableComponent).getByRole('table');
    // const tbodyComponent = within(tableComponent).getAllByRole(' rowgroup');  // BUG IN PRIMEREACT, SPACE IN ROLE, AND SO NOT POSSIBLE TO FILTER ON TBODY

    const rowComponents = within(tableComponent).getAllByRole('row');

    // Line 1 : header
    // Line 2 : data rows
    expect(rowComponents).toHaveLength(3);

    // Gets the data rows
    const dataRowComponents = rowComponents.slice(1);

    // Gets data row 0
    const dataRow0Component = dataRowComponents[0];

    // Clears the useNavigate mock before selecting a row in the datatable.
    mockUseNavigate.mockClear();

    // Click on the data row 0
    await waitFor(async () => dataRow0Component.click());

    // Checks the call of the navigate to go to view page.
    expect(mockUseNavigate).not.toHaveBeenCalled();
  });
});
