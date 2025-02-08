import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./keycloak', () => ({
  KeycloakProvider: () => <></>,
}));

jest.mock('./router', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');

  return {
    routesConfig: [{
      path: '/',
      element: React.createElement(() => <div>APP TEST</div>),
    }],
  };
});

describe('The App component', () => {
  it('renders well', async () => {
    await render(<App />);
    // Check that the text in the route is displayed
    const internalComponent = screen.findByText('APP TEST');
    expect(internalComponent).toBeDefined();
  });
});
