import { useMemo, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Popconfirm,
  message,
  Upload,
  Image,
  Row,
  Col,
} from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
  getMedia,
  uploadMedia,
  type BannerDto,
  type CreateBannerPayload,
  type UpdateBannerPayload,
  type MediaDto,
  ApiError,
} from '../lib/api';

const statusOptions = [
  { label: 'Nashr etilgan', value: 'published' },
  { label: 'Qoralama', value: 'draft' },
  { label: 'Arxiv', value: 'archived' },
];

export default function BannersPage() {
  const queryClient = useQueryClient();

  const { data: banners, isLoading } = useQuery<BannerDto[], ApiError>({
    queryKey: ['banners-admin'],
    queryFn: getBannersAdmin,
  });

  const { data: mediaList } = useQuery<MediaDto[], ApiError>({
    queryKey: ['media'],
    queryFn: getMedia,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerDto | null>(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { mutateAsync: createMutation, isPending: isCreating } = useMutation<BannerDto, ApiError, CreateBannerPayload>({
    mutationFn: createBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners-admin'] });
      message.success('Slayd saqlandi');
    },
    onError: (error) => message.error(error.message || 'Saqlashda xatolik'),
  });

  const { mutateAsync: updateMutation, isPending: isUpdating } = useMutation<
    BannerDto,
    ApiError,
    { id: string; payload: UpdateBannerPayload }
  >({
    mutationFn: ({ id, payload }) => updateBanner(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners-admin'] });
      message.success('Slayd yangilandi');
    },
    onError: (error) => message.error(error.message || 'Yangilashda xatolik'),
  });

  const { mutateAsync: deleteMutation, isPending: isDeleting } = useMutation<void, ApiError, string>({
    mutationFn: deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners-admin'] });
      message.success('Slayd o‘chirildi');
    },
    onError: (error) => message.error(error.message || "O'chirishda xatolik"),
  });

  const openCreateModal = () => {
    setEditingBanner(null);
    setPreviewImage(null);
    form.resetFields();
    form.setFieldsValue({ status: 'published', order: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (banner: BannerDto) => {
    setEditingBanner(banner);
    setPreviewImage(banner.image?.url || null);
    form.setFieldsValue({
      title_uz: banner.title_uz,
      title_ru: banner.title_ru,
      text_uz: banner.text_uz ?? undefined,
      text_ru: banner.text_ru ?? undefined,
      ctaText_uz: banner.ctaText_uz ?? undefined,
      ctaText_ru: banner.ctaText_ru ?? undefined,
      ctaLink: banner.ctaLink ?? undefined,
      imageId: banner.imageId ?? undefined,
      order: banner.order,
      status: banner.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (banner: BannerDto) => {
    await deleteMutation(banner.id);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateBannerPayload = {
        title_uz: values.title_uz,
        title_ru: values.title_ru,
        text_uz: values.text_uz || undefined,
        text_ru: values.text_ru || undefined,
        ctaText_uz: values.ctaText_uz || undefined,
        ctaText_ru: values.ctaText_ru || undefined,
        ctaLink: values.ctaLink || undefined,
        imageId: values.imageId || undefined,
        order: typeof values.order === 'number' ? values.order : Number(values.order ?? 0),
        status: values.status,
      };

      if (editingBanner) {
        await updateMutation({ id: editingBanner.id, payload });
      } else {
        await createMutation(payload);
      }

      setIsModalOpen(false);
      form.resetFields();
      setPreviewImage(null);
    } catch (error) {
      // handled by form validation
    }
  };

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      const media = await uploadMedia(file as File);
      form.setFieldsValue({ imageId: media.id });
      setPreviewImage(media.url);
      message.success('Rasm yuklandi');
      queryClient.invalidateQueries({ queryKey: ['media'] });
      onSuccess?.(media);
    } catch (error) {
      const apiError = error as ApiError;
      message.error(apiError.message || 'Rasm yuklashda xatolik');
      onError?.(error as Error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    form.setFieldsValue({ imageId: undefined });
    setPreviewImage(null);
  };

  const handleSelectExistingMedia = (mediaId: string, mediaUrl: string) => {
    form.setFieldsValue({ imageId: mediaId });
    setPreviewImage(mediaUrl);
  };

  const currentImageId = Form.useWatch('imageId', form);
  const currentMedia = mediaList?.find((m) => m.id === currentImageId);

  const columns: ColumnsType<BannerDto> = useMemo(
    () => [
      {
        title: 'Rasm',
        key: 'image',
        width: 100,
        render: (_, record) =>
          record.image?.url ? (
            <Image
              src={record.image.url}
              alt={record.title_uz}
              width={60}
              height={60}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              preview={false}
            />
          ) : (
            <div style={{ width: 60, height: 60, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#999' }}>
              Rasm yo'q
            </div>
          ),
      },
      {
        title: 'Sarlavha',
        dataIndex: 'title_uz',
        key: 'title_uz',
        render: (value: string, record) => (
          <div>
            <strong>{value}</strong>
            {record.title_ru ? <div style={{ fontSize: 12, color: '#6b7280' }}>{record.title_ru}</div> : null}
          </div>
        ),
      },
      {
        title: 'Holati',
        dataIndex: 'status',
        key: 'status',
        render: (value: BannerDto['status']) => {
          const color = value === 'published' ? 'green' : value === 'draft' ? 'orange' : 'default';
          return <Tag color={color}>{value}</Tag>;
        },
      },
      {
        title: 'Tartib',
        dataIndex: 'order',
        key: 'order',
      },
      {
        title: 'CTA',
        key: 'cta',
        render: (_, record) =>
          record.ctaText_uz || record.ctaText_ru ? (
            <div>
              <div>{record.ctaText_uz}</div>
              {record.ctaLink ? (
                <a href={record.ctaLink} target="_blank" rel="noreferrer">
                  {record.ctaLink}
                </a>
              ) : null}
            </div>
          ) : (
            '—'
          ),
      },
      {
        title: 'Amallar',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button size="small" onClick={() => openEditModal(record)}>
              Tahrirlash
            </Button>
            <Popconfirm
              title="Slaydni o‘chirish"
              description="Ushbu slaydni o‘chirishni tasdiqlang"
              okText="Ha"
              cancelText="Yo‘q"
              onConfirm={() => handleDelete(record)}
            >
              <Button danger size="small" loading={isDeleting}>
                O‘chirish
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [isDeleting, openEditModal, handleDelete],
  );

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreateModal}>
          Yangi slayd
        </Button>
      </Space>

      <Table
        loading={isLoading}
        dataSource={banners ?? []}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingBanner ? 'Slaydni tahrirlash' : 'Yangi slayd'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={isCreating || isUpdating}
        width={720}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form layout="vertical" form={form}>
          <div style={{ marginBottom: 16, padding: 12, background: '#f0f2f5', borderRadius: 4, fontSize: 12, color: '#666' }}>
            <strong>Slayd maydonlari:</strong> Sarlavha (katta ko'rinadigan), Matn (kichik qator), CTA matn (tugma matni), CTA havola (tugma havolasi), Rasm (o'ng paneldagi rasm)
          </div>
          
          <Form.Item
            label="Sarlavha (uz)"
            name="title_uz"
            rules={[{ required: true, message: 'Sarlavha (uz) majburiy' }]}
            extra="Slaydning katta sarlavhasi - asosiy matn"
          >
            <Input placeholder="Masalan, Cochlear implantlar" />
          </Form.Item>
          <Form.Item
            label="Sarlavha (ru)"
            name="title_ru"
            rules={[{ required: true, message: 'Sarlavha (ru) majburiy' }]}
            extra="Slaydning katta sarlavhasi - asosiy matn"
          >
            <Input placeholder="Например, Кохлеарные импланты" />
          </Form.Item>
          <Form.Item 
            label="Matn (uz)" 
            name="text_uz"
            extra="Sarlavha ostidagi kichik matn - qo'shimcha ma'lumot"
          >
            <Input.TextArea rows={2} placeholder="Masalan, Yangi avlod implantlari bilan eshitish imkoniyatini oshiring" />
          </Form.Item>
          <Form.Item 
            label="Matn (ru)" 
            name="text_ru"
            extra="Sarlavha ostidagi kichik matn - qo'shimcha ma'lumot"
          >
            <Input.TextArea rows={2} placeholder="Например, Улучшите слух с имплантами нового поколения" />
          </Form.Item>
          <Form.Item 
            label="CTA matn (uz)" 
            name="ctaText_uz"
            extra="To'q sariq tugmadagi matn"
          >
            <Input placeholder="Masalan, Cochlear haqida →" />
          </Form.Item>
          <Form.Item 
            label="CTA matn (ru)" 
            name="ctaText_ru"
            extra="To'q sariq tugmadagi matn"
          >
            <Input placeholder="Например, О Cochlear →" />
          </Form.Item>
          <Form.Item 
            label="CTA havola" 
            name="ctaLink" 
            extra="Masalan: https://example.com, tel:+998712021441, yoki /catalog"
            rules={[
              {
                validator: (_, value) => {
                  if (!value || value === '') return Promise.resolve();
                  // Allow http/https URLs, tel: links, relative paths, and anchors
                  if (
                    value.startsWith('http://') ||
                    value.startsWith('https://') ||
                    value.startsWith('tel:') ||
                    value.startsWith('/') ||
                    value.startsWith('#')
                  ) {
                    // Validate full URLs
                    if (value.startsWith('http://') || value.startsWith('https://')) {
                      try {
                        new URL(value);
                        return Promise.resolve();
                      } catch {
                        return Promise.reject(new Error('Noto\'g\'ri URL format'));
                      }
                    }
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Havola http://, https://, tel:, / yoki # bilan boshlanishi kerak'));
                },
              },
            ]}
          >
            <Input placeholder="https://example.com yoki tel:+998712021441" />
          </Form.Item>
          
          <Form.Item 
            label="Rasm" 
            name="imageId"
            extra="O'ng paneldagi to'q sariq blokda ko'rinadigan rasm. Agar rasm tanlanmasa, 'Acoustic' matni ko'rinadi."
          >
            <div>
              <Row gutter={16}>
                <Col span={12}>
                  <Upload
                    customRequest={handleUpload}
                    showUploadList={false}
                    accept="image/*"
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />} loading={uploading} block>
                      Yangi rasm yuklash
                    </Button>
                  </Upload>
                </Col>
                <Col span={12}>
                  {previewImage && (
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleRemoveImage}
                      block
                    >
                      Rasmi o'chirish
                    </Button>
                  )}
                </Col>
              </Row>
              
              {(previewImage || currentMedia?.url) && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>Tanlangan rasm (slaydda ko'rinadi):</div>
                  <Image
                    src={previewImage || currentMedia?.url || ''}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 4 }}
                    preview={true}
                  />
                </div>
              )}

              {mediaList && mediaList.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>Mavjud rasmlar (tanlash uchun bosing):</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                    {mediaList.slice(0, 20).map((media) => (
                      <div
                        key={media.id}
                        onClick={() => handleSelectExistingMedia(media.id, media.url)}
                        style={{
                          width: 80,
                          height: 80,
                          border: currentImageId === media.id ? '2px solid #F07E22' : '1px solid #d9d9d9',
                          borderRadius: 4,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          position: 'relative',
                          backgroundColor: currentImageId === media.id ? '#fff7ed' : '#fff',
                        }}
                      >
                        <img
                          src={media.url}
                          alt={media.alt_uz || media.filename}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item 
            label="Tartib" 
            name="order" 
            initialValue={0}
            extra="Slaydlarning ko'rinish tartibi (kichik raqam birinchi)"
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item 
            label="Holat" 
            name="status" 
            initialValue="published"
            extra="Faqat 'Nashr etilgan' holatidagi slaydlar bosh sahifada ko'rinadi"
          >
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
