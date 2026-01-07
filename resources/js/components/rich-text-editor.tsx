import Editor from '@monaco-editor/react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Enter content...',
  className = ''
}: RichTextEditorProps) {
  return (
    <div className={className}>
      <Editor
        height="500px"
        defaultLanguage="html"
        value={value}
        onChange={(value) => onChange(value || '')}
        theme="vs-light"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          wordWrap: 'on',
          automaticLayout: true,
        }}
      />
    </div>
  );
}
