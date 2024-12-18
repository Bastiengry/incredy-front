import {render, screen} from '@testing-library/react';
import Editor from './Editor';
import {EditorProps, EditorTextChangeEvent} from 'primereact/editor';

/**
 * Mock mandatory because PrimeReact component throws errors if used with real implementation.
 */
const mockEditor = jest.fn();

jest.mock('primereact/editor', () => ({
  Editor: (editorProps: EditorProps) => {
    const {value, onTextChange} = editorProps;
    mockEditor(editorProps);
    const event: EditorTextChangeEvent = {
      textValue: value || '',
      htmlValue: value || '',
      delta: '',
      source: 'api',
    };
    if (onTextChange) onTextChange(event);
    return <>{value}</>;
  },
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

beforeEach(() => {
  jest.clearAllMocks();
});

describe('The Editor component', () => {
  it('renders well when no text', async () => {
    render(<Editor text={null} />);
  });

  it('renders well when text set', async () => {
    const textToDisplay = 'My Text';
    render(<Editor text={textToDisplay} />);
    const editorContent = await screen.findByLabelText('editor');
    expect(editorContent.textContent).toBe(textToDisplay);
    expect(screen.getByText(textToDisplay)).toBeInTheDocument();
    expect(mockEditor).toHaveBeenLastCalledWith(
      expect.objectContaining({
        value: textToDisplay,
      }),
    );
  });

  it('notifies text changes', async () => {
    const textToDisplay = 'My Text';

    let changedText = undefined;
    const textChangeCallback = (text: string | null) => {
      changedText = text;
    };

    render(<Editor text={textToDisplay} onText={textChangeCallback} />);

    expect(changedText).toBe(textToDisplay);
  });

  it('transmits className props to PrimeReact component', async () => {
    const className = 'editor';

    render(<Editor text="my text" className={className} />);

    expect(mockEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        className,
      }),
    );
  });

  it('transmits style props to PrimeReact component', async () => {
    const style = {
      height: '145px',
    };

    render(<Editor text="my text" style={style} />);

    expect(mockEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        style,
      }),
    );
  });

  it('transmits readonly=true props to PrimeReact component', async () => {
    const readOnly = true;

    render(<Editor text="my text" readOnly={readOnly} />);

    expect(mockEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        readOnly,
      }),
    );
  });

  it('transmits readonly=false props to PrimeReact component', async () => {
    const readOnly = false;

    render(<Editor text="my text" readOnly={readOnly} />);

    expect(mockEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        readOnly,
      }),
    );
  });

  it('transmits showHeader=true props to PrimeReact component', async () => {
    const showHeader = true;

    render(<Editor text="my text" showHeader={showHeader} />);

    expect(mockEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        showHeader,
      }),
    );
  });

  it('transmits showHeader=false props to PrimeReact component', async () => {
    const showHeader = false;

    render(<Editor text="my text" showHeader={showHeader} />);

    expect(mockEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        showHeader,
      }),
    );
  });

  it('transmits placeholder props to PrimeReact component', async () => {
    const placeholder = 'My placeholder';

    render(<Editor text="my text" placeholder={placeholder} />);

    expect(mockEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        placeholder,
      }),
    );
  });
});
