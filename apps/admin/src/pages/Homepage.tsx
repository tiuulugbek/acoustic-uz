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
  Tooltip,
} from 'antd';
import { UploadOutlined, DeleteOutlined, FolderOutlined, QuestionCircleOutlined } from '@ant-design/icons';
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
  getMedia,
  uploadMedia,
  type MediaDto,
  type CreateHomepageServicePayload,
  type UpdateHomepageServicePayload,
  getCatalogsAdmin,
  getCatalogs,
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
  getHomepageHearingAids,
  createHomepageHearingAid,
  updateHomepageHearingAid,
  deleteHomepageHearingAid,
  type HomepageHearingAidDto,
  type CreateHomepageHearingAidPayload,
  type UpdateHomepageHearingAidPayload,
} from '../lib/api';
import MediaLibraryModal from '../components/MediaLibraryModal';
import { normalizeImageUrl } from '../utils/image';
import { compressImage } from '../utils/image-compression';

const statusOptions = [
  { label: 'Nashr etilgan', value: 'published' },
  { label: 'Qoralama', value: 'draft' },
  { label: 'Arxiv', value: 'archived' },
];

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
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const { data: mediaList } = useQuery<MediaDto[], ApiError>({
    queryKey: ['media'],
    queryFn: getMedia,
  });


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
                  link: record.slug ? (record.slug.startsWith('/') ? record.slug : `/${record.slug}`) : undefined,
                  status: record.status,
                  order: record.order,
                  imageId: record.image?.id,
                });
                setPreviewImage(record.image?.url ? normalizeImageUrl(record.image.url) : null);
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
    setPreviewImage(null);
    form.resetFields();
    form.setFieldsValue({ status: 'published', order: 0 });
    setIsModalOpen(true);
  };

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      // Rasmni yuklashdan oldin siqish
      const compressedFile = await compressImage(file as File);
      const media = await uploadMedia(compressedFile);
      form.setFieldsValue({ imageId: media.id });
      setPreviewImage(normalizeImageUrl(media.url));
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
    setPreviewImage(normalizeImageUrl(mediaUrl));
  };

  const handleSelectMediaFromLibrary = (media: MediaDto) => {
    form.setFieldsValue({ imageId: media.id });
    setPreviewImage(normalizeImageUrl(media.url));
    setImageModalOpen(false);
    message.success('Rasm tanlandi');
  };

  const currentImageId = Form.useWatch('imageId', form);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Use link as-is if provided, otherwise use slug field
      // Slug will be saved exactly as entered - no automatic /services/ prefix
      let slug: string | undefined = undefined;
      if (values.link) {
        // Remove leading / if present, but keep the rest as-is
        // If user enters "/services/xizmat-slug", save as "services/xizmat-slug"
        // If user enters "xizmat-slug", save as "xizmat-slug"
        // If user enters "/catalog/katalog-slug", save as "catalog/katalog-slug"
        slug = values.link.startsWith('/') 
          ? values.link.substring(1).split('?')[0].split('#')[0]
          : values.link.split('?')[0].split('#')[0];
      } else if (values.slug) {
        slug = values.slug;
      }

      const payload: CreateHomepageServicePayload = {
        title_uz: values.title_uz,
        title_ru: values.title_ru,
        excerpt_uz: values.excerpt_uz ?? undefined,
        excerpt_ru: values.excerpt_ru ?? undefined,
        slug: slug,
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
          <Form.Item 
            label={
              <span>
                Sarlavha (uz)
                <Tooltip title="Bosh sahifadagi xizmat kartasida ko'rinadigan asosiy sarlavha. O'zbek tilida yozilishi kerak.">
                  <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999', cursor: 'help' }} />
                </Tooltip>
              </span>
            }
            name="title_uz" 
            rules={[{ required: true }]}
          >
            <Input placeholder="Masalan: Diagnostika xizmatlari" />
          </Form.Item>
          <Form.Item 
            label={
              <span>
                Sarlavha (ru)
                <Tooltip title="Bosh sahifadagi xizmat kartasida ko'rinadigan asosiy sarlavha. Rus tilida yozilishi kerak.">
                  <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999', cursor: 'help' }} />
                </Tooltip>
              </span>
            }
            name="title_ru" 
            rules={[{ required: true }]}
          >
            <Input placeholder="Например: Диагностические услуги" />
          </Form.Item>
          <Form.Item 
            label={
              <span>
                Qisqa matn (uz)
                <Tooltip title="Xizmat haqida qisqacha ma'lumot. Bosh sahifadagi kartada ko'rinadi. 100-150 belgi tavsiya etiladi.">
                  <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999', cursor: 'help' }} />
                </Tooltip>
              </span>
            }
            name="excerpt_uz"
          >
            <Input.TextArea rows={3} placeholder="Xizmat haqida qisqacha ma'lumot..." />
          </Form.Item>
          <Form.Item 
            label={
              <span>
                Qisqa matn (ru)
                <Tooltip title="Краткая информация об услуге. Отображается на карточке на главной странице. Рекомендуется 100-150 символов.">
                  <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999', cursor: 'help' }} />
                </Tooltip>
              </span>
            }
            name="excerpt_ru"
          >
            <Input.TextArea rows={3} placeholder="Краткая информация об услуге..." />
          </Form.Item>
          <Form.Item 
            label={
              <span>
                Link
                <Tooltip title="Xizmat sahifasiga havola. Masalan: xizmat-slug yoki /services/xizmat-slug. Qanday yozilsa shunchaki o'sha qoladi.">
                  <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999', cursor: 'help' }} />
                </Tooltip>
              </span>
            }
            name="link"
            extra="Masalan: xizmat-slug yoki /services/xizmat-slug yoki /catalog/katalog-slug. Qanday yozilsa shunchaki o'sha qoladi."
          >
            <Input 
              placeholder="xizmat-slug yoki /services/xizmat-slug" 
            />
          </Form.Item>
          <Form.Item 
            label={
              <span>
                Rasm
                <Tooltip title="Bosh sahifadagi xizmat kartasida ko'rinadigan rasm. Tavsiya etilgan o'lcham: 800x600px yoki 1200x900px. WebP formatida yuklash tavsiya etiladi.">
                  <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999', cursor: 'help' }} />
                </Tooltip>
              </span>
            }
            name="imageId"
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
                    <Button danger icon={<DeleteOutlined />} onClick={handleRemoveImage} block>
                      Rasmi o'chirish
                    </Button>
                  )}
                </Col>
              </Row>
              
              {(previewImage || mediaList?.find((m) => m.id === currentImageId)?.url) && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
                    Tanlangan rasm:
                  </div>
                  <Image
                    src={previewImage || normalizeImageUrl(mediaList?.find((m) => m.id === currentImageId)?.url) || ''}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 4 }}
                    preview={true}
                  />
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <Button
                  icon={<FolderOutlined />}
                  onClick={() => setImageModalOpen(true)}
                  block
                  style={{ marginBottom: 8 }}
                >
                  Mavjud rasmdan tanlash
                </Button>
                {form.getFieldValue('imageId') && (
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    Tanlangan: {mediaList?.find(m => m.id === form.getFieldValue('imageId'))?.filename || 'Noma\'lum'}
                  </div>
                )}
              </div>
            </div>
          </Form.Item>
          <Form.Item label="Holati" name="status" initialValue="published">
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item label="Tartib" name="order" initialValue={0}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Media Library Modal */}
      <MediaLibraryModal
        open={imageModalOpen}
        onCancel={() => setImageModalOpen(false)}
        onSelect={handleSelectMediaFromLibrary}
        fileType="image"
        selectedMediaIds={form.getFieldValue('imageId') ? [form.getFieldValue('imageId')] : []}
      />
    </div>
  );
}

