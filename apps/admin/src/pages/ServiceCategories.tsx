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
  Row,
  Col,
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
  getServiceCategoriesAdmin,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  ServiceCategoryDto,
  CreateServiceCategoryPayload,
  UpdateServiceCategoryPayload,
  ApiError,
  getMedia,
  uploadMedia,
  type MediaDto,
} from '../lib/api';
import { createSlug } from '../utils/slug';
import { normalizeImageUrl } from '../utils/image';
import { compressImage } from '../utils/image-compression';

const statusOptions = [
  { label: 'Nashr etilgan', value: 'published' },
  { label: 'Qoralama', value: 'draft' },
  { label: 'Arxiv', value: 'archived' },
];

export default function ServiceCategoriesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<ServiceCategoryDto[], ApiError>({
    queryKey: ['service-categories-admin'],
    queryFn: getServiceCategoriesAdmin,
  });

  const categories = data ?? [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategoryDto | null>(null);
  const [form] = Form.useForm();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Get media list for image selection
  const { data: mediaList } = useQuery<MediaDto[], ApiError>({
    queryKey: ['media'],
    queryFn: getMedia,
    retry: false,
  });

  const { mutateAsync: createMutation, isPending: isCreating } = useMutation<
    ServiceCategoryDto,
    ApiError,
    CreateServiceCategoryPayload
  >({
    mutationFn: createServiceCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories-admin'] });
      queryClient.invalidateQueries({ queryKey: ['services'] }); // Also invalidate services to refresh category info
      message.success('Kategoriya saqlandi');
    },
    onError: (error) => message.error(error.message || 'Saqlashda xatolik'),
  });

  const { mutateAsync: updateMutation, isPending: isUpdating } = useMutation<
    ServiceCategoryDto,
    ApiError,
    { id: string; payload: UpdateServiceCategoryPayload }
  >({
    mutationFn: ({ id, payload }) => updateServiceCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories-admin'] });
      queryClient.invalidateQueries({ queryKey: ['services'] }); // Also invalidate services to refresh category info
      message.success('Kategoriya yangilandi');
    },
    onError: (error) => message.error(error.message || 'Yangilashda xatolik'),
  });

  const { mutateAsync: deleteMutation, isPending: isDeleting } = useMutation<void, ApiError, string>({
    mutationFn: deleteServiceCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories-admin'] });
      queryClient.invalidateQueries({ queryKey: ['services'] }); // Also invalidate services to refresh category info
      message.success('Kategoriya o\'chirildi');
    },
    onError: (error) => message.error(error.message || "O'chirishda xatolik"),
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setPreviewImage(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'published',
      order: 0,
      imageId: undefined,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category: ServiceCategoryDto) => {
    setEditingCategory(category);
    setPreviewImage(category.image?.url ? normalizeImageUrl(category.image.url) : null);
    form.setFieldsValue({
      name_uz: category.name_uz,
      name_ru: category.name_ru,
      description_uz: category.description_uz,
      description_ru: category.description_ru,
      slug: category.slug,
      status: category.status,
      order: category.order,
      imageId: category.image?.id,
      parentId: category.parentId,
    });
    setIsModalOpen(true);
  };

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    if (!file) {
      onError?.(new Error('Fayl tanlanmadi'));
      return;
    }
    setUploading(true);
    try {
      // Rasmni yuklashdan oldin siqish
      const compressedFile = await compressImage(file as File);
      const media = await uploadMedia(compressedFile);
      const imageUrl = normalizeImageUrl(media.url);
      form.setFieldsValue({ imageId: media.id });
      setPreviewImage(imageUrl);
      message.success('Rasm yuklandi');
      queryClient.invalidateQueries({ queryKey: ['media'] });
      onSuccess?.(media);
    } catch (error) {
      console.error('Rasm yuklashda xatolik:', error);
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
    const imageUrl = normalizeImageUrl(mediaUrl);
    form.setFieldsValue({ imageId: mediaId });
    setPreviewImage(imageUrl);
    message.success('Rasm tanlandi');
  };

  const currentImageId = Form.useWatch('imageId', form);
  const currentMedia = mediaList?.find((m) => m.id === currentImageId);

  const handleDelete = async (category: ServiceCategoryDto) => {
    await deleteMutation(category.id);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateServiceCategoryPayload = {
        name_uz: values.name_uz,
        name_ru: values.name_ru,
        description_uz: values.description_uz ?? undefined,
        description_ru: values.description_ru ?? undefined,
        slug: values.slug,
        order: typeof values.order === 'number' ? values.order : Number(values.order ?? 0),
        status: values.status,
        imageId: values.imageId || undefined,
        parentId: values.parentId || undefined,
      };

      if (editingCategory) {
        await updateMutation({ id: editingCategory.id, payload });
      } else {
        await createMutation(payload);
      }

      setIsModalOpen(false);
      form.resetFields();
      setPreviewImage(null);
    } catch (error) {
      // validation handled by antd
    }
  };

  // Get parent categories for dropdown
  const parentCategoryOptions = useMemo(() => {
    return categories
      .filter((cat) => !cat.parentId && cat.id !== editingCategory?.id)
      .map((cat) => ({
        label: `${cat.name_uz} / ${cat.name_ru}`,
        value: cat.id,
      }));
  }, [categories, editingCategory]);

  const columns: ColumnsType<ServiceCategoryDto> = useMemo(
    () => [
      {
        title: 'Kategoriya',
        dataIndex: 'name_uz',
        key: 'name_uz',
        render: (value: string, record) => (
          <Space align="start">
            {record.image?.url ? (
              <img
                src={normalizeImageUrl(record.image.url)}
                alt={record.name_uz}
                style={{ width: 72, height: 56, objectFit: 'cover', borderRadius: 8 }}
              />
            ) : null}
            <div>
              <strong>{value}</strong>
              {record.name_ru ? (
                <div style={{ fontSize: 12, color: '#6b7280' }}>{record.name_ru}</div>
              ) : null}
              {record.parent ? (
                <div style={{ fontSize: 11, color: '#9ca3af' }}>
                  Ota kategoriya: {record.parent.name_uz}
                </div>
              ) : null}
            </div>
          </Space>
        ),
      },
      {
        title: 'Slug',
        dataIndex: 'slug',
        key: 'slug',
      },
      {
        title: 'Holati',
        dataIndex: 'status',
        key: 'status',
        render: (value: ServiceCategoryDto['status']) => {
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
        title: 'Xizmatlar soni',
        key: 'servicesCount',
        render: (_, record) => record.services?.length || 0,
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
              title="Kategoriyani o'chirish"
              description="Ushbu kategoriyani o'chirishni tasdiqlang"
              onConfirm={() => handleDelete(record)}
              okText="Ha"
              cancelText="Yo'q"
            >
              <Button danger size="small" loading={isDeleting}>
                O'chirish
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
          Yangi kategoriya
        </Button>
      </Space>

      <Table
        loading={isLoading}
        dataSource={categories}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setPreviewImage(null);
        }}
        onOk={handleSubmit}
        confirmLoading={isCreating || isUpdating}
        width={800}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Nomi (uz)"
            name="name_uz"
            rules={[{ required: true, message: 'Iltimos nomini kiriting' }]}
          >
            <Input 
              placeholder="Masalan, Eshitish diagnostikasi"
              onChange={(e) => {
                const name = e.target.value;
                const currentSlug = form.getFieldValue('slug');
                if (!currentSlug || currentSlug === createSlug(form.getFieldValue('name_uz') || '')) {
                  form.setFieldsValue({ slug: createSlug(name) });
                }
              }}
            />
          </Form.Item>
          <Form.Item
            label="Nomi (ru)"
            name="name_ru"
            rules={[{ required: true, message: 'Iltimos nomini kiriting' }]}
          >
            <Input placeholder="Например, Диагностика слуха" />
          </Form.Item>
          <Form.Item label="Tavsif (uz)" name="description_uz">
            <Input.TextArea rows={2} placeholder="Kategoriya haqida qisqa maʼlumot" />
          </Form.Item>
          <Form.Item label="Tavsif (ru)" name="description_ru">
            <Input.TextArea rows={2} placeholder="Краткая информация о категории" />
          </Form.Item>
          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Slug maydoni majburiy' }]}
            extra="URL uchun qisqa nom (avtomatik yaratiladi yoki qo'lda kiriting)"
          >
            <Input placeholder="Avtomatik yaratiladi..." />
          </Form.Item>
          <Form.Item label="Ota kategoriya" name="parentId" extra="Ixtiyoriy - boshqa kategoriya ichida kategoriya yaratish">
            <Select
              options={parentCategoryOptions}
              placeholder="Ota kategoriya tanlang"
              allowClear
            />
          </Form.Item>
          <Form.Item label="Tartib" name="order" initialValue={0}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Holat" name="status" initialValue="published">
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item 
            label="Rasm" 
            name="imageId" 
            extra="Kategoriya rasmi (ixtiyoriy)"
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
              
              {(previewImage || (currentImageId && currentMedia?.url)) && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>Tanlangan rasm:</div>
                  <Image
                    src={previewImage || normalizeImageUrl(currentMedia?.url || '')}
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
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

