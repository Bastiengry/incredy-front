import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import routesConfig from './routesConfig';
import ReactKeycloakWeb from '@react-keycloak/web';
import Keycloak, { KeycloakProfile } from 'keycloak-js';

jest.mock('../security', () => ({
  keycloak: {
    init: jest.fn().mockImplementation(() => ({
      catch: jest.fn(),
    })),
  },
}));

jest.mock('@react-keycloak/web', () => ({
  ...jest.requireActual('@react-keycloak/web'),
  useKeycloak: jest.fn().mockImplementation(() => ({
    keycloak: null,
  })),
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

jest.mock('../pages', () => ({
  HomePage: () => <div>HOME</div>,
  EditTopic: () => <div>EDIT_TOPIC</div>,
  ViewTopic: () => <div>VIEW_TOPIC</div>,
}));

jest.mock('../components', () => ({
  Header: () => <div>HEADER</div>,
}));

describe('The routesConfig ', () => {
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

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockReturnValue({
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
