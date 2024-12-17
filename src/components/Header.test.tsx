import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from './Header';
import ReactRouterDom, {MemoryRouter} from 'react-router-dom';
import Keycloak, {KeycloakProfile} from 'keycloak-js';
import ReactKeycloakWeb from '@react-keycloak/web';

jest.mock('@react-keycloak/web', () => ({
  ...jest.requireActual('@react-keycloak/web'),
  useKeycloak: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => {
    return {
      t: (str: string) => str,
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

const headerRoutes = ['/', '/edittopic/add'];

describe('The Header component', () => {
  it('renders well when not authenticated', async () => {
    const keycloak = getKeycloakInstance({
      authenticated: false,
    });

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockReturnValue({
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

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockReturnValue({
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
    userEvent.click(btnsInternalLogout[1]);

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

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockImplementation(() => ({
      initialized: true,
      keycloak,
    }));

    const mockNavigate = jest.fn();
    jest.spyOn(ReactRouterDom, 'useNavigate').mockReturnValue(mockNavigate);

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
    userEvent.click(insideLinkElement);

    // Check the call of the home page
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('redirects to add topic page when clicking add topic button', async () => {
    const keycloak = getKeycloakInstance({
      authenticated: true,
      preferred_username: 'user',
    });

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockImplementation(() => ({
      initialized: true,
      keycloak,
    }));

    const mockNavigate = jest.fn();
    jest.spyOn(ReactRouterDom, 'useNavigate').mockReturnValue(mockNavigate);

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
    userEvent.click(insideLinkElement);

    // Check the call of the add topic page
    expect(mockNavigate).toHaveBeenCalledWith('/edittopic/add');
  });

  it('logs in page when clicking login button', async () => {
    const keycloak = getKeycloakInstance({
      authenticated: false,
    });

    const keycloakLoginSpy = jest.spyOn(keycloak, 'login');

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockImplementation(() => ({
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
    userEvent.click(btnLogin);

    // Check the call to login
    expect(keycloakLoginSpy).toHaveBeenCalled();
  });

  it('logs out when clicking logout button', async () => {
    const keycloak = getKeycloakInstance({
      authenticated: true,
      preferred_username: 'user',
    });

    const keycloakLogoutSpy = jest.spyOn(keycloak, 'logout');

    jest.spyOn(ReactKeycloakWeb, 'useKeycloak').mockImplementation(() => ({
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
    userEvent.click(btnsInternalLogout[1]);

    // Get the logout menu item when the menu is open
    const logoutMenuItemComponent = await screen.findByLabelText(
      'header.menu.logout.label',
    );

    // Gets the link to logout
    const insideLinkElement = within(logoutMenuItemComponent).getByText(
      'header.menu.logout.label',
    );

    // Click on the link to logout
    userEvent.click(insideLinkElement);

    // Check the call to logout
    expect(keycloakLogoutSpy).toHaveBeenCalled();
  });
});
