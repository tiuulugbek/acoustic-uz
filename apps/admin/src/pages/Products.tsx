import { useMemo, useState, useEffect } from 'react';
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
  Switch,
  Row,
  Col,
  Divider,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FormListFieldData } from 'antd/es/form';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
  getProductCategoriesAdmin,
  getPosts,
  getCatalogs,
  type ProductDto,
  type CreateProductPayload,
  type UpdateProductPayload,
  type BrandDto,
  type ProductCategoryDto,
  type PostDto,
  type CatalogDto,
  ApiError,
} from '../lib/api';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';

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

const audienceOptions = [
  { label: 'Bolalar uchun', value: 'children' },
  { label: 'Kattalar uchun', value: 'adults' },
  { label: 'Keksalar uchun', value: 'elderly' },
];

const formFactorOptions = [
  { label: 'BTE (quloq orqasida)', value: 'bte' },
  { label: 'Mini BTE', value: 'mini-bte' },
  { label: 'ITE (quloq ichida)', value: 'ite' },
  { label: 'ITC (kanal ichida)', value: 'itc' },
  { label: 'CIC/IIC (ko‘rinmas)', value: 'cic-iic' },
  { label: 'RIC', value: 'ric' },
];

const signalProcessingOptions = [
  { label: 'Raqamli', value: 'digital' },
  { label: 'Trimmerlangan raqamli', value: 'trimmed-digital' },
];

const powerLevelOptions = [
  { label: 'Standart', value: 'standard' },
  { label: 'Kuchli', value: 'power' },
  { label: 'Superkuchli', value: 'superpower' },
];

const hearingLossOptions = [
  { label: 'I daraja (yengil)', value: 'mild' },
  { label: 'II daraja (o‘rta)', value: 'moderate' },
  { label: 'III daraja (og‘ir)', value: 'severe' },
  { label: 'IV daraja (chuqur)', value: 'profound' },
];

const smartphoneOptions = [
  { label: 'iPhone bilan mos', value: 'iphone' },
  { label: 'Android / Bluetooth', value: 'android' },
  { label: 'Masofadan boshqaruv', value: 'remote' },
];

const paymentOptionsList = [
  { label: 'Naqd / karta', value: 'cash-card' },
  { label: '0% muddatli to‘lov', value: 'installment-0' },
  { label: '6 oylik muddatli to‘lov', value: 'installment-6' },
];

const availabilityOptions = [
  { label: 'Sotuvda', value: 'in-stock' },
  { label: 'Buyurtmaga', value: 'preorder' },
  { label: 'Tugagan', value: 'out-of-stock' },
];

