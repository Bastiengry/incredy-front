import '../../public/appConfig';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import ReactKeycloakWeb from '@react-keycloak/web';
import Keycloak, { KeycloakProfile } from 'keycloak-js';
import { PrivateRoute } from '.';

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

describe('The PrivateRouter component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders component if authenticated', async () => {
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
      {
        path: '*', element: (
          <PrivateRoute>
            <div>Component displayed</div>
          </PrivateRoute>
        ),
      },
    ]);

    render(<RouterProvider router={router} />);

    screen.findByText('Component displayed');
  });

  it('renders component if NOT authenticated', async () => {
    const keycloak = getKeycloakInstance({
      authenticated: false,
    });

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockReturnValue({
      initialized: true,
      keycloak,
    });

    const router = createMemoryRouter([
      {
        path: '*', element: (
          <PrivateRoute>
            <div>Component displayed</div>
          </PrivateRoute>
        ),
      },
    ]);

    render(<RouterProvider router={router} />);

    expect(screen.queryByText('Component displayed')).not.toBeInTheDocument();
  });
});
