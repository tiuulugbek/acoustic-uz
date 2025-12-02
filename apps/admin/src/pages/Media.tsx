import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Input,
  Select,
  Upload,
  Image,
  Modal,
  Form,
  message,
  Popconfirm,
  Empty,
  Spin,
  Row,
  Col,
  Tag,
  Tooltip,
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  EyeOutlined,
  PictureOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMedia,
  uploadMedia,
  deleteMedia,
  updateMedia,
  type MediaDto,
  ApiError,
} from '../lib/api';
import { normalizeImageUrl } from '../utils/image';
import { compressImage } from '../utils/image-compression';

type ViewMode = 'grid' | 'list';
type FileType = 'all' | 'image' | 'other';

export default function MediaPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<FileType>('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editingMedia, setEditingMedia] = useState<MediaDto | null>(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);

  const { data: mediaList, isLoading } = useQuery<MediaDto[], ApiError>({
    queryKey: ['media'],
    queryFn: getMedia,
  });

  // Debug: Log media data when it loads
  useEffect(() => {
    if (mediaList) {
      console.log('Media loaded:', mediaList.length, 'items');
      if (mediaList.length > 0) {
        console.log('First media item:', mediaList[0]);
        console.log('First media URL:', mediaList[0].url);
      }
    }
  }, [mediaList]);

  const { mutateAsync: uploadMutation } = useMutation<MediaDto, ApiError, { file: File; alt_uz?: string; alt_ru?: string }>({
    mutationFn: async ({ file, alt_uz, alt_ru }) => {
      try {
        console.log('📤 Starting upload:', {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + 'KB',
          type: file.type,
        });
        
        // Rasmni yuklashdan oldin siqish (WebP konvertatsiya o'chirilgan)
        const compressedFile = await compressImage(file, {
          convertToWebP: false, // WebP ga o'tkazish - muammo bo'lsa false qiling
          maxSizeMB: 0.15,
          quality: 0.65,
        });
        
        console.log('📸 Compressed file:', {
          name: compressedFile.name,
          size: (compressedFile.size / 1024).toFixed(1) + 'KB',
          type: compressedFile.type,
        });
        
        // WebP bo'lsa, backend'ga skipWebp flag yuborish
        const skipWebp = compressedFile.type === 'image/webp';
        const result = await uploadMedia(compressedFile, alt_uz, alt_ru, skipWebp);
        
        console.log('✅ Upload successful:', {
          id: result.id,
          url: result.url,
          filename: result.filename,
        });
        
        return result;
      } catch (error) {
        console.error('❌ Upload error:', error);
        const apiError = error as ApiError;
        throw new ApiError(apiError.message || 'Rasm yuklashda xatolik yuz berdi', apiError.status || 500);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      message.success('Rasm yuklandi');
      setUploading(false);
    },
    onError: (error) => {
      console.error('Upload mutation error:', error);
      const errorMessage = error.message || 'Rasm yuklashda xatolik';
      message.error(errorMessage);
      setUploading(false);
    },
  });

  const { mutateAsync: deleteMutation } = useMutation<void, ApiError, string>({
    mutationFn: deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      message.success('Rasm o\'chirildi');
    },
    onError: (error) => {
      message.error(error.message || 'Rasm o\'chirishda xatolik');
    },
  });

  const { mutateAsync: updateMutation } = useMutation<MediaDto, ApiError, { id: string; alt_uz?: string; alt_ru?: string }>({
    mutationFn: ({ id, alt_uz, alt_ru }) => updateMedia(id, alt_uz, alt_ru),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      message.success('Rasm yangilandi');
      setEditingMedia(null);
      form.resetFields();
    },
    onError: (error) => {
      message.error(error.message || 'Rasm yangilashda xatolik');
    },
  });

  const filteredMedia = useMemo(() => {
    if (!mediaList) return [];

    let filtered = mediaList;

    // Filter by file type
    if (fileTypeFilter === 'image') {
      filtered = filtered.filter((media) => media.mimeType?.startsWith('image/'));
    } else if (fileTypeFilter === 'other') {
      filtered = filtered.filter((media) => !media.mimeType?.startsWith('image/'));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (media) =>
          media.filename.toLowerCase().includes(query) ||
          media.alt_uz?.toLowerCase().includes(query) ||
          media.alt_ru?.toLowerCase().includes(query)
      );
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [mediaList, searchQuery, fileTypeFilter]);

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      setUploading(true);
      uploadMutation({ file });
      return false; // Prevent auto upload
    },
    showUploadList: false,
    multiple: true,
  };

  const handleEdit = (media: MediaDto) => {
    setEditingMedia(media);
    form.setFieldsValue({
      alt_uz: media.alt_uz || '',
      alt_ru: media.alt_ru || '',
    });
  };

  const handleUpdate = async () => {
    if (!editingMedia) return;
    const values = await form.validateFields();
    await updateMutation({
      id: editingMedia.id,
      alt_uz: values.alt_uz || undefined,
      alt_ru: values.alt_ru || undefined,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isImage = (mimeType: string) => mimeType?.startsWith('image/');

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Media kutubxonasi</h1>
        <Space>
          <Upload {...uploadProps}>
            <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
              Rasm yuklash
            </Button>
          </Upload>
          <Button
            icon={viewMode === 'grid' ? <UnorderedListOutlined /> : <AppstoreOutlined />}
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? 'Ro\'yxat' : 'Grid'}
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Qidirish..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              style={{ width: '100%' }}
              value={fileTypeFilter}
              onChange={setFileTypeFilter}
              options={[
                { label: 'Barchasi', value: 'all' },
                { label: 'Rasmlar', value: 'image' },
                { label: 'Boshqa', value: 'other' },
              ]}
            />
          </Col>
          <Col xs={24} sm={24} md={8}>
            <div style={{ textAlign: 'right', color: '#666', fontSize: 14 }}>
              Jami: {filteredMedia.length} ta
            </div>
          </Col>
        </Row>
      </Card>

      {/* Media Grid/List */}
      {filteredMedia.length === 0 ? (
        <Card>
          <Empty description="Media topilmadi" />
        </Card>
      ) : viewMode === 'grid' ? (
        <Row gutter={[16, 16]}>
          {filteredMedia.map((media) => (
            <Col xs={12} sm={8} md={6} lg={4} xl={3} key={media.id}>
              <Card
                hoverable
                cover={
                  isImage(media.mimeType) ? (
                    <div style={{ position: 'relative', paddingTop: '100%', backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
                      <img
                        src={normalizeImageUrl(media.url)}
                        alt={media.alt_uz || media.filename}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          cursor: 'pointer',
                        }}
                        onClick={() => setPreviewImage(normalizeImageUrl(media.url))}
                        onError={(e) => {
                          console.error('Image load error:', {
                            url: normalizeImageUrl(media.url),
                            originalUrl: media.url,
                            mediaId: media.id,
                          });
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                      <FileImageOutlined style={{ fontSize: 48, color: '#999' }} />
                    </div>
                  )
                }
                actions={[
                  <Tooltip title="Ko'rish" key="view">
                    <EyeOutlined onClick={() => setPreviewImage(normalizeImageUrl(media.url))} />
                  </Tooltip>,
                  <Tooltip title="Tahrirlash" key="edit">
                    <EditOutlined onClick={() => handleEdit(media)} />
                  </Tooltip>,
                  <Popconfirm
                    key="delete"
                    title="Rasmni o'chirishni tasdiqlaysizmi?"
                    onConfirm={() => deleteMutation(media.id)}
                    okText="Ha"
                    cancelText="Yo'q"
                  >
                    <Tooltip title="O'chirish">
                      <DeleteOutlined style={{ color: '#ff4d4f' }} />
                    </Tooltip>
                  </Popconfirm>,
                ]}
              >
                <Card.Meta
                  title={
                    <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {media.filename}
                    </div>
                  }
                  description={
                    <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                      {formatFileSize(media.size)}
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredMedia.map((media) => (
              <div
                key={media.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 12,
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#F07E22';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(240, 126, 34, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#f0f0f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isImage(media.mimeType) ? (
                  <img
                    src={normalizeImageUrl(media.url)}
                    alt={media.alt_uz || media.filename}
                    width={80}
                    height={80}
                    style={{ objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
                    onClick={() => setPreviewImage(normalizeImageUrl(media.url))}
                  />
                ) : (
                  <div style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                    <FileImageOutlined style={{ fontSize: 32, color: '#999' }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {media.filename}
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
                    {formatFileSize(media.size)} • {media.mimeType}
                  </div>
                  {media.alt_uz && (
                    <Tag color="blue" style={{ marginRight: 4 }}>
                      {media.alt_uz}
                    </Tag>
                  )}
                  {media.alt_ru && (
                    <Tag color="green">
                      {media.alt_ru}
                    </Tag>
                  )}
                </div>
                <Space>
                  <Button icon={<EyeOutlined />} onClick={() => setPreviewImage(normalizeImageUrl(media.url))}>
                    Ko'rish
                  </Button>
                  <Button icon={<EditOutlined />} onClick={() => handleEdit(media)}>
                    Tahrirlash
                  </Button>
                  <Popconfirm
                    title="Rasmni o'chirishni tasdiqlaysizmi?"
                    onConfirm={() => deleteMutation(media.id)}
                    okText="Ha"
                    cancelText="Yo'q"
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      O'chirish
                    </Button>
                  </Popconfirm>
                </Space>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Preview Modal */}
      <Modal
        open={!!previewImage}
        onCancel={() => setPreviewImage(null)}
        footer={null}
        width={800}
        centered
      >
        {previewImage && (
          <img
            src={previewImage}
            alt="Preview"
            style={{ width: '100%', borderRadius: 8 }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f5f5f5" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ERasm yuklanmadi%3C/text%3E%3C/svg%3E';
            }}
          />
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editingMedia}
        title="Rasmni tahrirlash"
        onOk={handleUpdate}
        onCancel={() => {
          setEditingMedia(null);
          form.resetFields();
        }}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        {editingMedia && (
          <div style={{ marginBottom: 16 }}>
            <Image
              src={editingMedia.url}
              alt={editingMedia.alt_uz || editingMedia.filename}
              width="100%"
              style={{ borderRadius: 8 }}
            />
          </div>
        )}
        <Form form={form} layout="vertical">
          <Form.Item label="Alt text (uz)" name="alt_uz">
            <Input placeholder="O'zbekcha alt text" />
          </Form.Item>
          <Form.Item label="Alt text (ru)" name="alt_ru">
            <Input placeholder="Ruscha alt text" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

