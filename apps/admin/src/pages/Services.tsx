import { useMemo, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Popconfirm,
  message,
  Tabs,
  Upload,
  Image,
} from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getServices,
  createService,
  updateService,
  deleteService,
  ServiceDto,
  CreateServicePayload,
  UpdateServicePayload,
  ApiError,
  getServiceCategoriesAdmin,
  ServiceCategoryDto,
  getMedia,
  uploadMedia,
  type MediaDto,
} from '../lib/api';
import ServiceCategoriesPage from './ServiceCategories';
import RichTextEditor from '../components/RichTextEditor';
import { createSlug } from '../utils/slug';
import { normalizeImageUrl } from '../utils/image';
import { compressImage } from '../utils/image-compression';

const statusOptions = [
  { label: 'Nashr etilgan', value: 'published' },
  { label: 'Qoralama', value: 'draft' },
  { label: 'Arxiv', value: 'archived' },
];

export default function ServicesPage() {
  return (
    <Tabs
      defaultActiveKey="services"
      items={[
        {
          key: 'services',
          label: 'Xizmatlar',
          children: <ServicesManager />,
        },
        {
          key: 'categories',
          label: 'Kategoriyalar',
          children: <ServiceCategoriesPage />,
        },
      ]}
    />
  );
}

function ServicesManager() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<ServiceDto[], ApiError>({
    queryKey: ['services'],
    queryFn: getServices,
    retry: false,
  });

  // Fetch service categories for the dropdown
  const { data: categoriesDataRaw, isLoading: isLoadingCategories } = useQuery<ServiceCategoryDto[] | { items: ServiceCategoryDto[] }, ApiError>({
    queryKey: ['service-categories-admin'],
    queryFn: getServiceCategoriesAdmin,
    retry: false,
  });

  // Handle both array and paginated response formats
  const categoriesData = Array.isArray(categoriesDataRaw) 
    ? categoriesDataRaw 
    : (categoriesDataRaw as any)?.items || [];

  // Fetch media list for image selection
  const { data: mediaList } = useQuery<MediaDto[], ApiError>({
    queryKey: ['media'],
    queryFn: getMedia,
    retry: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceDto | null>(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { mutateAsync: createServiceMutation, isPending: isCreating } = useMutation<ServiceDto, ApiError, CreateServicePayload>({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      message.success('Xizmat saqlandi');
    },
    onError: (error) => message.error(error.message || 'Saqlashda xatolik'),
  });

  const { mutateAsync: updateServiceMutation, isPending: isUpdating } = useMutation<ServiceDto, ApiError, { id: string; payload: UpdateServicePayload }>({
    mutationFn: ({ id, payload }) => updateService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      message.success('Xizmat yangilandi');
    },
    onError: (error) => message.error(error.message || 'Yangilashda xatolik'),
  });

  const { mutateAsync: deleteServiceMutation, isPending: isDeleting } = useMutation<void, ApiError, string>({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      message.success('Xizmat o‘chirildi');
    },
    onError: (error) => message.error(error.message || "O'chirishda xatolik"),
  });

  const openCreateModal = () => {
    setEditingService(null);
    form.resetFields();
    setPreviewImage(null);
    form.setFieldsValue({
      status: 'published',
      order: 0,
      categoryId: undefined, // Explicitly reset categoryId
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service: ServiceDto) => {
    setEditingService(service);
    setPreviewImage(service.cover?.url ? normalizeImageUrl(service.cover.url) : null);
    // Handle categoryId - convert to array for multiple select
    const categoryId = service.categoryId || service.category?.id;
    form.setFieldsValue({
      title_uz: service.title_uz,
      title_ru: service.title_ru,
      excerpt_uz: service.excerpt_uz,
      excerpt_ru: service.excerpt_ru,
      body_uz: service.body_uz,
      body_ru: service.body_ru,
      slug: service.slug,
      status: service.status,
      order: service.order,
      coverId: service.cover?.id,
      categoryId: categoryId ? [categoryId] : undefined, // Convert to array for multiple select
    });
    setIsModalOpen(true);
  };

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      // Rasmni yuklashdan oldin siqish
      const compressedFile = await compressImage(file as File);
      const media = await uploadMedia(compressedFile);
      form.setFieldsValue({ coverId: media.id });
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
    form.setFieldsValue({ coverId: undefined });
    setPreviewImage(null);
  };

  const handleSelectExistingMedia = (mediaId: string, mediaUrl: string) => {
    form.setFieldsValue({ coverId: mediaId });
    setPreviewImage(normalizeImageUrl(mediaUrl));
  };

  const currentImageId = Form.useWatch('coverId', form);

  const handleDelete = async (service: ServiceDto) => {
    await deleteServiceMutation(service.id);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Handle multiple category selection - take first one if array, or use single value
      const categoryId = Array.isArray(values.categoryId) 
        ? (values.categoryId.length > 0 ? values.categoryId[0] : undefined)
        : values.categoryId;
      
      const payload: CreateServicePayload = {
        title_uz: values.title_uz,
        title_ru: values.title_ru,
        excerpt_uz: values.excerpt_uz ?? undefined,
        excerpt_ru: values.excerpt_ru ?? undefined,
        body_uz: values.body_uz ?? undefined,
        body_ru: values.body_ru ?? undefined,
        slug: values.slug,
        order: typeof values.order === 'number' ? values.order : Number(values.order ?? 0),
        status: values.status,
        coverId: values.coverId || undefined,
        categoryId: categoryId || undefined,
      };

      if (editingService) {
        await updateServiceMutation({ id: editingService.id, payload });
      } else {
        await createServiceMutation(payload);
      }

      setIsModalOpen(false);
      form.resetFields();
      setPreviewImage(null);
    } catch (error) {
      // validation handled by antd
    }
  };

  const columns: ColumnsType<ServiceDto> = useMemo(
    () => [
      {
        title: 'Xizmat',
        dataIndex: 'title_uz',
        key: 'title_uz',
        render: (value: string, record) => (
          <Space align="start">
            {record.cover?.url ? (
              <img
                src={normalizeImageUrl(record.cover.url)}
                alt={record.title_uz}
                style={{ width: 72, height: 56, objectFit: 'cover', borderRadius: 8 }}
              />
            ) : null}
            <div>
              <strong>{value}</strong>
              {record.title_ru ? (
                <div style={{ fontSize: 12, color: '#6b7280' }}>{record.title_ru}</div>
              ) : null}
              {record.category?.name_uz && (
                <div style={{ fontSize: 12, color: '#9ca3af' }}>
                  Kategoriya: {record.category.name_uz}
                </div>
              )}
            </div>
          </Space>
        ),
      },
      {
        title: 'Holati',
        dataIndex: 'status',
        key: 'status',
        render: (value: ServiceDto['status']) => {
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
        title: 'Yangilangan',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (value: string) => new Date(value).toLocaleDateString(),
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
              title="Xizmatni o‘chirish"
              description="Ushbu xizmatni o‘chirishni tasdiqlang"
              onConfirm={() => handleDelete(record)}
              okText="Ha"
              cancelText="Yo‘q"
            >
              <Button danger size="small" loading={isDeleting}>
                O‘chirish
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [isDeleting],
  );

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreateModal}>
          Yangi xizmat
        </Button>
      </Space>

      <Table
        loading={isLoading}
        dataSource={data ?? []}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingService ? 'Xizmatni tahrirlash' : 'Yangi xizmat'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setPreviewImage(null);
        }}
        onOk={handleSubmit}
        confirmLoading={isCreating || isUpdating}
        width={900}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Sarlavha (uz)"
            name="title_uz"
            rules={[{ required: true, message: 'Iltimos sarlavhani kiriting' }]}
          >
            <Input 
              placeholder="Masalan, Eshitish diagnostikasi"
              onChange={(e) => {
                const title = e.target.value;
                const currentSlug = form.getFieldValue('slug');
                // Only auto-generate slug if it's empty or was auto-generated
                if (!currentSlug || currentSlug === createSlug(form.getFieldValue('title_uz') || '')) {
                  form.setFieldsValue({ slug: createSlug(title) });
                }
              }}
            />
          </Form.Item>
          <Form.Item
            label="Sarlavha (ru)"
            name="title_ru"
            rules={[{ required: true, message: 'Iltimos sarlavhani kiriting' }]}
          >
            <Input placeholder="Например, Диагностика слуха" />
          </Form.Item>
          <Form.Item label="Qisqa tavsif (uz)" name="excerpt_uz">
            <Input.TextArea rows={2} placeholder="Xizmat haqida qisqa maʼlumot" />
          </Form.Item>
          <Form.Item label="Qisqa tavsif (ru)" name="excerpt_ru">
            <Input.TextArea rows={2} placeholder="Краткая информация о сервисе" />
          </Form.Item>
          <Form.Item 
            label="Batafsil mazmun (uz)" 
            name="body_uz"
            valuePropName="value"
            trigger="onChange"
          >
            <RichTextEditor placeholder="Xizmat tafsilotlari" />
          </Form.Item>
          <Form.Item 
            label="Batafsil mazmun (ru)" 
            name="body_ru"
            valuePropName="value"
            trigger="onChange"
          >
            <RichTextEditor placeholder="Подробности услуги" />
          </Form.Item>
          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Slug maydoni majburiy' }]}
            extra="URL uchun qisqa nom (avtomatik yaratiladi yoki qo'lda kiriting)"
          >
            <Input placeholder="Avtomatik yaratiladi..." />
          </Form.Item>
          <Form.Item label="Cover rasm" name="coverId" extra="Xizmat uchun asosiy rasm">
            <div>
              {previewImage ? (
                <div style={{ marginBottom: 16, position: 'relative', display: 'inline-block' }}>
                  <Image
                    src={previewImage}
                    alt="Preview"
                    width={200}
                    height={150}
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                    preview={false}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleRemoveImage}
                    style={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    O'chirish
                  </Button>
                </div>
              ) : null}
              <Upload
                customRequest={handleUpload}
                showUploadList={false}
                accept="image/*"
                disabled={uploading}
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {previewImage ? 'Rasmni almashtirish' : 'Rasm yuklash'}
                </Button>
              </Upload>
              {mediaList && mediaList.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
                    Yoki mavjud rasmni tanlang:
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                      gap: 8,
                      maxHeight: 200,
                      overflowY: 'auto',
                      padding: 8,
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                    }}
                  >
                    {mediaList.slice(0, 20).map((media) => (
                      <div
                        key={media.id}
                        onClick={() => handleSelectExistingMedia(media.id, media.url)}
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          border: currentImageId === media.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                          borderRadius: 4,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          position: 'relative',
                          backgroundColor: currentImageId === media.id ? '#e6f7ff' : '#fff',
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
          <Form.Item label="Tartib" name="order" initialValue={0}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Holat" name="status" initialValue="published">
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item label="Kategoriyalar" name="categoryId" extra="Xizmat kategoriyalarini tanlang (bir nechta tanlash mumkin, ixtiyoriy)">
            <Select
              mode="multiple"
              placeholder="Kategoriyalarni tanlang"
              allowClear
              loading={isLoadingCategories}
              options={categoriesData?.map((cat: ServiceCategoryDto) => ({
                label: `${cat.name_uz}${cat.name_ru ? ` / ${cat.name_ru}` : ''}`,
                value: cat.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
