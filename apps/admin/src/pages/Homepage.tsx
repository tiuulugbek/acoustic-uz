import { useMemo, useState, useEffect } from 'react';
import {
  Tabs,
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
  Transfer,
  Switch,
} from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getHomepageServices,
  createHomepageService,
  updateHomepageService,
  deleteHomepageService,
  HomepageServiceDto,
  ApiError,
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
  type CreateHomepageServicePayload,
  type UpdateHomepageServicePayload,
  getCatalogsAdmin,
  createCatalog,
  updateCatalog,
  deleteCatalog,
  type CatalogDto,
  type CreateCatalogPayload,
  type UpdateCatalogPayload,
  getShowcase,
  updateShowcase,
  type ShowcaseDto,
  type UpdateShowcasePayload,
  getFaqsAdmin,
  createFaq,
  updateFaq,
  deleteFaq,
  type FaqDto,
  type CreateFaqPayload,
  type UpdateFaqPayload,
  getProductsAdmin,
  type ProductDto,
} from '../lib/api';

const statusOptions = [
  { label: 'Nashr etilgan', value: 'published' },
  { label: 'Qoralama', value: 'draft' },
  { label: 'Arxiv', value: 'archived' },
];

// Slides Tab (Banners)
function SlidesTab() {
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

  const createMutation = useMutation({
    mutationFn: createBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners-admin'] });
      message.success('Slayd saqlandi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBannerPayload }) => updateBanner(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners-admin'] });
      message.success('Slayd yangilandi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners-admin'] });
      message.success("Slayd o'chirildi");
    },
    onError: (error: ApiError) => message.error(error.message || "O'chirishda xatolik"),
  });

  const columns: ColumnsType<BannerDto> = useMemo(
    () => [
      {
        title: 'Rasm',
        key: 'image',
        width: 100,
        render: (_, record) =>
          record.image?.url ? (
            <Image src={record.image.url} alt={record.title_uz} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 4 }} preview={false} />
          ) : (
            <div style={{ width: 60, height: 60, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#999' }}>
              Rasm yo'q
            </div>
          ),
      },
      {
        title: 'Sarlavha (uz)',
        dataIndex: 'title_uz',
        key: 'title_uz',
      },
      {
        title: 'Sarlavha (ru)',
        dataIndex: 'title_ru',
        key: 'title_ru',
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
        title: 'Amallar',
        key: 'actions',
        render: (_: unknown, record: BannerDto) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setEditingBanner(record);
                setPreviewImage(record.image?.url || null);
                form.setFieldsValue({
                  title_uz: record.title_uz,
                  title_ru: record.title_ru,
                  text_uz: record.text_uz ?? undefined,
                  text_ru: record.text_ru ?? undefined,
                  ctaText_uz: record.ctaText_uz ?? undefined,
                  ctaText_ru: record.ctaText_ru ?? undefined,
                  ctaLink: record.ctaLink ?? undefined,
                  imageId: record.imageId ?? undefined,
                  order: record.order,
                  status: record.status,
                });
                setIsModalOpen(true);
              }}
            >
              Tahrirlash
            </Button>
            <Popconfirm title="Slaydni o'chirish" description="Haqiqatan ham o'chirilsinmi?" onConfirm={() => deleteMutation.mutate(record.id)} okText="Ha" cancelText="Yo'q">
              <Button danger size="small" loading={deleteMutation.isPending}>
                O'chirish
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteMutation.isPending, form],
  );

  const openCreateModal = () => {
    setEditingBanner(null);
    setPreviewImage(null);
    form.resetFields();
    form.setFieldsValue({ status: 'published', order: 0 });
    setIsModalOpen(true);
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
        await updateMutation.mutateAsync({ id: editingBanner.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      setIsModalOpen(false);
      form.resetFields();
      setPreviewImage(null);
    } catch (error) {
      // validation error
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

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreateModal}>
          Yangi slayd
        </Button>
      </Space>
      <Table rowKey="id" loading={isLoading} dataSource={banners ?? []} columns={columns} pagination={false} />

      <Modal title={editingBanner ? 'Slaydni tahrirlash' : 'Yangi slayd'} open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleSubmit} confirmLoading={createMutation.isPending || updateMutation.isPending} okText="Saqlash" cancelText="Bekor qilish" width={800}>
        <Form layout="vertical" form={form}>
          <Form.Item label="Sarlavha (uz)" name="title_uz" rules={[{ required: true, message: 'Sarlavha (uz) majburiy' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Sarlavha (ru)" name="title_ru" rules={[{ required: true, message: 'Sarlavha (ru) majburiy' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Matn (uz)" name="text_uz">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="Matn (ru)" name="text_ru">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="CTA matn (uz)" name="ctaText_uz">
            <Input />
          </Form.Item>
          <Form.Item label="CTA matn (ru)" name="ctaText_ru">
            <Input />
          </Form.Item>
          <Form.Item label="CTA havola" name="ctaLink">
            <Input placeholder="https://example.com yoki tel:+998712021441" />
          </Form.Item>

          <Form.Item label="Rasm" name="imageId">
            <div>
              <Row gutter={16}>
                <Col span={12}>
                  <Upload customRequest={handleUpload} showUploadList={false} accept="image/*" maxCount={1}>
                    <Button icon={<UploadOutlined />} loading={uploading} block>
                      Yangi rasm yuklash
                    </Button>
                  </Upload>
                </Col>
                <Col span={12}>
                  {previewImage && (
                    <Button danger icon={<DeleteOutlined />} onClick={handleRemoveImage} block>
                      Rasmi o'chirish
                    </Button>
                  )}
                </Col>
              </Row>

              {(previewImage || currentMedia?.url) && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Image src={previewImage || currentMedia?.url || ''} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 4 }} preview={true} />
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
                        <img src={media.url} alt={media.alt_uz || media.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item label="Tartib" name="order" initialValue={0}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item label="Holati" name="status" initialValue="published">
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// Homepage Services Tab (separate from regular services)
function HomepageServicesTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<HomepageServiceDto[], ApiError>({
    queryKey: ['homepage-services-admin'],
    queryFn: getHomepageServices,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<HomepageServiceDto | null>(null);
  const [form] = Form.useForm();

  const createMutation = useMutation({
    mutationFn: createHomepageService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-services-admin'] });
      message.success('Xizmat saqlandi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHomepageServicePayload }) => updateHomepageService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-services-admin'] });
      message.success('Xizmat yangilandi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHomepageService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-services-admin'] });
      message.success("Xizmat o'chirildi");
    },
    onError: (error: ApiError) => message.error(error.message || "O'chirishda xatolik"),
  });

  const columns: ColumnsType<HomepageServiceDto> = useMemo(
    () => [
      {
        title: 'Sarlavha (uz)',
        dataIndex: 'title_uz',
        key: 'title_uz',
      },
      {
        title: 'Sarlavha (ru)',
        dataIndex: 'title_ru',
        key: 'title_ru',
      },
      {
        title: 'Holati',
        dataIndex: 'status',
        key: 'status',
        render: (value: HomepageServiceDto['status']) => {
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
        title: 'Amallar',
        key: 'actions',
        render: (_: unknown, record: HomepageServiceDto) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setEditingService(record);
                form.setFieldsValue({
                  title_uz: record.title_uz,
                  title_ru: record.title_ru,
                  excerpt_uz: record.excerpt_uz,
                  excerpt_ru: record.excerpt_ru,
                  slug: record.slug,
                  status: record.status,
                  order: record.order,
                  imageId: record.image?.id,
                });
                setIsModalOpen(true);
              }}
            >
              Tahrirlash
            </Button>
            <Popconfirm title="Xizmatni o'chirish" description="Haqiqatan ham o'chirilsinmi?" onConfirm={() => deleteMutation.mutate(record.id)} okText="Ha" cancelText="Yo'q">
              <Button danger size="small" loading={deleteMutation.isPending}>
                O'chirish
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteMutation.isPending, form],
  );

  const openCreateModal = () => {
    setEditingService(null);
    form.resetFields();
    form.setFieldsValue({ status: 'published', order: 0 });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateHomepageServicePayload = {
        title_uz: values.title_uz,
        title_ru: values.title_ru,
        excerpt_uz: values.excerpt_uz ?? undefined,
        excerpt_ru: values.excerpt_ru ?? undefined,
        slug: values.slug ?? undefined,
        order: typeof values.order === 'number' ? values.order : Number(values.order ?? 0),
        status: values.status,
        imageId: values.imageId || undefined,
      };

      if (editingService) {
        await updateMutation.mutateAsync({ id: editingService.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      // validation error
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreateModal}>
          Yangi xizmat
        </Button>
      </Space>
      <Table rowKey="id" loading={isLoading} dataSource={data ?? []} columns={columns} pagination={false} />

      <Modal title={editingService ? 'Xizmatni tahrirlash' : 'Yangi xizmat'} open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleSubmit} confirmLoading={createMutation.isPending || updateMutation.isPending} okText="Saqlash" cancelText="Bekor qilish" width={800}>
        <Form layout="vertical" form={form}>
          <Form.Item label="Sarlavha (uz)" name="title_uz" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Sarlavha (ru)" name="title_ru" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Qisqa matn (uz)" name="excerpt_uz">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Qisqa matn (ru)" name="excerpt_ru">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Slug" name="slug">
            <Input placeholder="xizmat-slug (ixtiyoriy)" />
          </Form.Item>
          <Form.Item label="Rasm ID" name="imageId">
            <Input placeholder="Media ID" />
          </Form.Item>
          <Form.Item label="Holati" name="status" initialValue="published">
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item label="Tartib" name="order" initialValue={0}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// Hearing Aid Catalogs Tab (Catalogs for Homepage)
function CatalogsTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<CatalogDto[], ApiError>({
    queryKey: ['catalogs-admin'],
    queryFn: getCatalogsAdmin,
  });

  const { data: mediaList } = useQuery<MediaDto[], ApiError>({
    queryKey: ['media'],
    queryFn: getMedia,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<CatalogDto | null>(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs-admin'] });
      message.success('Katalog saqlandi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCatalogPayload }) => updateCatalog(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs-admin'] });
      message.success('Katalog yangilandi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs-admin'] });
      message.success("Katalog o'chirildi");
    },
    onError: (error: ApiError) => message.error(error.message || "O'chirishda xatolik"),
  });

  const columns: ColumnsType<CatalogDto> = useMemo(
    () => [
      {
        title: 'Rasm',
        key: 'image',
        width: 100,
        render: (_, record) =>
          record.image?.url ? (
            <Image
              src={record.image.url}
              alt={record.name_uz}
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
        title: 'Nomi (uz)',
        dataIndex: 'name_uz',
        key: 'name_uz',
      },
      {
        title: 'Nomi (ru)',
        dataIndex: 'name_ru',
        key: 'name_ru',
      },
      {
        title: 'Slug',
        dataIndex: 'slug',
        key: 'slug',
      },
      {
        title: 'Bosh sahifada',
        dataIndex: 'showOnHomepage',
        key: 'showOnHomepage',
        width: 120,
        render: (value: boolean) => (
          <Tag color={value ? 'green' : 'default'}>{value ? 'Ha' : 'Yo\'q'}</Tag>
        ),
      },
      {
        title: 'Holati',
        dataIndex: 'status',
        key: 'status',
        render: (value: CatalogDto['status']) => {
          const color = value === 'published' ? 'green' : value === 'draft' ? 'orange' : 'default';
          return <Tag color={color}>{value}</Tag>;
        },
      },
      {
        title: 'Tartib',
        dataIndex: 'order',
        key: 'order',
        width: 80,
      },
      {
        title: 'Amallar',
        key: 'actions',
        render: (_: unknown, record: CatalogDto) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setEditingCatalog(record);
                form.setFieldsValue({
                  name_uz: record.name_uz,
                  name_ru: record.name_ru,
                  slug: record.slug,
                  description_uz: record.description_uz ?? undefined,
                  description_ru: record.description_ru ?? undefined,
                  icon: record.icon,
                  imageId: record.image?.id ?? undefined,
                  order: record.order ?? 0,
                  status: record.status,
                  showOnHomepage: record.showOnHomepage,
                });
                setPreviewImage(record.image?.url ?? null);
                setIsModalOpen(true);
              }}
            >
              Tahrirlash
            </Button>
            <Popconfirm title="Katalogni o'chirish" description="Haqiqatan ham o'chirilsinmi?" onConfirm={() => deleteMutation.mutate(record.id)} okText="Ha" cancelText="Yo'q">
              <Button danger size="small" loading={deleteMutation.isPending}>
                O'chirish
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteMutation.isPending, form, mediaList],
  );

  const openCreateModal = () => {
    setEditingCatalog(null);
    setPreviewImage(null);
    form.resetFields();
    form.setFieldsValue({ order: 0, status: 'published', showOnHomepage: false });
    setIsModalOpen(true);
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateCatalogPayload = {
        name_uz: values.name_uz,
        name_ru: values.name_ru,
        slug: values.slug,
        description_uz: values.description_uz || undefined,
        description_ru: values.description_ru || undefined,
        icon: values.icon || undefined,
        imageId: values.imageId || undefined,
        order: typeof values.order === 'number' ? values.order : Number(values.order ?? 0),
        status: values.status,
        showOnHomepage: values.showOnHomepage ?? false,
      };

      if (editingCatalog) {
        await updateMutation.mutateAsync({ id: editingCatalog.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      setIsModalOpen(false);
      form.resetFields();
      setPreviewImage(null);
    } catch (error) {
      // validation error
    }
  };

  const catalogs = data ?? [];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreateModal}>
          Yangi katalog
        </Button>
      </Space>
      <Table rowKey="id" loading={isLoading} dataSource={catalogs} columns={columns} pagination={false} />

      <Modal title={editingCatalog ? 'Katalogni tahrirlash' : 'Yangi katalog'} open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleSubmit} confirmLoading={createMutation.isPending || updateMutation.isPending} okText="Saqlash" cancelText="Bekor qilish" width={800}>
        <Form layout="vertical" form={form}>
          <Form.Item label="Nomi (uz)" name="name_uz" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Nomi (ru)" name="name_ru" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Slug" name="slug" rules={[{ required: true }]}>
            <Input placeholder="catalog-slug" />
          </Form.Item>
          <Form.Item label="Tavsif (uz)" name="description_uz" extra="Bosh sahifadagi katalog kartasida ko'rinadigan qisqa tavsif">
            <Input.TextArea rows={2} placeholder="Masalan, Ko'rinmas quloq apparatlari" />
          </Form.Item>
          <Form.Item label="Tavsif (ru)" name="description_ru" extra="Краткое описание, которое отображается на карточке каталога на главной странице">
            <Input.TextArea rows={2} placeholder="Например, Невидимые слуховые аппараты" />
          </Form.Item>
          <Form.Item label="Rasm" name="imageId" extra="Bosh sahifadagi katalog kartasida ko'rinadigan rasm">
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
                  <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>Tanlangan rasm (katalog kartasida ko'rinadi):</div>
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
          <Form.Item label="Icon" name="icon" extra="Icon nomi (ixtiyoriy)">
            <Input placeholder="Icon nomi" />
          </Form.Item>
          <Form.Item label="Bosh sahifada ko'rsatish" name="showOnHomepage" valuePropName="checked" extra="Agar belgilansa, katalog bosh sahifada ko'rinadi">
            <Switch />
          </Form.Item>
          <Form.Item label="Holati" name="status" initialValue="published">
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item label="Tartib" name="order" initialValue={0} extra="Kataloglarning ko'rinish tartibi (kichik raqam birinchi)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// Interacoustics Tab (Showcase)
function InteracousticsTab() {
  const queryClient = useQueryClient();
  const { data: showcase, isLoading } = useQuery<ShowcaseDto, ApiError>({
    queryKey: ['showcase-interacoustics'],
    queryFn: () => getShowcase('interacoustics'),
  });
  const { data: productsResponse } = useQuery<{ items: ProductDto[]; total: number; page: number; pageSize: number }, ApiError>({
    queryKey: ['products-admin'],
    queryFn: getProductsAdmin,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateShowcasePayload) => updateShowcase('interacoustics', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['showcase-interacoustics'] });
      message.success('Interacoustics vitrinasi yangilandi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Initialize target keys when showcase data loads
  useEffect(() => {
    if (showcase?.productIds) {
      setTargetKeys(showcase.productIds);
    } else {
      setTargetKeys([]);
    }
  }, [showcase]);

  const handleChange = (newTargetKeys: string[]) => {
    setTargetKeys(newTargetKeys);
  };

  const handleSubmit = async () => {
    try {
      await updateMutation.mutateAsync({ productIds: targetKeys });
    } catch (error) {
      // error handled by mutation
    }
  };

  const allProducts = productsResponse?.items ?? [];
  const dataSource = allProducts.map((product) => ({
    key: product.id,
    title: `${product.name_uz} / ${product.name_ru}`,
    description: product.brand?.name || "Brend yo'q",
  }));

  if (isLoading) {
    return <div>Yuklanmoqda...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <p>Interacoustics vitrinasi uchun mahsulotlarni tanlang. Tanlangan mahsulotlar bosh sahifada ko'rinadi.</p>
      </div>
      <Transfer
        dataSource={dataSource}
        titles={['Barcha mahsulotlar', 'Tanlangan mahsulotlar']}
        targetKeys={targetKeys}
        selectedKeys={selectedKeys}
        onChange={handleChange}
        onSelectChange={(sourceSelectedKeys, targetSelectedKeys) => {
          setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
        }}
        render={(item) => item.title}
        listStyle={{ width: 400, height: 400 }}
      />
      <div style={{ marginTop: 16 }}>
        <Button type="primary" onClick={handleSubmit} loading={updateMutation.isPending}>
          Saqlash
        </Button>
      </div>
      {showcase?.products && showcase.products.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3>Joriy tanlangan mahsulotlar:</h3>
          <Table
            rowKey="id"
            dataSource={showcase.products}
            columns={[
              {
                title: 'Nomi (uz)',
                dataIndex: 'name_uz',
                key: 'name_uz',
              },
              {
                title: 'Nomi (ru)',
                dataIndex: 'name_ru',
                key: 'name_ru',
              },
              {
                title: 'Brend',
                key: 'brand',
                render: (_, record) => record.brand?.name || '-',
              },
            ]}
            pagination={false}
          />
        </div>
      )}
    </div>
  );
}

// FAQs Tab
function FAQsTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<FaqDto[], ApiError>({
    queryKey: ['faqs-admin'],
    queryFn: getFaqsAdmin,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqDto | null>(null);
  const [form] = Form.useForm();

  const createMutation = useMutation({
    mutationFn: createFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs-admin'] });
      message.success('Savol-javob saqlandi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFaqPayload }) => updateFaq(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs-admin'] });
      message.success('Savol-javob yangilandi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs-admin'] });
      message.success("Savol-javob o'chirildi");
    },
    onError: (error: ApiError) => message.error(error.message || "O'chirishda xatolik"),
  });

  const columns: ColumnsType<FaqDto> = useMemo(
    () => [
      {
        title: 'Savol (uz)',
        dataIndex: 'question_uz',
        key: 'question_uz',
        width: 300,
      },
      {
        title: 'Savol (ru)',
        dataIndex: 'question_ru',
        key: 'question_ru',
        width: 300,
      },
      {
        title: 'Holati',
        dataIndex: 'status',
        key: 'status',
        render: (value: FaqDto['status']) => {
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
        title: 'Amallar',
        key: 'actions',
        render: (_: unknown, record: FaqDto) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setEditingFaq(record);
                form.setFieldsValue({
                  question_uz: record.question_uz,
                  question_ru: record.question_ru,
                  answer_uz: record.answer_uz,
                  answer_ru: record.answer_ru,
                  status: record.status,
                  order: record.order,
                });
                setIsModalOpen(true);
              }}
            >
              Tahrirlash
            </Button>
            <Popconfirm title="Savol-javobni o'chirish" description="Haqiqatan ham o'chirilsinmi?" onConfirm={() => deleteMutation.mutate(record.id)} okText="Ha" cancelText="Yo'q">
              <Button danger size="small" loading={deleteMutation.isPending}>
                O'chirish
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteMutation.isPending, form],
  );

  const openCreateModal = () => {
    setEditingFaq(null);
    form.resetFields();
    form.setFieldsValue({ status: 'published', order: 0 });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateFaqPayload = {
        question_uz: values.question_uz,
        question_ru: values.question_ru,
        answer_uz: values.answer_uz,
        answer_ru: values.answer_ru,
        order: typeof values.order === 'number' ? values.order : Number(values.order ?? 0),
        status: values.status,
      };

      if (editingFaq) {
        await updateMutation.mutateAsync({ id: editingFaq.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      // validation error
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreateModal}>
          Yangi savol-javob
        </Button>
      </Space>
      <Table rowKey="id" loading={isLoading} dataSource={data ?? []} columns={columns} pagination={false} />

      <Modal title={editingFaq ? 'Savol-javobni tahrirlash' : 'Yangi savol-javob'} open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleSubmit} confirmLoading={createMutation.isPending || updateMutation.isPending} okText="Saqlash" cancelText="Bekor qilish" width={800}>
        <Form layout="vertical" form={form}>
          <Form.Item label="Savol (uz)" name="question_uz" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Savol (ru)" name="question_ru" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Javob (uz)" name="answer_uz" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Javob (ru)" name="answer_ru" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Holati" name="status" initialValue="published">
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item label="Tartib" name="order" initialValue={0}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


export default function HomepagePage() {
  const items: TabsProps['items'] = [
    {
      key: 'slides',
      label: 'Slaydlar',
      children: <SlidesTab />,
    },
    {
      key: 'homepage-services',
      label: 'Bosh sahifa xizmatlari',
      children: <HomepageServicesTab />,
    },
    {
      key: 'catalogs',
      label: 'Eshitish moslamalari kataloglari',
      children: <CatalogsTab />,
    },
    {
      key: 'interacoustics',
      label: 'Interacoustics',
      children: <InteracousticsTab />,
    },
    {
      key: 'faqs',
      label: 'Savol-javoblar',
      children: <FAQsTab />,
    },
  ];

  return <Tabs items={items} />;
}
