import { Editor as PrimeEditor } from 'primereact/editor';

interface Props {
  text?: string | null;
  ariaLabel?: string | undefined;
  onText?: (text: string | null) => void;
  style?: object;
  readOnly?: boolean;
  showHeader?: boolean;
  className?: string;
  placeholder?: string;
  role?: string | undefined;
}

export default function Editor({
  text,
  ariaLabel = 'editor',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onText = () => {},
  style = {
    height: '382px',
  },
  readOnly = false,
  showHeader = true,
  className = undefined,
  placeholder = undefined,
}: Props) {
  return (
    <div aria-label={ariaLabel} className="card">
      <PrimeEditor
        value={text || ''}
        onTextChange={e => onText(e.htmlValue)}
        style={style}
        readOnly={readOnly}
        showHeader={showHeader}
        className={className}
        placeholder={placeholder}
      />
    </div>
  );
}

export type { Props };
