import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import routesConfig from './routesConfig';
import Keycloak from 'keycloak-js';

const mockUseKeycloak = jest.fn().mockImplementation(() => {
  return {
    keycloak: null,
  };
});

jest.mock('../keycloak', () => ({
  useKeycloak: () => mockUseKeycloak(),
  keycloak: {
    init: jest.fn().mockImplementation(() => ({
      catch: jest.fn(),
    })),
  },
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
  init: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  accountManagement: jest.fn(),
  createLoginUrl: jest.fn(),
  createLogoutUrl: jest.fn(),
  createRegisterUrl: jest.fn(),
  createAccountUrl: jest.fn(),
  isTokenExpired: jest.fn(),
  updateToken: jest.fn(),
  clearToken: jest.fn(),
  hasRealmRole: jest.fn(),
  hasResourceRole: jest.fn(),
  loadUserProfile: jest.fn(),
  loadUserInfo: jest.fn(),
});

jest.mock('../pages', () => ({
  HomePage: () => <div>HOME</div>,
  EditTopic: () => <div>EDIT_TOPIC</div>,
  ViewTopic: () => <div>VIEW_TOPIC</div>,
}));

jest.mock('../components', () => ({
  Header: () => <div>HEADER</div>,
}));

describe('The routesConfig ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays properly home page', async () => {
    const router = createMemoryRouter(routesConfig, {
      initialEntries: ['/'],
    });
    render(<RouterProvider router={router} />);

    const homePageComponent = await screen.findByText('HOME');
    expect(homePageComponent).toBeDefined();
  });

  it('displays properly edit topic page', async () => {
    const keycloak = getKeycloakInstance({
      authenticated: true,
      preferred_username: 'user',
      sub: 'user',
    });

    mockUseKeycloak.mockReturnValue({
      initialized: true,
      keycloak,
    });

    const router = createMemoryRouter(routesConfig, {
      initialEntries: ['/edittopic/1'],
    });
    render(<RouterProvider router={router} />);

    const editTopicPageComponent = await screen.findByText('EDIT_TOPIC');
    expect(editTopicPageComponent).toBeDefined();
  });

  it('displays properly view topic page', async () => {
    const router = createMemoryRouter(routesConfig, {
      initialEntries: ['/viewtopic/1'],
    });
    render(<RouterProvider router={router} />);

    const viewTopicPageComponent = await screen.findByText('VIEW_TOPIC');
    expect(viewTopicPageComponent).toBeDefined();
  });
});