function ArrayField({
  fields,
  add,
  remove,
  move,
  label,
  placeholder,
  min = 0,
}: {
  fields: FormListFieldData[];
  add: () => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  label: string;
  placeholder?: string;
  min?: number;
}) {
  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <Space key={field.key} align="start" style={{ width: '100%' }}>
          <Form.Item
            {...field}
            rules={[{ required: true, message: `${label}ni kiriting` }]}
            style={{ flex: 1 }}
          >
            <Input.TextArea rows={2} placeholder={placeholder} autoSize={{ minRows: 2, maxRows: 4 }} />
          </Form.Item>
          <Space direction="vertical">
            <Button
              size="small"
              icon={<ArrowUpOutlined />}
              disabled={index === 0}
              onClick={() => move(index, index - 1)}
            />
            <Button
              size="small"
              icon={<ArrowDownOutlined />}
              disabled={index === fields.length - 1}
              onClick={() => move(index, index + 1)}
            />
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => remove(field.name)}
              disabled={fields.length <= min}
            />
          </Space>
        </Space>
      ))}
      <Button type="dashed" icon={<PlusOutlined />} onClick={() => add()}>
        {label} qo‘shish
      </Button>
    </div>
  );
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const { data: productsResponse, isLoading, error } = useQuery<{ items: ProductDto[]; total: number; page: number; pageSize: number }, ApiError>({
    queryKey: ['products-admin'],
    queryFn: async () => {
      console.log('[ProductsPage] Fetching products with limit: 1000');
      const result = await getProductsAdmin({ limit: 1000 });
      console.log('[ProductsPage] Products fetched:', {
        itemsCount: result.items?.length ?? 0,
        total: result.total,
        pageSize: result.pageSize,
      });
      return result;
    },
  });

  const products = productsResponse?.items ?? [];

  useEffect(() => {
    if (error) {
      console.error('[ProductsPage] Error fetching products:', error);
    }
    console.log('[ProductsPage] Current state:', {
      isLoading,
      hasError: !!error,
      productsCount: products.length,
      total: productsResponse?.total ?? 0,
    });
  }, [isLoading, error, products.length, productsResponse?.total]);

  const { data: brands } = useQuery<BrandDto[], ApiError>({
    queryKey: ['brands'],
    queryFn: getBrands,
  });

  const { data: categories } = useQuery<ProductCategoryDto[], ApiError>({
    queryKey: ['product-categories-admin'],
    queryFn: getProductCategoriesAdmin,
  });

  const { data: posts } = useQuery<PostDto[], ApiError>({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  const { data: catalogs, isLoading: isLoadingCatalogs } = useQuery<CatalogDto[], ApiError>({
    queryKey: ['catalogs-admin'],
    queryFn: getCatalogs,
    retry: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  const [form] = Form.useForm();

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

  const productOptions = useMemo(
    () =>
      (products ?? []).map((product) => ({
        value: product.id,
        label: `${product.name_uz} (${product.slug})`,
      })),
    [products],
  );

  const postOptions = useMemo(
    () =>
      (posts ?? []).map((post) => ({
        value: post.slug,
        label: `${post.title_uz} (${post.slug})`,
      })),
    [posts],
  );

  const openCreateModal = () => {
    setEditingProduct(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'published',
      stock: 0,
      audience: [],
      formFactors: [],
      hearingLossLevels: [],
      smartphoneCompatibility: [],
      paymentOptions: [],
      tinnitusSupport: false,
      features_uz: [],
      features_ru: [],
      benefits_uz: [],
      benefits_ru: [],
      galleryUrls: [],
      relatedProductIds: [],
      usefulArticleSlugs: [],
      catalogIds: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: ProductDto) => {
    setEditingProduct(product);
      form.setFieldsValue({
      name_uz: product.name_uz,
      name_ru: product.name_ru,
      slug: product.slug,
      productType: product.productType ?? undefined,
      description_uz: product.description_uz ?? undefined,
      description_ru: product.description_ru ?? undefined,
      price: product.price ? Number(product.price) : undefined,
      stock: product.stock ?? undefined,
      brandId: product.brandId ?? product.brand?.id ?? undefined,
      categoryId: product.categoryId ?? product.category?.id ?? undefined,
      status: product.status,
      specsText: product.specsText ?? undefined,
      galleryIds: product.galleryIds?.length ? product.galleryIds.join(', ') : undefined,
      audience: product.audience ?? [],
      formFactors: product.formFactors ?? [],
      signalProcessing: product.signalProcessing ?? undefined,
      powerLevel: product.powerLevel ?? undefined,
      hearingLossLevels: product.hearingLossLevels ?? [],
      smartphoneCompatibility: product.smartphoneCompatibility ?? [],
      tinnitusSupport: product.tinnitusSupport ?? false,
      paymentOptions: product.paymentOptions ?? [],
      availabilityStatus: product.availabilityStatus ?? undefined,
      intro_uz: product.intro_uz ?? undefined,
      intro_ru: product.intro_ru ?? undefined,
      features_uz: product.features_uz ?? [],
      features_ru: product.features_ru ?? [],
      benefits_uz: product.benefits_uz ?? [],
      benefits_ru: product.benefits_ru ?? [],
      tech_uz: product.tech_uz ?? undefined,
      tech_ru: product.tech_ru ?? undefined,
      fittingRange_uz: product.fittingRange_uz ?? undefined,
      fittingRange_ru: product.fittingRange_ru ?? undefined,
      regulatoryNote_uz: product.regulatoryNote_uz ?? undefined,
      regulatoryNote_ru: product.regulatoryNote_ru ?? undefined,
      galleryUrls: product.galleryUrls ?? [],
      relatedProductIds: product.relatedProductIds ?? [],
      usefulArticleSlugs: product.usefulArticleSlugs ?? [],
      catalogIds: product.catalogs?.map(c => c.id) ?? [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (product: ProductDto) => {
    await deleteMutation(product.id);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const galleryIds = values.galleryIds
        ? String(values.galleryIds)
            .split(',')
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0)
        : undefined;

      const payload: CreateProductPayload = {
        name_uz: values.name_uz,
        name_ru: values.name_ru,
        slug: values.slug,
        productType: values.productType || undefined,
        description_uz: values.description_uz || undefined,
        description_ru: values.description_ru || undefined,
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
        catalogIds: values.catalogIds || [],
        status: values.status,
        specsText: values.specsText || undefined,
        galleryIds,
        galleryUrls: (values.galleryUrls || []).filter((value: string) => value && value.trim().length > 0),
        audience: values.audience || [],
        formFactors: values.formFactors || [],
        signalProcessing: values.signalProcessing || undefined,
        powerLevel: values.powerLevel || undefined,
        hearingLossLevels: values.hearingLossLevels || [],
        smartphoneCompatibility: values.smartphoneCompatibility || [],
        tinnitusSupport:
          typeof values.tinnitusSupport === 'boolean' ? values.tinnitusSupport : undefined,
        paymentOptions: values.paymentOptions || [],
        availabilityStatus: values.availabilityStatus || undefined,
        intro_uz: values.intro_uz || undefined,
        intro_ru: values.intro_ru || undefined,
        features_uz: values.features_uz || [],
        features_ru: values.features_ru || [],
        benefits_uz: values.benefits_uz || [],
        benefits_ru: values.benefits_ru || [],
        tech_uz: values.tech_uz || undefined,
        tech_ru: values.tech_ru || undefined,
        fittingRange_uz: values.fittingRange_uz || undefined,
        fittingRange_ru: values.fittingRange_ru || undefined,
        regulatoryNote_uz: values.regulatoryNote_uz || undefined,
        regulatoryNote_ru: values.regulatoryNote_ru || undefined,
        relatedProductIds: values.relatedProductIds || [],
        usefulArticleSlugs: values.usefulArticleSlugs || [],
      };

      if (editingProduct) {
        await updateMutation({ id: editingProduct.id, payload });
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
            {record.name_ru ? <div style={{ fontSize: 12, color: '#6b7280' }}>{record.name_ru}</div> : null}
          </div>
        ),
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
        title: 'Holati',
        dataIndex: 'availabilityStatus',
        key: 'availabilityStatus',
        render: (value: string | undefined) => {
          if (!value) return '—';
          const map: Record<string, { label: string; color: string }> = {
            'in-stock': { label: 'Sotuvda', color: 'green' },
            preorder: { label: 'Buyurtmaga', color: 'orange' },
            'out-of-stock': { label: 'Tugagan', color: 'red' },
          };
          const info = map[value] ?? { label: value, color: 'default' };
          return <Tag color={info.color}>{info.label}</Tag>;
        },
      },
      {
        title: 'To‘lov shartlari',
        dataIndex: 'paymentOptions',
        key: 'paymentOptions',
        render: (options: string[]) =>
          options?.length ? options.map((option) => <Tag key={option}>{option}</Tag>) : '—',
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

  const brandOptions = (brands ?? []).map((brand) => ({ value: brand.id, label: brand.name }));
  const categoryOptions = (categories ?? []).map((category) => ({ value: category.id, label: category.name_uz }));
  const catalogOptions = (catalogs ?? []).map((catalog) => ({ value: catalog.id, label: `${catalog.name_uz}${catalog.name_ru ? ` (${catalog.name_ru})` : ''}` }));

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreateModal}>
          Yangi mahsulot
        </Button>
      </Space>

      <Table
        loading={isLoading}
        dataSource={products ?? []}
        columns={columns}
        rowKey="id"
        pagination={{ 
          pageSize: 100, 
          showSizeChanger: true,
          showTotal: (total) => `Jami ${total} ta mahsulot`,
          pageSizeOptions: ['10', '25', '50', '100', '200']
        }}
      />

      <Modal
        title={editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={isCreating || isUpdating}
        width={960}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nomi (uz)"
                name="name_uz"
                rules={[{ required: true, message: 'Iltimos, mahsulot nomini kiriting' }]}
              >
                <Input 
                  placeholder="Masalan, Oticon More 1"
                  onChange={(e) => {
                    const name = e.target.value;
                    const currentSlug = form.getFieldValue('slug');
                    if (!currentSlug || currentSlug === createSlug(form.getFieldValue('name_uz') || '')) {
                      form.setFieldsValue({ slug: createSlug(name) });
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Nomi (ru)"
                name="name_ru"
                rules={[{ required: true, message: 'Iltimos, rus tilidagi nomni kiriting' }]}
              >
                <Input placeholder="Например, Oticon More 1" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Slug maydoni majburiy' }]}
            extra="URL uchun qisqa nom (avtomatik yaratiladi yoki qo'lda kiriting)"
          >
            <Input placeholder="Avtomatik yaratiladi..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Narx" name="price">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Masalan, 1450000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Soni" name="stock">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Mahsulot turi" name="productType">
                <Select
                  allowClear
                  placeholder="Mahsulot turini tanlang"
                  options={productTypeOptions}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Brend" name="brandId">
                <Select
                  allowClear
                  placeholder="Brendni tanlang"
                  options={brandOptions}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Kategoriya" name="categoryId">
                <Select
                  allowClear
                  placeholder="Kategoriyani tanlang"
                  options={categoryOptions}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Holat" name="status">
                <Select options={statusOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            label="Kataloglar" 
            name="catalogIds"
            help="Mahsulotni bir yoki bir nechta kataloglarga biriktirish"
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Kimlar uchun" name="audience">
                <Select mode="multiple" options={audienceOptions} placeholder="Bo‘limni tanlang" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Korpus turi" name="formFactors">
                <Select mode="multiple" options={formFactorOptions} placeholder="Bir yoki bir nechta" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Signalni qayta ishlash" name="signalProcessing">
                <Select allowClear options={signalProcessingOptions} placeholder="Tanlang" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Quvvat" name="powerLevel">
                <Select allowClear options={powerLevelOptions} placeholder="Tanlang" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Eshitish darajalari" name="hearingLossLevels">
                <Select mode="multiple" options={hearingLossOptions} placeholder="Bir yoki bir nechta" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Smartfon bilan moslik" name="smartphoneCompatibility">
                <Select mode="multiple" options={smartphoneOptions} placeholder="Tanlang" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="middle">
            <Col span={12}>
              <Form.Item label="Tinnitus boshqaruvi" name="tinnitusSupport" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="To‘lov shartlari" name="paymentOptions">
                <Select mode="multiple" options={paymentOptionsList} placeholder="Shartlarni tanlang" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mavjudlik" name="availabilityStatus">
            <Select allowClear options={availabilityOptions} placeholder="Holatni tanlang" />
          </Form.Item>

          <Divider orientation="left">Mahsulot matni</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Qisqa kirish (uz)" name="intro_uz">
                <Input.TextArea rows={3} placeholder="Mahsulot haqida kirish matni" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Qisqa kirish (ru)" name="intro_ru">
                <Input.TextArea rows={3} placeholder="Вступительный текст о товаре" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Mahsulot tavsifi (uz)" name="description_uz">
                <Input.TextArea rows={4} placeholder="Uzbekcha tavsif" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Mahsulot tavsifi (ru)" name="description_ru">
                <Input.TextArea rows={4} placeholder="Описание на русском" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.List name="features_uz">
                {(fields, { add, remove, move }) => (
                  <Form.Item label="Afzalliklar (uz)">
                    <ArrayField
                      fields={fields}
                      add={add}
                      remove={remove}
                      move={move}
                      label="Afzallik"
                      placeholder="Afzallik tavsifi"
                    />
                  </Form.Item>
                )}
              </Form.List>
            </Col>
            <Col span={12}>
              <Form.List name="features_ru">
                {(fields, { add, remove, move }) => (
                  <Form.Item label="Afzalliklar (ru)">
                    <ArrayField
                      fields={fields}
                      add={add}
                      remove={remove}
                      move={move}
                      label="Преимущество"
                      placeholder="Описание преимущества"
                    />
                  </Form.Item>
                )}
              </Form.List>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.List name="benefits_uz">
                {(fields, { add, remove, move }) => (
                  <Form.Item label="Acoustic afzalliklari (uz)">
                    <ArrayField
                      fields={fields}
                      add={add}
                      remove={remove}
                      move={move}
                      label="Afzallik"
                      placeholder="Acoustic markazidagi afzallik"
                    />
                  </Form.Item>
                )}
              </Form.List>
            </Col>
            <Col span={12}>
              <Form.List name="benefits_ru">
                {(fields, { add, remove, move }) => (
                  <Form.Item label="Преимущества Acoustic (ru)">
                    <ArrayField
                      fields={fields}
                      add={add}
                      remove={remove}
                      move={move}
                      label="Преимущество"
                      placeholder="Преимущество центра"
                    />
                  </Form.Item>
                )}
              </Form.List>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Texnologiyalar (uz)" name="tech_uz">
                <Input.TextArea rows={4} placeholder="Mahsulot texnologiyalari" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Texnologiyalar (ru)" name="tech_ru">
                <Input.TextArea rows={4} placeholder="Технологии устройства" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Sozlash diapazoni (uz)" name="fittingRange_uz">
                <Input.TextArea rows={3} placeholder="Sozlash va moslash haqida" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Диапазон настройки (ru)" name="fittingRange_ru">
                <Input.TextArea rows={3} placeholder="Диапазон настройки" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Regulyator maʼlumoti (uz)" name="regulatoryNote_uz">
                <Input.TextArea rows={2} placeholder="Masalan, tibbiy ro‘yxatdan o‘tganligi" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Регуляторная пометка (ru)" name="regulatoryNote_ru">
                <Input.TextArea rows={2} placeholder="Регуляторная информация" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Media va bog‘liqlik</Divider>

          <Form.List name="galleryUrls">
            {(fields, { add, remove, move }) => (
              <Form.Item label="Galereya URL manzillari">
                <ArrayField
                  fields={fields}
                  add={add}
                  remove={remove}
                  move={move}
                  label="URL"
                  placeholder="https://..."
                />
              </Form.Item>
            )}
          </Form.List>

          <Form.Item
            label="Bog‘liq mahsulotlar"
            name="relatedProductIds"
            extra="Mahsulot sahifasida tavsiya qilinadigan boshqa mahsulotlar"
          >
            <Select
              mode="multiple"
              placeholder="Mahsulotlarni tanlang"
              options={productOptions.filter((option) => option.value !== editingProduct?.id)}
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            label="Foydali maqolalar"
            name="usefulArticleSlugs"
            extra="Mahsulot sahifasida ko‘rsatiladigan blog maqolalari"
          >
            <Select
              mode="multiple"
              placeholder="Maqolalarni tanlang"
              options={postOptions}
              optionFilterProp="label"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
