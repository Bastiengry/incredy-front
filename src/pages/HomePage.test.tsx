import { render, screen } from '@testing-library/react';
import HomePage from './HomePage';

jest.mock('./ListAvailableTopics', () => () => {
  return <div aria-label="test-list-available-topics">test</div>;
});

describe('The HomePage component', () => {
  it('renders well', async () => {
    render(<HomePage />);

    const listComponent = await screen.findByLabelText('test-list-available-topics');
    expect(listComponent).toHaveTextContent('test');
  });
});
