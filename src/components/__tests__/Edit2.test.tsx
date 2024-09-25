import {render, screen} from '@testing-library/react';
import Edit2 from '../Edit2';

describe('The editor component', () => {
  it('renders well', async () => {
    render(<Edit2 />);
    const divElement = screen.getByRole('div-test');
    expect(divElement.textContent).toBe('OK');
  });
});
