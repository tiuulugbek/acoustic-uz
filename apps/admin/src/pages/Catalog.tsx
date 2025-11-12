import { useMemo, useState } from 'react';
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
} from 'antd';
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
  ApiError,
} from '../lib/api';
import RichTextEditor from '../components/RichTextEditor';

const statusOptions = [
  { label: 'Nashr etilgan', value: 'published' },
  { label: 'Qoralama', value: 'draft' },
  { label: 'Arxiv', value: 'archived' },
];

export default function CatalogPage() {
  return (
    <Tabs
      defaultActiveKey="categories"
      items={[
        {
          key: 'categories',
          label: 'Kategoriyalar',
          children: <CategoryManager />,
        },
        {
          key: 'products',
          label: 'Mahsulotlar',
          children: <ProductManager />,
        },
      ]}
    />
  );
}

function CategoryManager() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<ProductCategoryDto[], ApiError>({
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

function ProductManager() {
  const queryClient = useQueryClient();

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

  const { data: products, isLoading } = useQuery<ProductDto[], ApiError>({
    queryKey: ['products-admin'],
    queryFn: getProductsAdmin,
  });

  const { data: categories } = useQuery<ProductCategoryDto[], ApiError>({
    queryKey: ['product-categories-admin'],
    queryFn: getProductCategoriesAdmin,
  });

  const { data: brands } = useQuery<BrandDto[], ApiError>({
    queryKey: ['brands'],
    queryFn: getBrands,
  });

  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductDto | null>(null);

  const { mutateAsync: createMutation, isPending: isCreating } = useMutation<ProductDto, ApiError, CreateProductPayload>({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-admin'] });
      message.success('Mahsulot saqlandi');
    },
    onError: (error) => message.error(error.message || 'Saqlashda xatolik'),
  });

  const { mutateAsync: updateMutation, isPending: isUpdating } = useMutation<
    ProductDto,
    ApiError,
    { id: string; payload: UpdateProductPayload }
  >({
    mutationFn: ({ id, payload }) => updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-admin'] });
      message.success('Mahsulot yangilandi');
    },
    onError: (error) => message.error(error.message || 'Yangilashda xatolik'),
  });

  const { mutateAsync: deleteMutation, isPending: isDeleting } = useMutation<void, ApiError, string>({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-admin'] });
      message.success('Mahsulot o‘chirildi');
    },
    onError: (error) => message.error(error.message || "O'chirishda xatolik"),
  });

  const openCreateModal = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'published',
      stock: 0,
      audience: [],
      formFactors: [],
      smartphoneCompatibility: [],
      hearingLossLevels: [],
      paymentOptions: [],
      tinnitusSupport: false,
      availabilityStatus: 'in-stock',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: ProductDto) => {
    setEditing(product);
    form.setFieldsValue({
      name_uz: product.name_uz,
      name_ru: product.name_ru,
      slug: product.slug,
      description_uz: product.description_uz,
      description_ru: product.description_ru,
      price: product.price ? Number(product.price) : undefined,
      stock: product.stock ?? undefined,
      brandId: product.brandId ?? product.brand?.id ?? undefined,
      categoryId: product.categoryId ?? product.category?.id ?? undefined,
      status: product.status,
      specsText: product.specsText ?? undefined,
      galleryIds: product.galleryIds?.length ? product.galleryIds.join(', ') : undefined,
      galleryUrls: product.galleryUrls?.length ? product.galleryUrls.join(', ') : undefined,
      audience: product.audience ?? [],
      formFactors: product.formFactors ?? [],
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
    await deleteMutation(product.id);
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
        brandId: values.brandId || undefined,
        categoryId: values.categoryId || undefined,
        status: values.status,
        specsText: values.specsText || undefined,
        galleryIds,
        galleryUrls,
        audience: values.audience ?? [],
        formFactors: values.formFactors ?? [],
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
    } catch (error) {
      // validation handled by antd
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
        description="Media kutubxonasi tayyor bo‘lgunga qadar rasmlar uchun IDlarni qo‘lda kiriting. 'Gallery ID' maydoniga vergul bilan ajratilgan ro‘yxat kiritsangiz, frontend ular asosida tasvirlarni yuklaydi."
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
        width={760}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form layout="vertical" form={form}>
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
          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Slug maydoni majburiy' }]}
            extra="URL uchun qisqa nom"
          >
            <Input placeholder="oticon-more-1" />
          </Form.Item>
          <Form.Item label="Tavsif (uz)" name="description_uz">
            <RichTextEditor placeholder="Mahsulot haqida maʼlumot" />
          </Form.Item>
          <Form.Item label="Tavsif (ru)" name="description_ru">
            <RichTextEditor placeholder="Описание товара" />
          </Form.Item>
          <Form.Item label="Narx" name="price">
            <Input placeholder="Masalan, 1450000" />
          </Form.Item>
          <Form.Item label="Soni" name="stock">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item label="Brend" name="brandId">
            <Select
              allowClear
              placeholder="Brendni tanlang"
              options={brandOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item label="Kategoriya" name="categoryId">
            <Select
              allowClear
              placeholder="Kategoriyani tanlang"
              options={categoryOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item label="Holat" name="status" initialValue="published">
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item label="Texnik tavsif (matn)" name="specsText" extra="Qisqacha texnik tavsif yoki parametrlari">
            <Input.TextArea rows={4} placeholder="Masalan, Litiy-ion akkumulyator, Bluetooth 5.0" />
          </Form.Item>
          <Form.Item label="Gallery ID (vergul bilan)" name="galleryIds">
            <Input placeholder="mediaId1, mediaId2" />
          </Form.Item>
          <Form.Item label="Gallery URL (vergul bilan)" name="galleryUrls">
            <Input placeholder="https://..., https://..." />
          </Form.Item>

          <Divider>Segment va moslik</Divider>
          <Form.Item label="Kimlar uchun" name="audience">
            <Select
              mode="multiple"
              options={audienceOptions}
              placeholder="Maqsadli auditoriyani tanlang"
            />
          </Form.Item>
          <Form.Item label="Korpus turi" name="formFactors">
            <Select
              mode="multiple"
              options={formFactorOptions}
              placeholder="Form-faktorlarni tanlang"
            />
          </Form.Item>
          <Form.Item label="Eshitish darajalari" name="hearingLossLevels">
            <Select
              mode="multiple"
              options={hearingLossOptions}
              placeholder="Mos keladigan eshitish darajalarini tanlang"
            />
          </Form.Item>
          <Form.Item label="Smartfon mosligi" name="smartphoneCompatibility">
            <Select
              mode="multiple"
              options={smartphoneOptions}
              placeholder="Smartfon mosligini tanlang"
            />
          </Form.Item>
          <Form.Item label="To‘lov usullari" name="paymentOptions">
            <Select
              mode="multiple"
              options={paymentOptions}
              placeholder="To‘lov usullarini tanlang"
            />
          </Form.Item>
          <Form.Item label="Signalni qayta ishlash" name="signalProcessing">
            <Input placeholder="Masalan, Deep Neural Network 2.0" />
          </Form.Item>
          <Form.Item label="Quvvat darajasi" name="powerLevel">
            <Input placeholder="Masalan, 105 dB / Super Power" />
          </Form.Item>
          <Form.Item label="Tinnitus rejimi" name="tinnitusSupport" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="Mavjudlik holati" name="availabilityStatus">
            <Select
              allowClear
              placeholder="Holatni tanlang"
              options={availabilityOptions}
            />
          </Form.Item>

          <Divider>Kontent va texnik ma’lumot</Divider>
          <Form.Item label="Kirish matni (uz)" name="intro_uz">
            <Input.TextArea rows={3} placeholder="Mahsulot haqida umumiy ma’lumot" />
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
            <Input.TextArea rows={4} placeholder="Masalan, 0% muddatli to‘lov" />
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
            <RichTextEditor placeholder="Masalan, Yengil – og‘ir eshitish yo‘qotishlari" />
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

          <Divider>Qo‘shimcha havolalar</Divider>
          <Form.Item
            label="Bog‘liq mahsulot IDlari"
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
        </Form>
      </Modal>
    </div>
  );
}
