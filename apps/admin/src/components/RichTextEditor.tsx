import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { useState, useEffect } from 'react';
import { Button, Space, message } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  LinkOutlined,
  PictureOutlined,
  UndoOutlined,
  RedoOutlined,
  FolderOutlined,
  TableOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { uploadMedia, type MediaDto } from '../lib/api';
import MediaLibraryModal from './MediaLibraryModal';
import { normalizeImageUrl } from '../utils/image';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: value ?? '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
        'data-placeholder': placeholder || 'Matn kiriting...',
      },
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const insertImage = (imageUrl: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: normalizeImageUrl(imageUrl) }).run();
    }
  };

  const imageHandler = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        message.loading({ content: 'Rasm yuklanmoqda...', key: 'upload' });
        const media = await uploadMedia(file);
        insertImage(media.url);
        message.success({ content: 'Rasm yuklandi', key: 'upload' });
      } catch (error) {
        message.error({ content: 'Rasm yuklashda xatolik', key: 'upload' });
      }
    };
  };

  const handleSelectMediaFromLibrary = (media: MediaDto) => {
    insertImage(media.url);
    setMediaModalOpen(false);
    message.success('Rasm qo\'shildi');
  };

  const addLink = () => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL kiriting:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addTable = () => {
    if (!editor) return;
    
    const position = window.prompt(
      'Jadval pozitsiyasini tanlang:\n1 - left (chap)\n2 - center (markaz)\n3 - right (o\'ng)\n4 - full (to\'liq)',
      '2'
    );

    if (position === null) return;

    const positions: Record<string, string> = {
      '1': 'left',
      '2': 'center',
      '3': 'right',
      '4': 'full',
    };

    const selectedPosition = positions[position] || 'center';
    const tableHtml = `
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr>
          <th style="padding: 8px;">Ustun 1</th>
          <th style="padding: 8px;">Ustun 2</th>
        </tr>
        <tr>
          <td style="padding: 8px;">Ma\'lumot 1</td>
          <td style="padding: 8px;">Ma\'lumot 2</td>
        </tr>
      </table>
    `;
    
    const shortcode = `[table position="${selectedPosition}"]${tableHtml}[/table]`;
    
    editor.chain().focus().insertContent(shortcode).run();
    message.success(`Jadval qo'shildi (pozitsiya: ${selectedPosition})`);
  };

  const addImageLayout = () => {
    if (!editor) return;
    
    const layout = window.prompt(
      'Rasm layout\'ini tanlang:\n1 - grid-2 (2 ta bir qatorga)\n2 - grid-3 (3 ta bir qatorga)\n3 - left-right (chap-o\'ng)\n4 - right-left (o\'ng-chap)',
      '1'
    );

    if (layout === null) return;

    const layouts: Record<string, string> = {
      '1': 'grid-2',
      '2': 'grid-3',
      '3': 'left-right',
      '4': 'right-left',
    };

    const selectedLayout = layouts[layout] || 'grid-2';
    const placeholderHtml = `
      <img src="https://via.placeholder.com/400x300" alt="Rasm 1" />
      <img src="https://via.placeholder.com/400x300" alt="Rasm 2" />
    `;
    
    const shortcode = `[images layout="${selectedLayout}"]${placeholderHtml}[/images]`;
    
    editor.chain().focus().insertContent(shortcode).run();
    message.success(`Rasm layout qo'shildi (${selectedLayout}). Rasmlarni o'zgartiring.`);
  };


  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <Space wrap size="small">
          {/* Text Formatting */}
          <Button
            type={editor.isActive('bold') ? 'primary' : 'default'}
            icon={<BoldOutlined />}
            onClick={() => editor.chain().focus().toggleBold().run()}
            size="small"
          />
          <Button
            type={editor.isActive('italic') ? 'primary' : 'default'}
            icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            size="small"
          />
          <Button
            type={editor.isActive('underline') ? 'primary' : 'default'}
            icon={<UnderlineOutlined />}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            size="small"
          />
          <Button
            type={editor.isActive('strike') ? 'primary' : 'default'}
            icon={<StrikethroughOutlined />}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            size="small"
          />

          <div className="editor-divider" />

          {/* Headings */}
          <Button
            type={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            size="small"
          >
            H1
          </Button>
          <Button
            type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            size="small"
          >
            H2
          </Button>
          <Button
            type={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            size="small"
          >
            H3
          </Button>

          <div className="editor-divider" />

          {/* Lists */}
          <Button
            type={editor.isActive('bulletList') ? 'primary' : 'default'}
            icon={<UnorderedListOutlined />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            size="small"
          />
          <Button
            type={editor.isActive('orderedList') ? 'primary' : 'default'}
            icon={<OrderedListOutlined />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            size="small"
          />

          <div className="editor-divider" />

          {/* Alignment */}
          <Button
            type={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}
            icon={<AlignLeftOutlined />}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            size="small"
          />
          <Button
            type={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}
            icon={<AlignCenterOutlined />}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            size="small"
          />
          <Button
            type={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}
            icon={<AlignRightOutlined />}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            size="small"
          />

          <div className="editor-divider" />

          {/* Link & Image */}
          <Button
            type={editor.isActive('link') ? 'primary' : 'default'}
            icon={<LinkOutlined />}
            onClick={addLink}
            size="small"
          />
          <Button
            icon={<PictureOutlined />}
            onClick={imageHandler}
            size="small"
          />

          <div className="editor-divider" />

          {/* Table & Image Layout */}
          <Button
            icon={<TableOutlined />}
            onClick={addTable}
            size="small"
            title="Jadval qo'shish (pozitsiya bilan)"
          />
          <Button
            icon={<AppstoreOutlined />}
            onClick={addImageLayout}
            size="small"
            title="Rasm layout qo'shish"
          />

          <div className="editor-divider" />

          {/* Undo/Redo */}
          <Button
            icon={<UndoOutlined />}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            size="small"
          />
          <Button
            icon={<RedoOutlined />}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            size="small"
          />

          {/* Media Library */}
          <Button
            icon={<FolderOutlined />}
            onClick={() => setMediaModalOpen(true)}
            size="small"
          >
            Media
          </Button>
        </Space>
      </div>

      {/* Editor Content */}
      <div className="editor-content-wrapper">
        <EditorContent editor={editor} />
      </div>

      <MediaLibraryModal
        open={mediaModalOpen}
        onCancel={() => setMediaModalOpen(false)}
        onSelect={handleSelectMediaFromLibrary}
        fileType="image"
      />
    </div>
  );
}
