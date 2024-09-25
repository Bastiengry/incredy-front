import {render, screen} from '@testing-library/react';
import ListAvailableTopics from '../ListAvailableTopics';
import {createMemoryRouter, RouterProvider} from 'react-router-dom';
//import {useHttp} from '../../api';

const mockFetch = jest.fn();
const mockUseKeycloak = jest.fn();

// A remplacer par
// jest.mock('../../api/useHttp', () => () => ({
//   httpGetSimple: mockHttpGetSimple,
// }));

global.fetch = jest.fn(mockFetch) as jest.Mock;

jest.mock('@react-keycloak/web', () => ({useKeycloak: () => mockUseKeycloak}));

const mockDataTable = jest.fn();

jest.mock('primereact/datatable', () => ({
  DataTable: (props: any) => {
    mockDataTable((props: any) => props);
    return <div data-testid="datatable"></div>;
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

beforeEach(() => {
  jest.clearAllMocks();
});

describe('The available topic list', () => {
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
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            data: [
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
            ],
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
    expect(mockDataTable).toHaveBeenCalled();
  });
});
