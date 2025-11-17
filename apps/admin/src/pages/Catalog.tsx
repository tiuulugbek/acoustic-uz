import { useMemo, useState, useEffect } from 'react';
import {
  Tabs,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
  Tag,
  InputNumber,
  Alert,
  Switch,
  Divider,
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
  getProductCategoriesAdmin,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  getProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
  ProductCategoryDto,
  CreateProductCategoryPayload,
  UpdateProductCategoryPayload,
  ProductDto,
  CreateProductPayload,
  UpdateProductPayload,
  BrandDto,
  CatalogDto,
  getCatalogsAdmin,
  createCatalog,
  updateCatalog,
  deleteCatalog,
  CreateCatalogPayload,
  UpdateCatalogPayload,
  ApiError,
  getMedia,
  uploadMedia,
  type MediaDto,
} from '../lib/api';
import RichTextEditor from '../components/RichTextEditor';

const statusOptions = [
  { label: 'Nashr etilgan', value: 'published' },
  { label: 'Qoralama', value: 'draft' },
  { label: 'Arxiv', value: 'archived' },
];

const productTypeOptions = [
  { label: 'Eshitish moslamalari', value: 'hearing-aids' },
  { label: 'Qo\'shimcha mahsulotlar', value: 'accessories' },
  { label: 'Interacoustic mahsulotlari', value: 'interacoustics' },
];

export default function CatalogPage() {
  return (
    <Tabs
      defaultActiveKey="catalogs"
      items={[
        {
          key: 'catalogs',
          label: 'Kataloglar',
          children: <CatalogManager />,
        },
        {
          key: 'categories',
          label: 'Kategoriyalar',
          children: <CategoryManager />,
        },
        {
          key: 'products',
          label: 'Mahsulotlar',
          children: (
            <Tabs
              defaultActiveKey="hearing-aids"
              items={[
                {
                  key: 'hearing-aids',
                  label: 'Eshitish moslamalari',
                  children: <ProductManager productTypeFilter="hearing-aids" />,
                },
                {
                  key: 'interacoustics',
                  label: 'Interacoustics',
                  children: <ProductManager productTypeFilter="interacoustics" />,
                },
                {
                  key: 'accessories',
                  label: 'Aksessuarlar',
                  children: <ProductManager productTypeFilter="accessories" />,
                },
              ]}
            />
          ),
        },
      ]}
    />
  );
}

