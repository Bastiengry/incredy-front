import {render, screen} from '@testing-library/react';
import Editor from '../Editor';
import {EditorProps} from 'primereact/editor';

beforeEach(() => {
  jest.clearAllMocks();
});

const mockEditor = jest.fn();

jest.mock('primereact/editor', () => ({
  Editor: ({value}: EditorProps) => {
    mockEditor(({value}: any) => ({value}));
    return <>{value}</>;
  },
}));

describe('The editor component', () => {
  it('renders well when no property', async () => {
    render(<Editor text={null} />);
  });
  it('renders well when no text set', async () => {
    render(<Editor text="my text" />);
    const editorContent = screen.getByLabelText('editor');
    expect(editorContent.textContent).toBe('my text');
    expect(screen.getByText('my text')).toBeInTheDocument();
    expect(mockEditor).toHaveBeenCalledTimes(1);
  });
});
