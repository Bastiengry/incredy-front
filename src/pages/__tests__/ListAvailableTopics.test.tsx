import {render, screen} from '@testing-library/react';
import ListAvailableTopics from '../ListAvailableTopics';
import {DataTable} from 'primereact/datatable';
import {Column, ColumnProps} from 'primereact/column';
import {createMemoryRouter, RouterProvider} from 'react-router-dom';

const mockFetch = jest.fn();
const mockUseKeycloak = jest.fn();

global.fetch = jest.fn(mockFetch) as jest.Mock;

jest.mock('@react-keycloak/web', () => ({useKeycloak: () => mockUseKeycloak}));

const mockDataTable = jest.fn();

jest.mock('primereact/datatable', () => ({
  DataTable: (props: any) => mockDataTable(props),
}));

const mockColumn = jest.fn();
jest.mock('primereact/column', () => ({
  Column: (props: any) => mockColumn(props),
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

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useNavigate: () => mockedUsedNavigate,
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('The available topic list', () => {
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
    mockDataTable.mockImplementation((props: any) => {
      return <div data-testid="datatable"></div>;
    });

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
    await screen.findByTestId('datatable');
    expect(mockFetch).toHaveBeenCalled();
    expect(mockDataTable).toHaveBeenCalledWith(
      expect.objectContaining({value: dataValue}),
    );
  });

  it('should open topic page when clicking on edit', async () => {
    mockDataTable.mockImplementation((props: any) => {
      return <div data-testid="datatable">{props?.children}</div>;
    });

    mockColumn.mockImplementation((props: any) => {
      // const TestColumn = jest.requireActual('primereact/column').Column;
      // console.log('TestColumn', TestColumn);
      const Func = props?.body;
      return (
        <div data-field={props?.field} data-header={props?.header}>
          <Func />
        </div>
      );
    });

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
    mockUseKeycloak.mockImplementation(() => ({
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
      name: 'pipencil',
    });

    editButton[0].click();

    expect(mockDataTable).toHaveBeenCalled();
  });
});
