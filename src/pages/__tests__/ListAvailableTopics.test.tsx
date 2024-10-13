import {render, screen, waitFor, within} from '@testing-library/react';
import ListAvailableTopics from '../ListAvailableTopics';
import {createMemoryRouter, RouterProvider} from 'react-router-dom';
import {useKeycloak} from '@react-keycloak/web';
import {Api, HttpConstants} from '../../api';

const mockFetch = jest.fn();

global.fetch = jest.fn(mockFetch) as jest.Mock;

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
}));

jest.mock('@react-keycloak/web', () => ({
  ...jest.requireActual('@react-keycloak/web'),
  useKeycloak: jest.fn().mockImplementation(() => ({
    keycloak: null,
  })),
}));

describe('The available topic list', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display even with no topic available', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            data: [],
            message: [],
            status: 'SUCCESS',
          }),
      }),
    );
    const router = createMemoryRouter([
      {path: '*', element: <ListAvailableTopics />},
    ]);
    render(<RouterProvider router={router} />);
    await screen.findByTestId('datatable');
    expect(mockFetch).toHaveBeenCalled();
  });

  it('should display 2 rows when there are 2 topics', async () => {
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
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            data: dataValue,
            message: [],
            status: 'SUCCESS',
          }),
      }),
    );
    const router = createMemoryRouter([
      {path: '*', element: <ListAvailableTopics />},
    ]);
    render(<RouterProvider router={router} />);
    const datatableElement = await screen.findByTestId('datatable');
    const tableElement = within(datatableElement).getByRole('table');
    // const tbodyElement = within(tableElement).getAllByRole(' rowgroup');  // BUG IN PRIMEREACT, SPACE IN ROLE, AND SO NOT POSSIBLE TO FILTER ON TBODY
    // console.log('tbodyElement', tbodyElement);
    const rowsElements = within(tableElement).getAllByRole('row');
    expect(rowsElements.length).toEqual(3); // 1 header + 2 effective rows

    expect(mockFetch).toHaveBeenCalled();

    // expect(mockDataTable).toHaveBeenCalledWith(
    //   expect.objectContaining({value: dataValue}),
    // );
  });

  it('should open topic page when clicking on edit button', async () => {
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

    const keycloak = {
      tokenParsed: {
        sub: 'user',
      },
    };

    useKeycloak.mockImplementation(() => ({
      keycloak,
    }));

    mockFetch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            data: dataValue,
            message: [],
            status: 'SUCCESS',
          }),
      }),
    );

    const router = createMemoryRouter([
      {path: '*', element: <ListAvailableTopics />},
    ]);

    render(<RouterProvider router={router} />);
    const editButton = await screen.findAllByRole('button', {
      name: 'pi-pencil',
    });
    await editButton[0].click();

    expect(mockUseNavigate).toHaveBeenCalledWith('/edittopic/1');
  });

  it('should delete topic page when clicking on delete button', async () => {
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

    const keycloak = {
      tokenParsed: {
        sub: 'user',
      },
    };

    useKeycloak.mockImplementation(() => ({
      keycloak,
    }));

    mockFetch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            data: dataValue,
            message: [],
            status: 'SUCCESS',
          }),
      }),
    );

    const router = createMemoryRouter([
      {path: '*', element: <ListAvailableTopics />},
    ]);

    render(<RouterProvider router={router} />);

    // Click on delete button
    const deleteButton = await screen.findAllByRole('button', {
      name: 'pi-trash',
    });
    await deleteButton[0].click();

    // Validation in confirmation dialog
    const deleteDialog = await screen.findByLabelText('delete-dialog');
    const validateButton =
      await within(deleteDialog).findByLabelText('yes-button');
    await validateButton.click();

    // Checks the call of the delete API.
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      HttpConstants.APP_PREFIX + Api.Topic.delete(1),
      {
        headers: {'content-type': 'application/json'},
        method: 'DELETE',
      },
    );

    // Checks the call of the findAll after the delete
    await waitFor(() => {
      expect(mockFetch).toHaveBeenNthCalledWith(
        3,
        HttpConstants.APP_PREFIX + Api.Topic.getAll(),
        {
          headers: {'content-type': 'application/json'},
          method: 'GET',
        },
      );
    });
  });
});