// Homepage Products Tab (Select products and add short descriptions)
function HomepageProductsTab() {
  const queryClient = useQueryClient();
  const { data: hearingAids, isLoading } = useQuery<HomepageHearingAidDto[], ApiError>({
    queryKey: ['homepage-hearing-aids-admin'],
    queryFn: getHomepageHearingAids,
  });

  const { data: productsResponse } = useQuery({
    queryKey: ['products-admin-for-homepage'],
    queryFn: () => getProductsAdmin({ limit: 1000, productType: 'hearing-aids' }),
  });

  const allProducts = productsResponse?.items ?? [];

  const { data: mediaList } = useQuery<MediaDto[], ApiError>({
    queryKey: ['media'],
    queryFn: getMedia,
  });


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HomepageHearingAidDto | null>(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createHomepageHearingAid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-hearing-aids-admin'] });
      message.success('Mahsulot saqlandi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHomepageHearingAidPayload }) =>
      updateHomepageHearingAid(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-hearing-aids-admin'] });
      message.success('Mahsulot yangilandi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHomepageHearingAid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-hearing-aids-admin'] });
      message.success("Mahsulot o'chirildi");
    },
    onError: (error: ApiError) => message.error(error.message || "O'chirishda xatolik"),
  });

  const columns: ColumnsType<HomepageHearingAidDto> = useMemo(
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
            <div
              style={{
                width: 60,
                height: 60,
                background: '#f0f0f0',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: '#999',
              }}
            >
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
        title: 'Tavsif (uz)',
        dataIndex: 'description_uz',
        key: 'description_uz',
        ellipsis: true,
      },
      {
        title: 'Link',
        dataIndex: 'link',
        key: 'link',
        render: (value: string) => (value ? <a href={value}>{value}</a> : '—'),
      },
      {
        title: 'Holati',
        dataIndex: 'status',
        key: 'status',
        render: (value: HomepageHearingAidDto['status']) => {
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
        render: (_: unknown, record: HomepageHearingAidDto) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setEditingItem(record);
                form.setFieldsValue({
                  title_uz: record.title_uz,
                  title_ru: record.title_ru,
                  description_uz: record.description_uz ?? undefined,
                  description_ru: record.description_ru ?? undefined,
                  link: record.link ?? undefined,
                  imageId: record.image?.id ?? undefined,
                  order: record.order ?? 0,
                  status: record.status,
                });
                setPreviewImage(record.image?.url ? normalizeImageUrl(record.image.url) : null);
                setIsModalOpen(true);
              }}
            >
              Tahrirlash
            </Button>
            <Popconfirm
              title="Mahsulotni o'chirish"
              description="Haqiqatan ham o'chirilsinmi?"
              onConfirm={() => deleteMutation.mutate(record.id)}
              okText="Ha"
              cancelText="Yo'q"
            >
              <Button danger size="small" loading={deleteMutation.isPending}>
                O'chirish
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteMutation.isPending, form, normalizeImageUrl],
  );

  const openCreateModal = () => {
    setEditingItem(null);
    setPreviewImage(null);
    form.resetFields();
    form.setFieldsValue({ status: 'published', order: 0 });
    setIsModalOpen(true);
  };

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      // Rasmni yuklashdan oldin siqish
      const compressedFile = await compressImage(file as File);
      const media = await uploadMedia(compressedFile);
      form.setFieldsValue({ imageId: media.id });
      setPreviewImage(normalizeImageUrl(media.url));
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
    setPreviewImage(normalizeImageUrl(mediaUrl));
  };

  const handleSelectProduct = (productId: string) => {
    const product = allProducts.find((p) => p.id === productId);
    if (product) {
      form.setFieldsValue({
        title_uz: product.name_uz || '',
        title_ru: product.name_ru || '',
        link: product.slug ? `/products/${product.slug}` : undefined,
      });
    }
  };

  const currentImageId = Form.useWatch('imageId', form);
  const currentMedia = mediaList?.find((m) => m.id === currentImageId);

  // Restore preview image when modal opens or currentImageId changes
  useEffect(() => {
    if (!isModalOpen) return;
    
    if (currentImageId && currentMedia?.url) {
      const normalizedUrl = normalizeImageUrl(currentMedia.url);
      setPreviewImage((prev) => {
        if (prev !== normalizedUrl) {
          return normalizedUrl;
        }
        return prev;
      });
    } else if (!currentImageId) {
      setPreviewImage(null);
    }
  }, [isModalOpen, currentImageId, currentMedia?.url]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateHomepageHearingAidPayload = {
        title_uz: values.title_uz,
        title_ru: values.title_ru,
        description_uz: values.description_uz || undefined,
        description_ru: values.description_ru || undefined,
        link: values.link || undefined,
        imageId: values.imageId || undefined,
        order: typeof values.order === 'number' ? values.order : Number(values.order ?? 0),
        status: values.status,
      };

      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, payload });
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

  const items = hearingAids ?? [];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreateModal}>
          Yangi mahsulot qo'shish
        </Button>
      </Space>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={items}
        columns={columns}
        pagination={false}
      />

      <Modal
        title={editingItem ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="Saqlash"
        cancelText="Bekor qilish"
        width={800}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label={
              <span>
                Mahsulotni tanlash
                <Tooltip title="Agar mavjud mahsulotni tanlasangiz, sarlavhalar avtomatik to'ldiriladi. Bu ixtiyoriy - yangi mahsulot yaratishingiz ham mumkin.">
                  <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999', cursor: 'help' }} />
                </Tooltip>
              </span>
            }
            extra="Mavjud mahsulotlardan birini tanlang (ixtiyoriy)"
          >
            <Select
              placeholder="Mahsulotni tanlang..."
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={allProducts.map((p) => ({
                value: p.id,
                label: `${p.name_uz} / ${p.name_ru}`,
              }))}
              onChange={handleSelectProduct}
              allowClear
            />
          </Form.Item>

          <Form.Item 
            label={
              <span>
                Sarlavha (uz)
                <Tooltip title="Bosh sahifadagi mahsulot kartasida ko'rinadigan asosiy sarlavha. O'zbek tilida yozilishi kerak.">
                  <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999', cursor: 'help' }} />
                </Tooltip>
              </span>
            }
            name="title_uz" 
            rules={[{ required: true }]}
          >
            <Input placeholder="Masalan, Oticon More 1" />
          </Form.Item>
          <Form.Item 
            label={
              <span>
                Sarlavha (ru)
                <Tooltip title="Bosh sahifadagi mahsulot kartasida ko'rinadigan asosiy sarlavha. Rus tilida yozilishi kerak.">
                  <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999', cursor: 'help' }} />
                </Tooltip>
              </span>
            }
            name="title_ru" 
            rules={[{ required: true }]}
          >
            <Input placeholder="Например, Oticon More 1" />
          </Form.Item>
          <Form.Item
            label={
              <span>
                Qisqacha tavsif (uz)
                <Tooltip title="Bosh sahifadagi mahsulot kartasida ko'rinadigan qisqacha tavsif. 100-150 belgi tavsiya etiladi.">
                  <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999', cursor: 'help' }} />
                </Tooltip>
              </span>
            }
            name="description_uz"
            extra="Bosh sahifadagi mahsulot kartasida ko'rinadigan qisqacha tavsif"
          >
            <Input.TextArea rows={2} placeholder="Masalan, Ko'rinmas quloq apparati" />
          </Form.Item>
          <Form.Item
            label={
              <span>
                Qisqacha tavsif (ru)
                <Tooltip title="Краткое описание, которое отображается на карточке продукта на главной странице. Рекомендуется 100-150 символов.">
                  <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999', cursor: 'help' }} />
                </Tooltip>
              </span>
            }
            name="description_ru"
            extra="Краткое описание, которое отображается на карточке продукта на главной странице"
          >
            <Input.TextArea rows={2} placeholder="Например, Невидимый слуховой аппарат" />
          </Form.Item>
          <Form.Item 
            label={
              <span>
                Link
                <Tooltip title="Mahsulot sahifasiga havola. Agar mahsulotni tanlasangiz, avtomatik to'ldiriladi. Qo'lda ham kiriting mumkin.">
                  <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999', cursor: 'help' }} />
                </Tooltip>
              </span>
            }
            name="link" 
            extra="Mahsulot sahifasiga link (avtomatik to'ldiriladi)"
          >
            <Input placeholder="/products/product-slug" />
          </Form.Item>
          <Form.Item 
            label={
              <span>
                Rasm
                <Tooltip title="Bosh sahifadagi mahsulot kartasida ko'rinadigan rasm. Tavsiya etilgan o'lcham: 800x600px yoki 1200x900px. WebP formatida yuklash tavsiya etiladi.">
                  <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999', cursor: 'help' }} />
                </Tooltip>
              </span>
            }
            name="imageId"
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
                    <Button danger icon={<DeleteOutlined />} onClick={handleRemoveImage} block>
                      Rasmi o'chirish
                    </Button>
                  )}
                </Col>
              </Row>

              {(previewImage || mediaList?.find((m) => m.id === currentImageId)?.url) && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
                    Tanlangan rasm:
                  </div>
                  <Image
                    src={previewImage || normalizeImageUrl(mediaList?.find((m) => m.id === currentImageId)?.url) || ''}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 4 }}
                    preview={true}
                  />
                </div>
              )}

              {mediaList && mediaList.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>Mavjud rasmlar:</div>
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
                          src={normalizeImageUrl(media.url)}
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
          <Form.Item label="Holati" name="status" initialValue="published">
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item label="Tartib" name="order" initialValue={0} extra="Mahsulotlarning ko'rinish tartibi">
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
    queryFn: async () => {
      // Try admin endpoint first, fallback to public if auth fails
      try {
        return await getCatalogsAdmin();
      } catch (err) {
        const apiError = err as ApiError;
        if (apiError.status === 401 || apiError.status === 403) {
          // If auth fails, use public endpoint
          return await getCatalogs();
        }
        throw err;
      }
    },
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
        render: (_, record) => {
          const imageUrl = record.image?.url;
          const normalizedUrl = imageUrl ? normalizeImageUrl(imageUrl) : '';
          return imageUrl ? (
            <Image
              src={normalizedUrl}
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
          );
        },
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
                setPreviewImage(record.image?.url ? normalizeImageUrl(record.image.url) : null);
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
      // Rasmni yuklashdan oldin siqish
      const compressedFile = await compressImage(file as File);
      const media = await uploadMedia(compressedFile);
      form.setFieldsValue({ imageId: media.id });
      setPreviewImage(normalizeImageUrl(media.url));
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
    console.log('CatalogsTab: Selecting media:', { mediaId, mediaUrl });
    // Set form value
    form.setFieldsValue({ imageId: mediaId });
    // Update preview
    setPreviewImage(normalizeImageUrl(mediaUrl));
    // Force form to update by triggering a re-render
    form.validateFields(['imageId']).catch(() => {});
  };

  const currentImageId = Form.useWatch('imageId', form);
  const currentMedia = mediaList?.find((m) => m.id === currentImageId);

  // Restore preview image when modal opens or currentImageId changes
  useEffect(() => {
    if (!isModalOpen) return;
    
    if (currentImageId && currentMedia?.url) {
      const normalizedUrl = normalizeImageUrl(currentMedia.url);
      setPreviewImage((prev) => {
        if (prev !== normalizedUrl) {
          return normalizedUrl;
        }
        return prev;
      });
    } else if (!currentImageId) {
      setPreviewImage(null);
    }
  }, [isModalOpen, currentImageId, currentMedia?.url]);

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
                    src={previewImage || normalizeImageUrl(currentMedia?.url) || ''}
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
                          src={normalizeImageUrl(media.url)}
                          alt={media.alt_uz || media.filename}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Input type="hidden" />
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
    queryKey: ['products-admin-interacoustics'],
    queryFn: () => getProductsAdmin({ limit: 1000, productType: 'interacoustics' }),
  });

  const { data: mediaList } = useQuery<MediaDto[], ApiError>({
    queryKey: ['media'],
    queryFn: getMedia,
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
  const [searchText, setSearchText] = useState<string>('');
  const [productMetadata, setProductMetadata] = useState<Record<string, { description_uz?: string; description_ru?: string; imageId?: string }>>({});
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [metadataForm] = Form.useForm();

  // Initialize target keys and metadata when showcase data loads
  useEffect(() => {
    if (showcase?.productIds) {
      setTargetKeys(showcase.productIds);
    } else {
      setTargetKeys([]);
    }
    // Extract metadata from showcase if available
    if (showcase && 'productMetadata' in showcase && showcase.productMetadata) {
      setProductMetadata(showcase.productMetadata as Record<string, { description_uz?: string; description_ru?: string; imageId?: string }>);
    }
  }, [showcase]);

  const handleChange = (newTargetKeys: string[]) => {
    setTargetKeys(newTargetKeys);
    // Remove metadata for products that are no longer selected
    const removedKeys = targetKeys.filter((key) => !newTargetKeys.includes(key));
    const updatedMetadata = { ...productMetadata };
    removedKeys.forEach((key) => {
      delete updatedMetadata[key];
    });
    setProductMetadata(updatedMetadata);
  };

  const handleOpenMetadataModal = (productId: string) => {
    const product = allProducts.find((p) => p.id === productId);
    const metadata = productMetadata[productId] || {};
    setEditingProductId(productId);
    setPreviewImage(null); // Reset preview image
    metadataForm.setFieldsValue({
      description_uz: metadata.description_uz || '',
      description_ru: metadata.description_ru || '',
      imageId: metadata.imageId || undefined,
    });
    // Set preview image if imageId exists
    if (metadata.imageId && mediaList) {
      const media = mediaList.find((m) => m.id === metadata.imageId);
      if (media) {
        setPreviewImage(media.url);
      }
    }
    setIsMetadataModalOpen(true);
  };

  const handleSaveMetadata = () => {
    const values = metadataForm.getFieldsValue();
    if (editingProductId) {
      setProductMetadata({
        ...productMetadata,
        [editingProductId]: {
          description_uz: values.description_uz || undefined,
          description_ru: values.description_ru || undefined,
          imageId: values.imageId || undefined,
        },
      });
    }
    setIsMetadataModalOpen(false);
    setEditingProductId(null);
    metadataForm.resetFields();
  };

  const handleSubmit = async () => {
    try {
      await updateMutation.mutateAsync({
        productIds: targetKeys,
        productMetadata: productMetadata,
      });
    } catch (error) {
      // error handled by mutation
    }
  };

  const allProducts = productsResponse?.items ?? [];
  
  // Filter products by search text
  const filteredProducts = useMemo(() => {
    if (!searchText) return allProducts;
    const searchLower = searchText.toLowerCase();
    return allProducts.filter((product) => {
      const nameUz = (product.name_uz || '').toLowerCase();
      const nameRu = (product.name_ru || '').toLowerCase();
      const brandName = (product.brand?.name || '').toLowerCase();
      return nameUz.includes(searchLower) || nameRu.includes(searchLower) || brandName.includes(searchLower);
    });
  }, [allProducts, searchText]);

  const dataSource = filteredProducts.map((product) => ({
    key: product.id,
    title: `${product.name_uz} / ${product.name_ru}`,
    description: product.brand?.name || "Brend yo'q",
  }));

  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const handleImageUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploadingImage(true);
    try {
      // Rasmni yuklashdan oldin siqish
      const compressedFile = await compressImage(file as File);
      const media = await uploadMedia(compressedFile);
      metadataForm.setFieldsValue({ imageId: media.id });
      setPreviewImage(normalizeImageUrl(media.url));
      message.success('Rasm yuklandi');
      queryClient.invalidateQueries({ queryKey: ['media'] });
      onSuccess?.(media);
    } catch (error) {
      const apiError = error as ApiError;
      message.error(apiError.message || 'Rasm yuklashda xatolik');
      onError?.(error as Error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    metadataForm.setFieldsValue({ imageId: undefined });
    setPreviewImage(null);
  };

  const handleSelectExistingMedia = (mediaId: string, mediaUrl: string) => {
    metadataForm.setFieldsValue({ imageId: mediaId });
    setPreviewImage(normalizeImageUrl(mediaUrl));
  };

  const handleSelectMediaFromLibrary = (media: MediaDto) => {
    metadataForm.setFieldsValue({ imageId: media.id });
    setPreviewImage(normalizeImageUrl(media.url));
    setImageModalOpen(false);
    message.success('Rasm tanlandi');
  };

  const currentImageId = Form.useWatch('imageId', metadataForm);

  if (isLoading) {
    return <div>Yuklanmoqda...</div>;
  }

  const selectedProducts = allProducts.filter((p) => targetKeys.includes(p.id));

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <p>Interacoustics vitrinasi uchun mahsulotlarni tanlang va har biriga qisqacha tavsif qo'shing. Tanlangan mahsulotlar bosh sahifada ko'rinadi.</p>
      </div>
      
      {/* Search input */}
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Mahsulotlarni qidirish..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ maxWidth: 400 }}
        />
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
        listStyle={{ width: 400, height: 500 }}
        showSearch
        filterOption={(inputValue, item) =>
          item.title.toLowerCase().includes(inputValue.toLowerCase()) ||
          item.description.toLowerCase().includes(inputValue.toLowerCase())
        }
      />
      <div style={{ marginTop: 16 }}>
        <Button type="primary" onClick={handleSubmit} loading={updateMutation.isPending}>
          Saqlash
        </Button>
        <span style={{ marginLeft: 16, color: '#666' }}>
          Tanlangan: {targetKeys.length} ta mahsulot
        </span>
      </div>

      {/* Selected products with descriptions */}
      {selectedProducts.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3>Tanlangan mahsulotlar va tavsiflar ({selectedProducts.length} ta):</h3>
          <Table
            rowKey="id"
            dataSource={selectedProducts}
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
              {
                title: 'Tavsif (uz)',
                key: 'description_uz',
                render: (_, record) => {
                  const metadata = productMetadata[record.id];
                  return metadata?.description_uz || <span style={{ color: '#999' }}>Tavsif qo'shilmagan</span>;
                },
              },
              {
                title: 'Amallar',
                key: 'actions',
                render: (_: unknown, record: ProductDto) => (
                  <Button
                    size="small"
                    onClick={() => handleOpenMetadataModal(record.id)}
                  >
                    Tavsif qo'shish/tahrirlash
                  </Button>
                ),
              },
            ]}
            pagination={false}
            size="small"
          />
        </div>
      )}

      {/* Metadata Modal */}
      <Modal
        title="Mahsulot tavsifi va rasmi"
        open={isMetadataModalOpen}
        onCancel={() => {
          setIsMetadataModalOpen(false);
          setEditingProductId(null);
          metadataForm.resetFields();
          setPreviewImage(null);
        }}
        onOk={handleSaveMetadata}
        okText="Saqlash"
        cancelText="Bekor qilish"
        width={700}
      >
        <Form layout="vertical" form={metadataForm}>
          {editingProductId && (
            <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <strong>Mahsulot:</strong>{' '}
              {allProducts.find((p) => p.id === editingProductId)?.name_uz} /{' '}
              {allProducts.find((p) => p.id === editingProductId)?.name_ru}
            </div>
          )}
          <Form.Item
            label="Qisqacha tavsif (uz)"
            name="description_uz"
            extra="Bosh sahifadagi mahsulot kartasida ko'rinadigan qisqacha tavsif"
          >
            <Input.TextArea rows={3} placeholder="Masalan, Diagnostika uskunasi" />
          </Form.Item>
          <Form.Item
            label="Qisqacha tavsif (ru)"
            name="description_ru"
            extra="Краткое описание, которое отображается на карточке продукта на главной странице"
          >
            <Input.TextArea rows={3} placeholder="Например, Диагностическое оборудование" />
          </Form.Item>
          <Form.Item
            label="Rasm"
            name="imageId"
            extra="Bosh sahifadagi mahsulot kartasida ko'rinadigan rasm (ixtiyoriy)"
          >
            <div>
              <Row gutter={16}>
                <Col span={12}>
                  <Upload
                    customRequest={handleImageUpload}
                    showUploadList={false}
                    accept="image/*"
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />} loading={uploadingImage} block>
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

              {(previewImage || mediaList?.find((m) => m.id === currentImageId)?.url) && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
                    Tanlangan rasm:
                  </div>
                  <Image
                    src={previewImage || normalizeImageUrl(mediaList?.find((m) => m.id === currentImageId)?.url) || ''}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 4 }}
                    preview={true}
                  />
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <Button
                  icon={<FolderOutlined />}
                  onClick={() => setImageModalOpen(true)}
                  block
                  style={{ marginBottom: 8 }}
                >
                  Mavjud rasmdan tanlash
                </Button>
                {metadataForm.getFieldValue('imageId') && (
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    Tanlangan: {mediaList?.find(m => m.id === metadataForm.getFieldValue('imageId'))?.filename || 'Noma\'lum'}
                  </div>
                )}
              </div>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Media Library Modal */}
      <MediaLibraryModal
        open={imageModalOpen}
        onCancel={() => setImageModalOpen(false)}
        onSelect={handleSelectMediaFromLibrary}
        fileType="image"
        selectedMediaIds={metadataForm.getFieldValue('imageId') ? [metadataForm.getFieldValue('imageId')] : []}
      />
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
      label: 'Savol-javoblar (Bosh sahifa)',
      children: <FAQsTab />,
    },
  ];

  return <Tabs items={items} />;
}
