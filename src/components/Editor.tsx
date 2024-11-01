import {Editor as PrimeEditor} from 'primereact/editor';

type Props = {
  text?: string | null;
  onText?: Function;
  height?: string;
  readOnly?: boolean;
  showHeader?: boolean;
  className?: string;
  placeholder?: string;
  role?: string | undefined;
};

export default function Editor({
  text,
  onText = () => {},
  height = '382px',
  readOnly = false,
  showHeader = true,
  className = undefined,
  placeholder = undefined,
}: Props) {
  return (
    <div aria-label="editor" className="card">
      <PrimeEditor
        value={text || ''}
        onTextChange={e => onText(e.htmlValue)}
        style={{height}}
        readOnly={readOnly}
        showHeader={showHeader}
        className={className}
        placeholder={placeholder}
      />
    </div>
  );
}

export type {Props};
