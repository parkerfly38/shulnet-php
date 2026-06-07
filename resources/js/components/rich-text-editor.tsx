import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange,
  placeholder = 'Enter content here...',
  className = ''
}: Readonly<RichTextEditorProps>) {
  const editorRef = useRef<any>(null);

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        onInit={(_evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={(newValue) => onChange(newValue)}
        init={{
          license_key: 'gpl',
          height: 600,
          menubar: 'edit view insert format tools table',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons'
          ],
          toolbar: 'undo redo | blocks fontsize | ' +
            'bold italic underline strikethrough | forecolor backcolor | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | link image table | ' +
            'code fullscreen | removeformat help',
          font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt',
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              font-size: 14px;
              line-height: 1.6;
              padding: 1rem;
            }
          `,
          placeholder: placeholder,
          // CRITICAL: Preserve all HTML for email templates
          valid_elements: '*[*]',
          valid_children: '+body[style]',
          extended_valid_elements: '*[*]',
          custom_elements: '*',
          verify_html: false,
          cleanup: false,
          convert_urls: false,
          remove_trailing_brs: false,
          entity_encoding: 'raw',
          // Protect inline styles and special tags
          protect: [
            /<style[\s\S]*?<\/style>/gi,
            /<!--[\s\S]*?-->/gi,
          ],
          // Email-specific settings
          forced_root_block: '',
          force_br_newlines: false,
          force_p_newlines: true,
          keep_styles: true,
          // Skin and styling
          skin: 'oxide',
          content_css: 'default',
          // Preserve formatting
          paste_retain_style_properties: 'all',
          paste_merge_formats: true,
        }}
      />
    </div>
  );
}
