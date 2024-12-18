import {render} from '@testing-library/react';
import App from './App';

jest.mock('./security', () => ({
  keycloak: {
    init: jest.fn().mockImplementation(() => ({
      catch: jest.fn(),
    })),
  },
}));

jest.mock('./pages', () => ({
  HomePage: () => <div>HOME</div>,
  EditTopic: () => <div>EDIT_TOPIC</div>,
  ViewTopic: () => <div>VIEW_TOPIC</div>,
}));

jest.mock('./components', () => ({
  Header: () => <div>HEADER</div>,
}));

describe('The application', () => {
  it('renders well', async () => {
    render(<App />);
  });
});
