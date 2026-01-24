import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { useState, useEffect } from 'react';
import { Button, Space, message, Modal, Input } from 'antd';
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
  CodeOutlined,
  EyeOutlined,
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
  const [imageLayoutModalOpen, setImageLayoutModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<MediaDto[]>([]);
  const [isMultipleSelectionMode, setIsMultipleSelectionMode] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlCode, setHtmlCode] = useState('');

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
    if (value !== undefined) {
      setHtmlCode(value);
    }
  }, [value, editor]);

  // Toggle between HTML code view and visual editor
  const toggleHtmlMode = () => {
    if (editor) {
      if (isHtmlMode) {
        // Switching from HTML mode to visual mode
        try {
          editor.commands.setContent(htmlCode);
          onChange?.(htmlCode);
          setIsHtmlMode(false);
          message.success('HTML kod yuklandi');
        } catch (error) {
          message.error('HTML kod xatosi. Iltimos, kodni tekshiring.');
        }
      } else {
        // Switching from visual mode to HTML mode
        const currentHtml = editor.getHTML();
        setHtmlCode(currentHtml);
        setIsHtmlMode(true);
      }
    }
  };

  // Handle HTML code changes in code view
  const handleHtmlCodeChange = (newCode: string) => {
    setHtmlCode(newCode);
  };

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
    if (isMultipleSelectionMode) {
      // Multiple selection mode - add to selected images
      setSelectedImages(prev => {
        const exists = prev.find(img => img.id === media.id);
        if (exists) {
          // Remove if already selected
          return prev.filter(img => img.id !== media.id);
        } else {
          // Add if not selected
          return [...prev, media];
        }
      });
    } else {
      // Single image selection - insert directly
      insertImage(media.url);
      setMediaModalOpen(false);
      message.success('Rasm qo\'shildi');
    }
  };

  const insertImageLayout = (layout: string, images: MediaDto[]) => {
    if (!editor || images.length === 0) return;
    
    const imagesHtml = images.map(img => 
      `<img src="${normalizeImageUrl(img.url)}" alt="${img.alt_uz || img.filename || 'Rasm'}" />`
    ).join('\n');
    
    const shortcode = `[images layout="${layout}"]${imagesHtml}[/images]`;
    editor.chain().focus().insertContent(shortcode).run();
    setImageLayoutModalOpen(false);
    setSelectedImages([]);
    message.success(`${images.length} ta rasm qo'shildi (${layout})`);
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
    
    // Open media library in multiple selection mode
    setSelectedImages([]);
    setIsMultipleSelectionMode(true);
    setMediaModalOpen(true);
  };

  const handleConfirmMultipleSelection = () => {
    if (selectedImages.length === 0) {
      message.warning('Kamida bitta rasm tanlang');
      return;
    }
    setMediaModalOpen(false);
    setIsMultipleSelectionMode(false);
    setImageLayoutModalOpen(true);
  };

  const handleCancelMultipleSelection = () => {
    setMediaModalOpen(false);
    setIsMultipleSelectionMode(false);
    setSelectedImages([]);
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
            disabled={isHtmlMode}
          />
          <Button
            type={editor.isActive('italic') ? 'primary' : 'default'}
            icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            size="small"
            disabled={isHtmlMode}
          />
          <Button
            type={editor.isActive('underline') ? 'primary' : 'default'}
            icon={<UnderlineOutlined />}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            size="small"
            disabled={isHtmlMode}
          />
          <Button
            type={editor.isActive('strike') ? 'primary' : 'default'}
            icon={<StrikethroughOutlined />}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            size="small"
            disabled={isHtmlMode}
          />

          <div className="editor-divider" />

          {/* Headings */}
          <Button
            type={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            size="small"
            disabled={isHtmlMode}
          >
            H1
          </Button>
          <Button
            type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            size="small"
            disabled={isHtmlMode}
          >
            H2
          </Button>
          <Button
            type={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            size="small"
            disabled={isHtmlMode}
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
            disabled={isHtmlMode}
          />
          <Button
            type={editor.isActive('orderedList') ? 'primary' : 'default'}
            icon={<OrderedListOutlined />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            size="small"
            disabled={isHtmlMode}
          />

          <div className="editor-divider" />

          {/* Alignment */}
          <Button
            type={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}
            icon={<AlignLeftOutlined />}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            size="small"
            disabled={isHtmlMode}
          />
          <Button
            type={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}
            icon={<AlignCenterOutlined />}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            size="small"
            disabled={isHtmlMode}
          />
          <Button
            type={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}
            icon={<AlignRightOutlined />}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            size="small"
            disabled={isHtmlMode}
          />

          <div className="editor-divider" />

          {/* Link & Image */}
          <Button
            type={editor.isActive('link') ? 'primary' : 'default'}
            icon={<LinkOutlined />}
            onClick={addLink}
            size="small"
            disabled={isHtmlMode}
          />
          <Button
            icon={<PictureOutlined />}
            onClick={() => setMediaModalOpen(true)}
            size="small"
            title="Media library'dan rasm tanlash"
            disabled={isHtmlMode}
          />

          <div className="editor-divider" />

          {/* Table & Image Layout */}
          <Button
            icon={<TableOutlined />}
            onClick={addTable}
            size="small"
            title="Jadval qo'shish (pozitsiya bilan)"
            disabled={isHtmlMode}
          />
          <Button
            icon={<AppstoreOutlined />}
            onClick={addImageLayout}
            size="small"
            title="Rasm layout qo'shish"
            disabled={isHtmlMode}
          />

          <div className="editor-divider" />

          {/* Undo/Redo */}
          <Button
            icon={<UndoOutlined />}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo() || isHtmlMode}
            size="small"
          />
          <Button
            icon={<RedoOutlined />}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo() || isHtmlMode}
            size="small"
          />

          <div className="editor-divider" />

          {/* HTML Code View Toggle */}
          <Button
            type={isHtmlMode ? 'primary' : 'default'}
            icon={isHtmlMode ? <EyeOutlined /> : <CodeOutlined />}
            onClick={toggleHtmlMode}
            size="small"
            title={isHtmlMode ? 'Vizual rejimga o\'tish' : 'HTML kod ko\'rinishiga o\'tish'}
          >
            {isHtmlMode ? 'Vizual' : 'HTML'}
          </Button>

          {/* Media Library */}
          <Button
            icon={<FolderOutlined />}
            onClick={() => setMediaModalOpen(true)}
            size="small"
            disabled={isHtmlMode}
          >
            Media
          </Button>
        </Space>
      </div>

      {/* Editor Content or HTML Code View */}
      {isHtmlMode ? (
        <div className="editor-content-wrapper" style={{ padding: '16px' }}>
          <Input.TextArea
            value={htmlCode}
            onChange={(e) => handleHtmlCodeChange(e.target.value)}
            placeholder="HTML kodni bu yerga kiriting yoki yopishtiring..."
            rows={15}
            style={{ 
              fontFamily: 'monospace', 
              fontSize: '13px',
              lineHeight: '1.5',
            }}
          />
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
            <Space>
              <span>💡 HTML kodni kiriting yoki yopishtiring</span>
              <Button 
                type="primary" 
                size="small" 
                onClick={toggleHtmlMode}
                icon={<EyeOutlined />}
              >
                Vizual rejimga o'tish
              </Button>
            </Space>
          </div>
        </div>
      ) : (
        <div className="editor-content-wrapper">
          <EditorContent editor={editor} />
        </div>
      )}

      <MediaLibraryModal
        open={mediaModalOpen}
        onCancel={isMultipleSelectionMode ? handleCancelMultipleSelection : () => setMediaModalOpen(false)}
        onSelect={handleSelectMediaFromLibrary}
        fileType="image"
        multiple={isMultipleSelectionMode}
        selectedMediaIds={selectedImages.map(img => img.id)}
        onConfirm={(selectedIds) => {
          // Filter selected images based on selectedIds
          const confirmedImages = selectedImages.filter(img => selectedIds.includes(img.id));
          if (confirmedImages.length === 0) {
            message.warning('Kamida bitta rasm tanlang');
            return;
          }
          setMediaModalOpen(false);
          setIsMultipleSelectionMode(false);
          setSelectedImages(confirmedImages);
          setImageLayoutModalOpen(true);
        }}
      />

      {/* Image Layout Selection Modal */}
      <Modal
        title="Rasm layout'ini tanlang"
        open={imageLayoutModalOpen}
        onCancel={() => {
          setImageLayoutModalOpen(false);
          setSelectedImages([]);
        }}
        footer={null}
        width={500}
      >
        <div style={{ padding: '20px 0' }}>
          <p style={{ marginBottom: 16 }}>
            {selectedImages.length} ta rasm tanlandi. Layout'ni tanlang:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Button
              block
              onClick={() => insertImageLayout('grid-2', selectedImages)}
              disabled={selectedImages.length < 2}
            >
              Grid 2 (2 ta bir qatorga)
            </Button>
            <Button
              block
              onClick={() => insertImageLayout('grid-3', selectedImages)}
              disabled={selectedImages.length < 3}
            >
              Grid 3 (3 ta bir qatorga)
            </Button>
            <Button
              block
              onClick={() => insertImageLayout('left-right', selectedImages)}
              disabled={selectedImages.length < 2}
            >
              Chap-O'ng
            </Button>
            <Button
              block
              onClick={() => insertImageLayout('right-left', selectedImages)}
              disabled={selectedImages.length < 2}
            >
              O'ng-Chap
            </Button>
          </div>
          <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
            <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
              Tanlangan rasmlar: {selectedImages.map(img => img.filename || img.alt_uz || 'Rasm').join(', ')}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