function CatalogManager() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['catalogs-admin'],
    queryFn: async (): Promise<CatalogDto[]> => {
      try {
        console.log('[CatalogManager] Fetching catalogs from /catalogs/admin...');
        const result = await getCatalogsAdmin();
        console.log('[CatalogManager] Catalogs fetched successfully:', result);
        console.log('[CatalogManager] Number of catalogs:', result?.length ?? 0);
        return result ?? [];
      } catch (err) {
        console.error('[CatalogManager] Error fetching catalogs:', err);
        const apiError = err as ApiError;
        console.error('[CatalogManager] Error details:', {
          message: apiError.message,
          status: apiError.status,
        });
        // Don't throw, return empty array instead
        message.error(`Kataloglarni yuklashda xatolik: ${apiError.message || "Noma'lum xatolik"}`);
        return [];
      }
    },
    retry: false,
  });

  const { data: mediaList } = useQuery({
    queryKey: ['media'],
    queryFn: getMedia,
  });

  const catalogs = data ?? [];

  useEffect(() => {
    console.log('[CatalogManager] Component state:', {
      isLoading,
      hasError: !!error,
      catalogsCount: catalogs.length,
      catalogs,
    });
    if (error) {
      console.error('[CatalogManager] Query error:', error);
      message.error(`Kataloglarni yuklashda xatolik: ${error.message || error}`);
    }
  }, [error, isLoading, catalogs]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogDto | null>(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { mutateAsync: createMutation, isPending: isCreating } = useMutation<
    CatalogDto,
    ApiError,
    CreateCatalogPayload
  >({
    mutationFn: createCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs-admin'] });
      message.success('Katalog saqlandi');
    },
    onError: (error) => message.error(error.message || 'Saqlashda xatolik'),
  });

  const { mutateAsync: updateMutation, isPending: isUpdating } = useMutation<
    CatalogDto,
    ApiError,
    { id: string; payload: UpdateCatalogPayload }
  >({
    mutationFn: ({ id, payload }) => updateCatalog(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs-admin'] });
      message.success('Katalog yangilandi');
    },
    onError: (error) => message.error(error.message || 'Yangilashda xatolik'),
  });

  const { mutateAsync: deleteMutation, isPending: isDeleting } = useMutation<void, ApiError, string>({
    mutationFn: deleteCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs-admin'] });
      message.success('Katalog o‘chirildi');
    },
    onError: (error) => message.error(error.message || "O'chirishda xatolik"),
  });

  const openCreateModal = () => {
    setEditing(null);
    setPreviewImage(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'published',
      order: 0,
      showOnHomepage: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (record: CatalogDto) => {
    setEditing(record);
    setPreviewImage(record.image?.url ?? null);
    form.setFieldsValue({
      name_uz: record.name_uz,
      name_ru: record.name_ru,
      slug: record.slug,
      description_uz: record.description_uz ?? undefined,
      description_ru: record.description_ru ?? undefined,
      icon: record.icon ?? undefined,
      imageId: record.image?.id ?? undefined,
      order: record.order,
      status: record.status,
      showOnHomepage: record.showOnHomepage ?? false,
    });
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
        status: values.status || 'published',
        showOnHomepage: values.showOnHomepage ?? false,
      };

      if (editing) {
        await updateMutation({ id: editing.id, payload });
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

  const handleDelete = async (record: CatalogDto) => {
    await deleteMutation(record.id);
  };

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
        title: 'Holat',
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
        render: (_, record) => (
          <Space>
            <Button size="small" onClick={() => openEditModal(record)}>
              Tahrirlash
            </Button>
            <Popconfirm
              title="Katalog o'chiriladi"
              description="Ushbu katalogni o'chirishni tasdiqlang"
              okText="Ha"
              cancelText="Yo'q"
              onConfirm={() => handleDelete(record)}
            >
              <Button danger size="small" loading={isDeleting}>
                O'chirish
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [isDeleting, mediaList],
  );

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreateModal}>
          Yangi katalog
        </Button>
      </Space>

      <Table
        loading={isLoading}
        dataSource={catalogs}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? 'Katalogni tahrirlash' : 'Yangi katalog'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setPreviewImage(null);
        }}
        onOk={handleSubmit}
        confirmLoading={isCreating || isUpdating}
        okText="Saqlash"
        cancelText="Bekor qilish"
        width={800}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Nomi (uz)"
            name="name_uz"
            rules={[{ required: true, message: 'Iltimos, katalog nomini kiriting' }]}
          >
            <Input placeholder="Masalan, Ko'rinmas quloq apparatlari" />
          </Form.Item>
          <Form.Item
            label="Nomi (ru)"
            name="name_ru"
            rules={[{ required: true, message: 'Iltimos, katalog nomini kiriting' }]}
          >
            <Input placeholder="Например, Невидимые слуховые аппараты" />
          </Form.Item>
          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Slug maydoni majburiy' }]}
            extra="URL uchun qisqa nom"
          >
            <Input placeholder="ko-rinmas-quloq-apparatlari" />
          </Form.Item>
          <Form.Item label="Tavsif (uz)" name="description_uz">
            <Input.TextArea rows={3} placeholder="Katalog haqida qisqa ma'lumot" />
          </Form.Item>
          <Form.Item label="Tavsif (ru)" name="description_ru">
            <Input.TextArea rows={3} placeholder="Краткая информация о каталоге" />
          </Form.Item>
          <Form.Item label="Rasm" name="imageId" extra="Katalog rasmi">
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
                  <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>Tanlangan rasm:</div>
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
          <Form.Item label="Ikonka (ixtiyoriy)" name="icon">
            <Input placeholder="Ant Design ikonkasi yoki o'z belgingiz" />
          </Form.Item>
          <Form.Item label="Bosh sahifada ko'rsatish" name="showOnHomepage" valuePropName="checked" extra="Agar belgilansa, katalog bosh sahifada ko'rinadi">
            <Switch />
          </Form.Item>
          <Form.Item label="Tartib" name="order" initialValue={0}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item label="Holat" name="status" initialValue="published">
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function CategoryManager() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['product-categories-admin'],
    queryFn: getProductCategoriesAdmin,
  });

  const categories = data ?? [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductCategoryDto | null>(null);
  const [form] = Form.useForm();

  const { mutateAsync: createMutation, isPending: isCreating } = useMutation<
    ProductCategoryDto,
    ApiError,
    CreateProductCategoryPayload
  >({
    mutationFn: createProductCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories-admin'] });
      message.success('Kategoriya saqlandi');
    },
    onError: (error) => message.error(error.message || 'Saqlashda xatolik'),
  });

  const { mutateAsync: updateMutation, isPending: isUpdating } = useMutation<
    ProductCategoryDto,
    ApiError,
    { id: string; payload: UpdateProductCategoryPayload }
  >({
    mutationFn: ({ id, payload }) => updateProductCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories-admin'] });
      message.success('Kategoriya yangilandi');
    },
    onError: (error) => message.error(error.message || 'Yangilashda xatolik'),
  });

  const { mutateAsync: deleteMutation, isPending: isDeleting } = useMutation<void, ApiError, string>({
    mutationFn: deleteProductCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories-admin'] });
      message.success('Kategoriya o‘chirildi');
    },
    onError: (error) => message.error(error.message || "O'chirishda xatolik"),
  });

  const openCreateModal = () => {
    setEditing(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record: ProductCategoryDto) => {
    setEditing(record);
    form.setFieldsValue({
      name_uz: record.name_uz,
      name_ru: record.name_ru,
      slug: record.slug,
      icon: record.icon ?? undefined,
      parentId: record.parentId ?? undefined,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateProductCategoryPayload = {
        name_uz: values.name_uz,
        name_ru: values.name_ru,
        slug: values.slug,
        icon: values.icon || undefined,
        parentId: values.parentId || undefined,
      };

      if (editing) {
        await updateMutation({ id: editing.id, payload });
      } else {
        await createMutation(payload);
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      // validation handled by antd
    }
  };

  const handleDelete = async (record: ProductCategoryDto) => {
    await deleteMutation(record.id);
  };

  const columns: ColumnsType<ProductCategoryDto> = useMemo(
    () => [
      {
        title: 'Kategoriya (uz)',
        dataIndex: 'name_uz',
        key: 'name_uz',
        render: (value: string, record) => (
          <div>
            <strong>{value}</strong>
            {record.name_ru ? (
              <div style={{ fontSize: 12, color: '#6b7280' }}>{record.name_ru}</div>
            ) : null}
          </div>
        ),
      },
      {
        title: 'Slug',
        dataIndex: 'slug',
        key: 'slug',
      },
      {
        title: 'Ota kategoriya',
        key: 'parent',
        render: (_, record) => {
          const parent = categories.find((cat) => cat.id === record.parentId);
          return parent ? parent.name_uz : '—';
        },
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
              title="Kategoriya o‘chiriladi"
              description="Ushbu kategoriyani o‘chirishni tasdiqlang"
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
    [categories, isDeleting],
  );

  const parentOptions = categories
    .filter((cat) => !editing || cat.id !== editing.id)
    .map((cat) => ({
      value: cat.id,
      label: `${cat.name_uz} — ${cat.name_ru}`,
    }));

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
        title={editing ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={isCreating || isUpdating}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Nomi (uz)"
            name="name_uz"
            rules={[{ required: true, message: 'Iltimos, kategoriya nomini kiriting' }]}
          >
            <Input placeholder="Masalan, Quloq apparatlari" />
          </Form.Item>
          <Form.Item
            label="Nomi (ru)"
            name="name_ru"
            rules={[{ required: true, message: 'Iltimos, kategoriya nomini kiriting' }]}
          >
            <Input placeholder="Например, Слуховые аппараты" />
          </Form.Item>
          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Slug maydoni majburiy' }]}
            extra="URL uchun qisqa nom"
          >
            <Input placeholder="quloq-apparatlari" />
          </Form.Item>
          <Form.Item label="Ikonka (ixtiyoriy)" name="icon">
            <Input placeholder="Ant Design ikonkasi yoki o‘z belgingiz" />
          </Form.Item>
          <Form.Item label="Ota kategoriya" name="parentId">
            <Select
              allowClear
              options={parentOptions}
              placeholder="Ota kategoriyani tanlang"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function ProductManager({ productTypeFilter }: { productTypeFilter?: string }) {
  const queryClient = useQueryClient();
  const [selectedProductType, setSelectedProductType] = useState<string | undefined>(undefined);

  const audienceOptions = [
    { value: 'children', label: 'Bolalar' },
    { value: 'adults', label: 'Kattalar' },
    { value: 'elderly', label: 'Keksalar' },
  ];

  const formFactorOptions = [
    { value: 'bte', label: 'BTE (quloq orqasida)' },
    { value: 'mini-bte', label: 'Mini BTE' },
    { value: 'ite', label: 'ITE (quloq ichida)' },
    { value: 'itc', label: 'ITC (kanal ichida)' },
    { value: 'cic-iic', label: 'CIC / IIC (ko‘rinmas)' },
    { value: 'ric', label: 'RIC' },
  ];

  const smartphoneOptions = [
    { value: 'iphone', label: 'iPhone bilan mos' },
    { value: 'android', label: 'Android / Bluetooth' },
    { value: 'remote', label: 'Masofadan boshqaruv' },
  ];

  const hearingLossOptions = [
    { value: 'mild', label: 'I daraja (yengil)' },
    { value: 'moderate', label: 'II daraja (o‘rta)' },
    { value: 'severe', label: 'III daraja (og‘ir)' },
    { value: 'profound', label: 'IV daraja (chuqur)' },
  ];

  const paymentOptions = [
    { value: 'cash-card', label: 'Naqd / karta' },
    { value: 'installment-0', label: '0% muddatli to‘lov' },
    { value: 'installment-6', label: '6 oylik muddatli to‘lov' },
  ];

  const availabilityOptions = [
    { value: 'in-stock', label: 'Sotuvda' },
    { value: 'preorder', label: 'Buyurtmaga' },
    { value: 'out-of-stock', label: 'Tugagan' },
  ];

  const parseMultiline = (value?: string) =>
    value
      ? value
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean)
      : undefined;

  const parseCommaSeparated = (value?: string) =>
    value
      ? value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : undefined;

  const normalizeMultilineField = (value?: string) => {
    if (value === undefined) {
      return undefined;
    }
    return parseMultiline(value) ?? [];
  };

  const normalizeCommaSeparatedField = (value?: string) => {
    if (value === undefined) {
      return undefined;
    }
    return parseCommaSeparated(value) ?? [];
  };

  const normalizeRichTextField = (value?: string) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    const stripped = value
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
    return stripped ? value : undefined;
  };

  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['products-admin'],
    queryFn: getProductsAdmin,
  });
  
  // Extract items from paginated response and filter by productType
  // If productType is null/undefined, treat it as 'hearing-aids' (default)
  const products = useMemo(() => {
    const allProducts = productsResponse?.items ?? [];
    if (productTypeFilter) {
      return allProducts.filter((p) => {
        // If productType is null/undefined, treat as 'hearing-aids' for backward compatibility
        const actualProductType = p.productType || 'hearing-aids';
        return actualProductType === productTypeFilter;
      });
    }
    return allProducts;
  }, [productsResponse, productTypeFilter]);

  const { data: categories } = useQuery({
    queryKey: ['product-categories-admin'],
    queryFn: getProductCategoriesAdmin,
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
  });

  const { data: catalogs, isLoading: isLoadingCatalogs, error: catalogsError } = useQuery({
    queryKey: ['catalogs-admin'],
    queryFn: getCatalogsAdmin,
    retry: false,
  });

  // Debug: log catalogs data
  useEffect(() => {
    console.log('Catalogs query state:', { 
      isLoading: isLoadingCatalogs, 
      hasError: !!catalogsError, 
      catalogsCount: catalogs?.length ?? 0,
      catalogs 
    });
    if (catalogsError) {
      console.error('Failed to load catalogs:', catalogsError);
    }
    if (catalogs !== undefined) {
      console.log('Catalogs loaded:', catalogs.length, catalogs);
    }
  }, [catalogs, catalogsError, isLoadingCatalogs]);

  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductDto | null>(null);

  const { mutateAsync: createMutation, isPending: isCreating } = useMutation<ProductDto, ApiError, CreateProductPayload>({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-admin'] });
      message.success('Mahsulot muvaffaqiyatli saqlandi');
    },
    onError: (error) => {
      console.error('Create product error:', error);
      message.error(error.message || 'Mahsulotni saqlashda xatolik yuz berdi');
    },
  });

  const { mutateAsync: updateMutation, isPending: isUpdating } = useMutation<
    ProductDto,
    ApiError,
    { id: string; payload: UpdateProductPayload }
  >({
    mutationFn: ({ id, payload }) => updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-admin'] });
      message.success('Mahsulot muvaffaqiyatli yangilandi');
    },
    onError: (error) => {
      console.error('Update product error:', error);
      message.error(error.message || 'Mahsulotni yangilashda xatolik yuz berdi');
    },
  });

  const { mutateAsync: deleteMutation, isPending: isDeleting } = useMutation<void, ApiError, string>({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-admin'] });
      message.success("Mahsulot muvaffaqiyatli o'chirildi");
    },
    onError: (error) => {
      console.error('Delete product error:', error);
      message.error(error.message || "Mahsulotni o'chirishda xatolik yuz berdi");
    },
  });

  const openCreateModal = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'published',
      stock: 0,
      audience: [],
      formFactors: undefined, // Changed to single select, so undefined instead of []
      smartphoneCompatibility: [],
      hearingLossLevels: [],
      paymentOptions: [],
      tinnitusSupport: false,
      availabilityStatus: 'in-stock',
      catalogIds: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: ProductDto) => {
    setEditing(product);
    const productType = product.productType ?? undefined;
    setSelectedProductType(productType);
    form.setFieldsValue({
      name_uz: product.name_uz,
      name_ru: product.name_ru,
      slug: product.slug,
      productType: productType,
      description_uz: product.description_uz,
      description_ru: product.description_ru,
      price: product.price ? Number(product.price) : undefined,
      stock: product.stock ?? undefined,
      brandId: product.brandId ?? product.brand?.id ?? undefined,
      categoryId: product.categoryId ?? product.category?.id ?? undefined,
      catalogIds: product.catalogs?.map(c => c.id) ?? [],
      status: product.status,
      specsText: product.specsText ?? undefined,
      galleryIds: product.galleryIds?.length ? product.galleryIds.join(', ') : undefined,
      galleryUrls: product.galleryUrls?.length ? product.galleryUrls.join(', ') : undefined,
      audience: product.audience ?? [],
      formFactors: product.formFactors?.[0] ?? undefined, // Take first formFactor for single select
      smartphoneCompatibility: product.smartphoneCompatibility ?? [],
      hearingLossLevels: product.hearingLossLevels ?? [],
      paymentOptions: product.paymentOptions ?? [],
      signalProcessing: product.signalProcessing ?? undefined,
      powerLevel: product.powerLevel ?? undefined,
      tinnitusSupport: product.tinnitusSupport ?? false,
      availabilityStatus: product.availabilityStatus ?? undefined,
      intro_uz: product.intro_uz ?? undefined,
      intro_ru: product.intro_ru ?? undefined,
      features_uz: product.features_uz?.length ? product.features_uz.join('\n') : undefined,
      features_ru: product.features_ru?.length ? product.features_ru.join('\n') : undefined,
      benefits_uz: product.benefits_uz?.length ? product.benefits_uz.join('\n') : undefined,
      benefits_ru: product.benefits_ru?.length ? product.benefits_ru.join('\n') : undefined,
      tech_uz: product.tech_uz ?? undefined,
      tech_ru: product.tech_ru ?? undefined,
      fittingRange_uz: product.fittingRange_uz ?? undefined,
      fittingRange_ru: product.fittingRange_ru ?? undefined,
      regulatoryNote_uz: product.regulatoryNote_uz ?? undefined,
      regulatoryNote_ru: product.regulatoryNote_ru ?? undefined,
      relatedProductIds: product.relatedProductIds?.length ? product.relatedProductIds.join(', ') : undefined,
      usefulArticleSlugs: product.usefulArticleSlugs?.length ? product.usefulArticleSlugs.join(', ') : undefined,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (product: ProductDto) => {
    try {
      await deleteMutation(product.id);
    } catch (error: any) {
      console.error('Delete product error:', error);
      // Error is already handled by mutation onError - mutation will handle it
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const galleryIds =
        values.galleryIds !== undefined ? parseCommaSeparated(String(values.galleryIds)) ?? [] : undefined;

      const galleryUrls = normalizeCommaSeparatedField(
        values.galleryUrls !== undefined ? String(values.galleryUrls) : undefined,
      );
      const featuresUz = normalizeMultilineField(values.features_uz);
      const featuresRu = normalizeMultilineField(values.features_ru);
      const benefitsUz = normalizeMultilineField(values.benefits_uz);
      const benefitsRu = normalizeMultilineField(values.benefits_ru);
      const relatedProductIds = normalizeCommaSeparatedField(
        values.relatedProductIds !== undefined ? String(values.relatedProductIds) : undefined,
      );
      const usefulArticleSlugs = normalizeCommaSeparatedField(
        values.usefulArticleSlugs !== undefined ? String(values.usefulArticleSlugs) : undefined,
      );

      const payload: CreateProductPayload = {
        name_uz: values.name_uz,
        name_ru: values.name_ru,
        slug: values.slug,
        description_uz: normalizeRichTextField(values.description_uz),
        description_ru: normalizeRichTextField(values.description_ru),
        price:
          values.price === undefined || values.price === null || values.price === ''
            ? undefined
            : Number(values.price),
        stock:
          typeof values.stock === 'number'
            ? values.stock
            : values.stock !== undefined && values.stock !== null
            ? Number(values.stock)
            : undefined,
        productType: values.productType || undefined,
        brandId: values.brandId || undefined,
        categoryId: values.categoryId || undefined,
        catalogIds: values.catalogIds || [],
        status: values.status,
        specsText: values.specsText || undefined,
        galleryIds,
        galleryUrls,
        audience: values.audience ?? [],
        formFactors: values.formFactors ? [values.formFactors] : [], // Convert single select to array
        smartphoneCompatibility: values.smartphoneCompatibility ?? [],
        hearingLossLevels: values.hearingLossLevels ?? [],
        paymentOptions: values.paymentOptions ?? [],
        signalProcessing: values.signalProcessing || undefined,
        powerLevel: values.powerLevel || undefined,
        tinnitusSupport: values.tinnitusSupport ?? false,
        availabilityStatus: values.availabilityStatus || undefined,
        intro_uz: values.intro_uz || undefined,
        intro_ru: values.intro_ru || undefined,
        features_uz: featuresUz,
        features_ru: featuresRu,
        benefits_uz: benefitsUz,
        benefits_ru: benefitsRu,
        tech_uz: normalizeRichTextField(values.tech_uz),
        tech_ru: normalizeRichTextField(values.tech_ru),
        fittingRange_uz: normalizeRichTextField(values.fittingRange_uz),
        fittingRange_ru: normalizeRichTextField(values.fittingRange_ru),
        regulatoryNote_uz: values.regulatoryNote_uz || undefined,
        regulatoryNote_ru: values.regulatoryNote_ru || undefined,
        relatedProductIds,
        usefulArticleSlugs,
      };

      if (editing) {
        await updateMutation({ id: editing.id, payload });
      } else {
        await createMutation(payload);
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditing(null);
    } catch (error: any) {
      // Log error for debugging
      console.error('Product form error:', error);
      // Validation errors are handled by antd - they have errorFields
      if (error?.errorFields) {
        // Form validation error - antd will show it
        return;
      }
      // If it's not a validation error and mutation didn't handle it, show a message
      if (error?.message && !error.errorFields) {
        message.error(error.message || 'Xatolik yuz berdi');
      }
    }
  };

  const columns: ColumnsType<ProductDto> = useMemo(
    () => [
      {
        title: 'Mahsulot',
        dataIndex: 'name_uz',
        key: 'name_uz',
        render: (value: string, record) => (
          <div>
            <strong>{value}</strong>
            {record.name_ru ? (
              <div style={{ fontSize: 12, color: '#6b7280' }}>{record.name_ru}</div>
            ) : null}
          </div>
        ),
      },
      {
        title: 'Brend',
        key: 'brand',
        render: (_, record) => record.brand?.name ?? '—',
      },
      {
        title: 'Kategoriya',
        key: 'category',
        render: (_, record) => record.category?.name_uz ?? '—',
      },
      {
        title: 'Kataloglar',
        key: 'catalogs',
        render: (_, record) => 
          record.catalogs && record.catalogs.length > 0
            ? record.catalogs.map(c => c.name_uz).join(', ')
            : '—',
      },
      {
        title: 'Narx',
        dataIndex: 'price',
        key: 'price',
        render: (value: string | undefined) => (value ? `${value} so‘m` : '—'),
      },
      {
        title: 'Holat',
        dataIndex: 'status',
        key: 'status',
        render: (value: ProductDto['status']) => {
          const color = value === 'published' ? 'green' : value === 'draft' ? 'orange' : 'default';
          return <Tag color={color}>{value}</Tag>;
        },
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
              title="Mahsulot o‘chiriladi"
              description="Ushbu mahsulotni o‘chirishni tasdiqlang"
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
    [isDeleting],
  );

  const categoryOptions = (categories ?? []).map((category) => ({
    value: category.id,
    label: category.name_uz,
  }));

  const catalogOptions = (catalogs ?? []).map((catalog) => ({
    value: catalog.id,
    label: catalog.name_uz,
  }));

  const brandOptions = (brands ?? []).map((brand) => ({
    value: brand.id,
    label: brand.name,
  }));


  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreateModal}>
          Yangi mahsulot
        </Button>
      </Space>

      <Alert
        type="info"
        showIcon
        message="Galereya rasmlari"
        description="Media kutubxonasi tayyor bo'lgunga qadar rasmlar uchun IDlarni qo'lda kiriting. 'Gallery ID' maydoniga vergul bilan ajratilgan ro'yxat kiritsangiz, frontend ular asosida tasvirlarni yuklaydi."
        style={{ marginBottom: 16 }}
      />

      <Table
        loading={isLoading}
        dataSource={products ?? []}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={isCreating || isUpdating}
        width={1000}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form layout="vertical" form={form}>
          <Tabs
            defaultActiveKey="basic"
            items={[
              {
                key: 'basic',
                label: 'Asosiy',
                children: (
                  <>
                    {/* Product Type - First */}
                    <Divider orientation="left">Mahsulot turi</Divider>
                    <Form.Item 
                      label="Mahsulot turi" 
                      name="productType"
                      rules={[{ required: true, message: 'Mahsulot turini tanlang' }]}
                    >
                      <Select
                        allowClear
                        placeholder="Mahsulot turini tanlang"
                        options={productTypeOptions}
                        onChange={(value) => setSelectedProductType(value)}
                      />
                    </Form.Item>

                    {/* Basic Information - Soddalashtirilgan */}
                    <Divider orientation="left">Asosiy ma'lumotlar (majburiy)</Divider>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label="Nomi (uz)"
              name="name_uz"
              rules={[{ required: true, message: 'Iltimos, mahsulot nomini kiriting' }]}
            >
              <Input placeholder="Masalan, Oticon More 1" />
            </Form.Item>
            <Form.Item
              label="Nomi (ru)"
              name="name_ru"
              rules={[{ required: true, message: 'Iltimos, mahsulot nomini kiriting' }]}
            >
              <Input placeholder="Например, Oticon More 1" />
            </Form.Item>
          </div>
          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Slug maydoni majburiy' }]}
            extra="URL uchun qisqa nom (avtomatik yaratiladi)"
          >
            <Input placeholder="oticon-more-1" />
          </Form.Item>

          {/* Classification */}
          <Divider orientation="left">Tasniflash</Divider>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item label="Brend" name="brandId" rules={[{ required: true, message: 'Brendni tanlang' }]}>
              <Select
                allowClear
                placeholder="Brendni tanlang"
                options={brandOptions}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item label="Kategoriya" name="categoryId">
              <Select
                allowClear
                placeholder="Kategoriyani tanlang (ixtiyoriy)"
                options={categoryOptions}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </div>
          <Form.Item 
            label="Kataloglar" 
            name="catalogIds"
            extra="Mahsulot bir nechta katalogda bo'lishi mumkin"
          >
            <Select
              mode="multiple"
              allowClear
              placeholder={isLoadingCatalogs ? "Yuklanmoqda..." : catalogOptions.length === 0 ? "Katalog mavjud emas" : "Kataloglarni tanlang"}
              options={catalogOptions}
              showSearch
              optionFilterProp="label"
              loading={isLoadingCatalogs}
              notFoundContent={isLoadingCatalogs ? "Yuklanmoqda..." : "Katalog topilmadi"}
            />
          </Form.Item>

          {/* Essential Fields - Only show for hearing-aids */}
          {selectedProductType === 'hearing-aids' && (
            <>
              <Divider orientation="left">Asosiy xususiyatlar</Divider>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item 
                  label="Korpus turi" 
                  name="formFactors"
                  rules={[{ required: true, message: 'Korpus turini tanlang' }]}
                >
                  <Select
                    placeholder="BTE, RIC, ITE..."
                    options={formFactorOptions}
                    showSearch
                  />
                </Form.Item>
                <Form.Item label="Narx (so'm)" name="price">
                  <InputNumber 
                    style={{ width: '100%' }} 
                    placeholder="Masalan, 15000000" 
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item 
                  label="Kimlar uchun" 
                  name="audience"
                >
                  <Select
                    mode="multiple"
                    options={audienceOptions}
                    placeholder="Bolalar, Kattalar, Keksalar"
                  />
                </Form.Item>
                <Form.Item 
                  label="Mavjudlik" 
                  name="availabilityStatus"
                >
                  <Select
                    allowClear
                    placeholder="Holatni tanlang"
                    options={availabilityOptions}
                  />
                </Form.Item>
              </div>
            </>
          )}

          {/* Simplified fields for accessories and interacoustics */}
          {(selectedProductType === 'accessories' || selectedProductType === 'interacoustics') && (
            <>
              <Divider orientation="left">Asosiy xususiyatlar</Divider>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item label="Narx (so'm)" name="price">
                  <InputNumber 
                    style={{ width: '100%' }} 
                    placeholder="Masalan, 15000000" 
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
                <Form.Item 
                  label="Mavjudlik" 
                  name="availabilityStatus"
                >
                  <Select
                    allowClear
                    placeholder="Holatni tanlang"
                    options={availabilityOptions}
                  />
                </Form.Item>
              </div>
            </>
          )}

          {/* Status */}
          <Form.Item label="Holat" name="status" initialValue="published">
            <Select options={statusOptions} />
          </Form.Item>
                  </>
                ),
              },
              {
                key: 'advanced',
                label: "Qo'shimcha",
                children: (
                  <>
          {/* Description - Always show */}
          <Divider orientation="left">Tavsif</Divider>
          <Form.Item label="Tavsif (uz)" name="description_uz">
            <RichTextEditor placeholder="Mahsulot haqida batafsil maʼlumot" />
          </Form.Item>
          <Form.Item label="Tavsif (ru)" name="description_ru">
            <RichTextEditor placeholder="Подробное описание товара" />
          </Form.Item>

          {/* Additional Fields - Only for hearing-aids */}
          {selectedProductType === 'hearing-aids' && (
            <>
              <Divider orientation="left">Qo'shimcha xususiyatlar</Divider>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item label="Ombor soni" name="stock">
                  <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                </Form.Item>
                <Form.Item label="To'lov usullari" name="paymentOptions">
                  <Select
                    mode="multiple"
                    options={paymentOptions}
                    placeholder="To'lov usullarini tanlang"
                  />
                </Form.Item>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item 
                  label="Eshitish darajalari" 
                  name="hearingLossLevels"
                >
                  <Select
                    mode="multiple"
                    options={hearingLossOptions}
                    placeholder="Eshitish darajalarini tanlang"
                  />
                </Form.Item>
                <Form.Item 
                  label="Smartfon mosligi" 
                  name="smartphoneCompatibility"
                >
                  <Select
                    mode="multiple"
                    options={smartphoneOptions}
                    placeholder="Smartfon mosligini tanlang"
                  />
                </Form.Item>
              </div>

              {/* Technical Specifications */}
              <Divider orientation="left">Texnik xususiyatlar</Divider>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item 
                  label="Signalni qayta ishlash" 
                  name="signalProcessing"
                >
                  <Input placeholder="Masalan, Deep Neural Network 2.0" />
            </Form.Item>
            <Form.Item 
              label="Quvvat darajasi" 
              name="powerLevel"
            >
              <Input placeholder="Masalan, 105 dB" />
            </Form.Item>
          </div>
          <Form.Item label="Texnik tavsif" name="specsText">
            <Input.TextArea rows={3} placeholder="Qisqacha texnik tavsif" />
          </Form.Item>
          <Form.Item label="Tinnitus rejimi" name="tinnitusSupport" valuePropName="checked">
            <Switch /> Tinnitus (quloqda shovqin) bilan kurashish rejimi mavjud
          </Form.Item>
            </>
          )}

          {/* Gallery - Always show */}
          <Divider orientation="left">Rasmlar</Divider>
          <Form.Item label="Gallery URL (vergul bilan ajratilgan)" name="galleryUrls" extra="Rasm URLlarini vergul bilan ajrating">
            <Input.TextArea rows={2} placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" />
          </Form.Item>

          {/* Content & Marketing - Only for hearing-aids */}
          {selectedProductType === 'hearing-aids' && (
            <>
              <Divider orientation="left">Marketing kontenti (ixtiyoriy)</Divider>
              <Form.Item label="Kirish matni (uz)" name="intro_uz">
                <Input.TextArea rows={3} placeholder="Mahsulot haqida umumiy ma'lumot" />
              </Form.Item>
              <Form.Item label="Kirish matni (ru)" name="intro_ru">
                <Input.TextArea rows={3} placeholder="Общая информация о товаре" />
              </Form.Item>
              <Form.Item
                label="Afzalliklar (uz)"
                name="features_uz"
                extra="Har bir satr alohida afzallik sifatida saqlanadi"
              >
                <Input.TextArea rows={4} placeholder="Bir qatorda bitta afzallik yozing" />
              </Form.Item>
              <Form.Item
                label="Afzalliklar (ru)"
                name="features_ru"
                extra="Каждая строка будет сохранена как отдельное преимущество"
              >
                <Input.TextArea rows={4} placeholder="Пишите по одному пункту на строку" />
              </Form.Item>
              <Form.Item
                label="Acoustic afzalliklari (uz)"
                name="benefits_uz"
                extra="Har bir satr alohida element sifatida"
              >
                <Input.TextArea rows={4} placeholder="Masalan, 0% muddatli to'lov" />
              </Form.Item>
              <Form.Item
                label="Acoustic afzalliklari (ru)"
                name="benefits_ru"
                extra="Каждая строка будет отдельным пунктом"
              >
                <Input.TextArea rows={4} placeholder="Например, рассрочка 0%" />
              </Form.Item>
              <Form.Item label="Texnologiyalar (uz)" name="tech_uz">
                <RichTextEditor placeholder="Masalan, MoreSound Intelligence, DNN 2.0" />
              </Form.Item>
              <Form.Item label="Texnologiyalar (ru)" name="tech_ru">
                <RichTextEditor placeholder="Например, MoreSound Intelligence, DNN 2.0" />
              </Form.Item>
              <Form.Item label="Sozlash diapazoni (uz)" name="fittingRange_uz">
                <RichTextEditor placeholder="Masalan, Yengil – og'ir eshitish yo'qotishlari" />
              </Form.Item>
              <Form.Item label="Sozlash diapazoni (ru)" name="fittingRange_ru">
                <RichTextEditor placeholder="Например, от лёгкой до тяжёлой потери слуха" />
              </Form.Item>
              <Form.Item label="Regulyator eslatmasi (uz)" name="regulatoryNote_uz">
                <Input.TextArea rows={3} placeholder="Masalan, Tibbiy uskunalar toifasi: 2A" />
              </Form.Item>
              <Form.Item label="Regulyator eslatmasi (ru)" name="regulatoryNote_ru">
                <Input.TextArea rows={3} placeholder="Например, Класс медицинского изделия 2А" />
              </Form.Item>
            </>
          )}

          {/* Related Content - Always show */}
          <Divider orientation="left">Bog'liq kontent</Divider>
          <Form.Item
            label="Bog'liq mahsulot IDlari"
            name="relatedProductIds"
            extra="Vergul bilan ajratilgan mahsulot IDlari"
          >
            <Input placeholder="productId1, productId2" />
          </Form.Item>
          <Form.Item
            label="Foydali maqola sluglari"
            name="usefulArticleSlugs"
            extra="Vergul bilan ajratilgan maqola sluglari"
          >
            <Input placeholder="post-1, post-2" />
          </Form.Item>
                  </>
                ),
              },
            ]}
          />
        </Form>
      </Modal>
    </div>
  );
}
