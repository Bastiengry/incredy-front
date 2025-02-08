import '../../public/appConfig';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import Keycloak from 'keycloak-js';
import { PrivateRoute } from '.';

const mockUseKeycloak = jest.fn().mockImplementation(() => {
  return {
    keycloak: null,
  };
});

jest.mock('../keycloak', () => ({
  useKeycloak: () => mockUseKeycloak(),
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

    mockUseKeycloak.mockReturnValue({
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

    mockUseKeycloak.mockReturnValue({
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
