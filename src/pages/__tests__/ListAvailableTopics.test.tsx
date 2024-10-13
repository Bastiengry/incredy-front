import {render, screen, within} from '@testing-library/react';
import ListAvailableTopics from '../ListAvailableTopics';
import {DataTable} from 'primereact/datatable';
import {createMemoryRouter, RouterProvider} from 'react-router-dom';
import {useKeycloak} from '@react-keycloak/web';

const mockFetch = jest.fn();

global.fetch = jest.fn(mockFetch) as jest.Mock;

const mockDataTable = jest.fn();
// jest.mock('primereact/datatable', () => ({
//   DataTable: (props: any) => mockDataTable(props),
// }));

// const mockColumn = jest.fn();
// jest.mock('primereact/column', () => ({
//   Column: (props: any) => mockColumn(props),
// }));

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
  // beforeEach(() => {
  //   jest.clearAllMocks();
  // });

  it('should display even with no topic available', async () => {
    mockDataTable.mockImplementation((props: any) => {
      return <div data-testid="datatable"></div>;
    });
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
    // mockDataTable.mockImplementation((props: any) => {
    //   return <div data-testid="datatable"></div>;
    // });

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

    // expect(datatable).prop('value').toBe(dataValue);
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
});
