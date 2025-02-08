import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from './Header';
import { MemoryRouter } from 'react-router';
import Keycloak from 'keycloak-js';

const mockUseKeycloak = jest.fn().mockImplementation(() => {
  return {
    keycloak: null,
  };
});

jest.mock('../keycloak', () => ({
  useKeycloak: () => mockUseKeycloak(),
}));

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUseNavigate,
}));

const t = (str: string) => str;
jest.mock('react-i18next', () => ({
  useTranslation: () => {
    return {
      t: t,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
}));

const getKeycloakInstance = ({
  authenticated = false,
  preferred_username = null,
}: {
  authenticated?: boolean;
  preferred_username?: string | null;
}): Keycloak => ({
  authenticated,
  tokenParsed: {
    preferred_username: preferred_username || null,
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

const headerRoutes = ['/', '/edittopic/add'];

describe('The Header component', () => {
  it('renders well when not authenticated', async () => {
    const keycloak = getKeycloakInstance({
      authenticated: false,
    });

    mockUseKeycloak.mockReturnValue({
      initialized: true,
      keycloak,
    });

    render(
      <MemoryRouter initialEntries={headerRoutes}>
        <Header />
      </MemoryRouter>,
    );

    const headerComponent = await screen.findByLabelText('header');

    // Check that the logo is displayed (will fail if this is not the case)
    within(headerComponent).getByLabelText('logo');

    // Check the presence of the Home menu item
    const homeItemComponent = within(headerComponent).getByLabelText(
      'header.menu.home.label',
    );
    expect(homeItemComponent).toHaveTextContent('header.menu.home.label');

    // Check the absence of the Add Topic menu item
    expect(
      within(headerComponent).queryByLabelText('header.menu.addTopic.label'),
    ).toBeNull();

    // Check the presence of the login button
    within(headerComponent).getByLabelText('btn-login');

    // Check the absence of the logout button
    expect(within(headerComponent).queryByLabelText('btn-logout')).toBeNull();
  });

  it('renders well when authenticated', async () => {
    const keycloak = getKeycloakInstance({
      authenticated: true,
      preferred_username: 'user',
    });

    mockUseKeycloak.mockReturnValue({
      initialized: true,
      keycloak,
    });

    render(
      <MemoryRouter initialEntries={headerRoutes}>
        <Header />
      </MemoryRouter>,
    );

    const headerComponent = await screen.findByLabelText('header');

    // Check that the logo is displayed (will fail if this is not the case)
    within(headerComponent).getByLabelText('logo');

    // Check the presence of the Home menu item
    const homeItemComponent = within(headerComponent).getByLabelText(
      'header.menu.home.label',
    );
    expect(homeItemComponent).toHaveTextContent('header.menu.home.label');

    // Check the presence of the Home menu item
    const addTopicItemComponent = within(headerComponent).getByLabelText(
      'header.menu.addTopic.label',
    );
    expect(addTopicItemComponent).toHaveTextContent(
      'header.menu.addTopic.label',
    );

    // Check the absence of the login button
    expect(within(headerComponent).queryByLabelText('btn-login')).toBeNull();

    // Check the presence of the logout button
    const btnLogout = within(headerComponent).getByLabelText('btn-logout');
    expect(btnLogout).toHaveTextContent('user');

    // Click on the button to open logout menu
    const btnsInternalLogout = within(btnLogout).getAllByRole('button');
    await waitFor(() => userEvent.click(btnsInternalLogout[1]));

    // Check the presence of logout menu item when the menu is open
    const logoutMenuItem = await screen.findByLabelText(
      'header.menu.logout.label',
    );
    expect(logoutMenuItem).toHaveTextContent('header.menu.logout.label');
  });

  it('redirects to home page when clicking home button', async () => {
    const keycloak = getKeycloakInstance({
      authenticated: false,
    });

    mockUseKeycloak.mockImplementation(() => ({
      initialized: true,
      keycloak,
    }));

    render(
      <MemoryRouter initialEntries={headerRoutes}>
        <Header />
      </MemoryRouter>,
    );

    const headerComponent = await screen.findByLabelText('header');

    // Check the presence of the Home menu item
    const homeItemComponent = within(headerComponent).getByLabelText(
      'header.menu.home.label',
    );

    // Gets the link
    const insideLinkElement = within(homeItemComponent).getByText(
      'header.menu.home.label',
    );

    // Click on the Home link
    await waitFor(() => userEvent.click(insideLinkElement));

    // Check the call of the home page
    expect(mockUseNavigate).toHaveBeenCalledWith('/');
  });

  it('redirects to add topic page when clicking add topic button', async () => {
    const keycloak = getKeycloakInstance({
      authenticated: true,
      preferred_username: 'user',
    });

    mockUseKeycloak.mockImplementation(() => ({
      initialized: true,
      keycloak,
    }));

    render(
      <MemoryRouter initialEntries={headerRoutes}>
        <Header />
      </MemoryRouter>,
    );

    const headerComponent = await screen.findByLabelText('header');

    // Check the presence of the Home menu item
    const addTopicItemComponent = within(headerComponent).getByLabelText(
      'header.menu.addTopic.label',
    );

    // Gets the link
    const insideLinkElement = within(addTopicItemComponent).getByText(
      'header.menu.addTopic.label',
    );

    // Click on the Home link
    await waitFor(() => userEvent.click(insideLinkElement));

    // Check the call of the add topic page
    expect(mockUseNavigate).toHaveBeenCalledWith('/edittopic/add');
  });

  it('logs in page when clicking login button', async () => {
    const keycloak = getKeycloakInstance({
      authenticated: false,
    });

    const keycloakLoginSpy = jest.spyOn(keycloak, 'login');

    mockUseKeycloak.mockImplementation(() => ({
      initialized: true,
      keycloak,
    }));

    render(
      <MemoryRouter initialEntries={headerRoutes}>
        <Header />
      </MemoryRouter>,
    );

    const headerComponent = await screen.findByLabelText('header');

    // Check the presence of the login button
    const btnLogin = within(headerComponent).getByLabelText('btn-login');

    // Click on the login button
    await waitFor(() => userEvent.click(btnLogin));

    // Check the call to login
    expect(keycloakLoginSpy).toHaveBeenCalled();
  });

  it('logs out when clicking logout button', async () => {
    const keycloak = getKeycloakInstance({
      authenticated: true,
      preferred_username: 'user',
    });

    const keycloakLogoutSpy = jest.spyOn(keycloak, 'logout');

    mockUseKeycloak.mockImplementation(() => ({
      initialized: true,
      keycloak,
    }));

    render(
      <MemoryRouter initialEntries={headerRoutes}>
        <Header />
      </MemoryRouter>,
    );

    const headerComponent = await screen.findByLabelText('header');

    // Check the presence of the logout button
    const btnLogout = within(headerComponent).getByLabelText('btn-logout');

    // Click on the button to open logout menu
    const btnsInternalLogout = within(btnLogout).getAllByRole('button');
    await waitFor(() => userEvent.click(btnsInternalLogout[1]));

    // Get the logout menu item when the menu is open
    const logoutMenuItemComponent = await screen.findByLabelText(
      'header.menu.logout.label',
    );

    // Gets the link to logout
    const insideLinkElement = within(logoutMenuItemComponent).getByText(
      'header.menu.logout.label',
    );

    // Click on the link to logout
    await waitFor(() => userEvent.click(insideLinkElement));

    // Check the call to logout
    expect(keycloakLogoutSpy).toHaveBeenCalled();
  });
});
