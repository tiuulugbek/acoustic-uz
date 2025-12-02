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
  DatePicker,
  Popconfirm,
  message,
  Tabs,
  Upload,
  Image,
  Radio,
  InputNumber,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TabsProps } from 'antd';
import { UploadOutlined, FolderOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  PostDto,
  CreatePostPayload,
  UpdatePostPayload,
  getMedia,
  uploadMedia,
  MediaDto,
  getPostCategories,
  PostCategoryDto,
  createPostCategory,
  updatePostCategory,
  deletePostCategory,
  getDoctors,
  DoctorDto,
} from '../lib/api';
import { createSlug } from '../utils/slug';
import ImageSizeHint from '../components/ImageSizeHint';
import { normalizeImageUrl } from '../utils/image';
import { compressImage } from '../utils/image-compression';
import { ApiError } from '../lib/api';
import RichTextEditor from '../components/RichTextEditor';
import MediaLibraryModal from '../components/MediaLibraryModal';

const statusOptions = [
  { label: 'Nashr etilgan', value: 'published' },
  { label: 'Qoralama', value: 'draft' },
  { label: 'Arxiv', value: 'archived' },
];

const postTypeOptions = [
  { label: 'Maqola', value: 'article' },
  { label: 'Yangilik', value: 'news' },
];

function formatDate(date?: string) {
  if (!date) return '-';
  return dayjs(date).format('DD.MM.YYYY');
}

// Posts Tab Component
function PostsTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<PostDto[], ApiError>({
    queryKey: ['posts'],
    queryFn: getPosts,
    retry: false,
  });

  const { data: mediaList } = useQuery<MediaDto[], ApiError>({
    queryKey: ['media'],
    queryFn: getMedia,
    retry: false,
  });

  const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = useQuery<PostCategoryDto[], ApiError>({
    queryKey: ['post-categories'],
    queryFn: async () => {
      try {
        console.log('Fetching categories from API...');
        const result = await getPostCategories();
        console.log('Categories fetched successfully:', result);
        if (!result || !Array.isArray(result)) {
          console.warn('Categories result is not an array:', result);
          return [];
        }
        return result;
      } catch (error) {
        console.error('Error fetching categories:', error);
        const apiError = error as ApiError;
        console.error('API Error details:', {
          message: apiError.message,
          status: apiError.status,
        });
        // Don't return empty array - let React Query handle the error
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000, // Cache for 30 seconds
  });

  const { data: doctors, isLoading: isLoadingDoctors } = useQuery<DoctorDto[], ApiError>({
    queryKey: ['doctors'],
    queryFn: async () => {
      try {
        const result = await getDoctors();
        return result || [];
      } catch (error) {
        console.error('Error fetching doctors:', error);
        return [];
      }
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
  });

  const doctorOptions = useMemo(() => {
    if (isLoadingDoctors) return [];
    if (!doctors || doctors.length === 0) return [];
    
    return doctors
      .filter(doctor => doctor.status === 'published')
      .sort((a, b) => a.order - b.order)
      .map(doctor => ({
        label: `${doctor.name_uz}${doctor.name_ru ? ` (${doctor.name_ru})` : ''}`,
        value: doctor.id,
      }));
  }, [doctors, isLoadingDoctors]);

  const categoryOptions = useMemo(() => {
    if (isLoadingCategories) {
      console.log('Categories are loading...');
      return [];
    }
    
    if (categoriesError) {
      console.error('Categories error:', categoriesError);
      // Don't show error message here - React Query will handle it
      return [];
    }
    
    if (!categories || categories.length === 0) {
      console.warn('No categories found in database');
      return [];
    }
    
    // Show all categories (not just published) for admin panel
    const options = categories
      .sort((a, b) => a.order - b.order) // Sort by order
      .map(cat => ({
        label: `${cat.name_uz}${cat.name_ru ? ` (${cat.name_ru})` : ''}${cat.status !== 'published' ? ' [Qoralama]' : ''}`,
        value: cat.id,
      }));
    
    console.log('Category options created:', options);
    return options;
  }, [categories, categoriesError, isLoadingCategories]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostDto | null>(null);
  const [form] = Form.useForm();
  const [postType, setPostType] = useState<'article' | 'news'>('article');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverModalOpen, setCoverModalOpen] = useState(false);

  // Helper function to normalize image URLs

  const { mutateAsync: createPostMutation, isPending: isCreating } = useMutation<PostDto, ApiError, CreatePostPayload>({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      message.success('Maqola saqlandi');
    },
    onError: (error) => message.error(error.message || 'Saqlashda xatolik'),
  });

  const { mutateAsync: updatePostMutation, isPending: isUpdating } = useMutation<PostDto, ApiError, { id: string; payload: UpdatePostPayload }>({
    mutationFn: ({ id, payload }) => updatePost(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      message.success('Maqola yangilandi');
    },
    onError: (error) => message.error(error.message || 'Yangilashda xatolik'),
  });

  const { mutateAsync: deletePostMutation, isPending: isDeleting } = useMutation<void, ApiError, string>({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      message.success('Maqola o‘chirildi');
    },
    onError: (error) => message.error(error.message || "O'chirishda xatolik"),
  });

  const openCreateModal = () => {
    setEditingPost(null);
    setPostType('article');
    setCoverPreview(null);
    form.resetFields();
    form.setFieldsValue({
      postType: 'article',
      status: 'draft',
      publishAt: dayjs(),
      categoryId: undefined, // Reset category
      authorId: undefined, // Reset author
    });
    setIsModalOpen(true);
  };

  const openEditModal = (post: PostDto) => {
    setEditingPost(post);
    const postTypeValue = (post as any).postType || 'article';
    setPostType(postTypeValue);
    setCoverPreview(post.cover?.url ? normalizeImageUrl(post.cover.url) : null);
    
    // Get categoryId from post.category if available, otherwise from post.categoryId
    const categoryId = post.category?.id || post.categoryId || null;
    console.log('Editing post category:', { categoryId, category: post.category, categoryIdField: post.categoryId });
    
    form.setFieldsValue({
      title_uz: post.title_uz,
      title_ru: post.title_ru,
      body_uz: post.body_uz,
      body_ru: post.body_ru,
      slug: post.slug,
      postType: postTypeValue,
      categoryId: categoryId,
      authorId: post.author?.id || post.authorId || null,
      excerpt_uz: post.excerpt_uz,
      excerpt_ru: post.excerpt_ru,
      coverId: post.cover?.id,
      status: post.status,
      publishAt: post.publishAt ? dayjs(post.publishAt) : undefined,
      tags: post.tags.join(', '),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (post: PostDto) => {
    await deletePostMutation(post.id);
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    try {
      // Rasmni yuklashdan oldin siqish
      const compressedFile = await compressImage(file);
      const media = await uploadMedia(compressedFile);
      form.setFieldsValue({ coverId: media.id });
      setCoverPreview(normalizeImageUrl(media.url));
      message.success('Rasm yuklandi');
    } catch (error) {
      message.error('Rasm yuklashda xatolik');
    } finally {
      setUploadingCover(false);
    }
    return false; // Prevent default upload
  };

  const handleSelectCoverFromMedia = (media: MediaDto) => {
    form.setFieldsValue({ coverId: media.id });
    setCoverPreview(normalizeImageUrl(media.url));
    setCoverModalOpen(false);
    message.success('Rasm tanlandi');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreatePostPayload = {
        title_uz: values.title_uz,
        title_ru: values.title_ru,
        body_uz: values.body_uz,
        body_ru: values.body_ru,
        slug: values.slug,
        postType: values.postType || 'article',
        categoryId: values.categoryId || null,
        authorId: values.authorId || null,
        excerpt_uz: values.excerpt_uz,
        excerpt_ru: values.excerpt_ru,
        coverId: values.coverId || null,
        status: values.status,
        publishAt: (values.publishAt || dayjs()).toISOString(),
        tags: values.tags
          ? values.tags
              .split(',')
              .map((tag: string) => tag.trim())
              .filter(Boolean)
          : [],
      };

      if (editingPost) {
        await updatePostMutation({ id: editingPost.id, payload });
      } else {
        await createPostMutation(payload);
      }

      setIsModalOpen(false);
      form.resetFields();
      setCoverPreview(null);
    } catch (error) {
      // validation error handled by antd
    }
  };

  const columns: ColumnsType<PostDto> = useMemo(
    () => [
      {
        title: 'Turi',
        dataIndex: 'postType',
        key: 'postType',
        width: 120,
        render: (value: string) => {
          const type = value || 'article';
          return (
            <Tag 
              color={type === 'news' ? 'blue' : 'green'} 
              style={{ fontWeight: 'bold' }}
            >
              {type === 'news' ? '📰 Yangilik' : '📄 Maqola'}
            </Tag>
          );
        },
      },
      {
        title: 'Sarlavha (UZ)',
        dataIndex: 'title_uz',
        key: 'title_uz',
        render: (value) => <strong>{value}</strong>,
      },
      {
        title: 'Kategoriya',
        dataIndex: 'category',
        key: 'category',
        render: (value: any, record: PostDto) => {
          const categoryId = (record as any).categoryId;
          if (!categoryId) return <Tag>Umumiy</Tag>;
          const category = categories?.find(c => c.id === categoryId);
          return <Tag color="blue">{category?.name_uz || 'Noma\'lum'}</Tag>;
        },
      },
      {
        title: 'Holati',
        dataIndex: 'status',
        key: 'status',
        render: (value: PostDto['status']) => {
          const color =
            value === 'published' ? 'green' : value === 'draft' ? 'orange' : 'default';
          return <Tag color={color}>{value}</Tag>;
        },
      },
      {
        title: 'Nashr sana',
        dataIndex: 'publishAt',
        key: 'publishAt',
        render: (value: string) => formatDate(value),
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
              title="Maqolani o'chirish"
              description="Haqiqatan ham o'chirilsinmi?"
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
    [isDeleting, categories],
  );

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreateModal}>
          Yangi maqola/yangilik
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
        title={editingPost ? 'Maqolani tahrirlash' : 'Yangi maqola/yangilik'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setCoverPreview(null);
        }}
        onOk={handleSubmit}
        confirmLoading={isCreating || isUpdating}
        width={900}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Turi"
            name="postType"
            rules={[{ required: true }]}
          >
            <Radio.Group
              options={postTypeOptions}
              onChange={(e) => setPostType(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="Sarlavha (uz)"
            name="title_uz"
            rules={[{ required: true, message: 'Iltimos sarlavha kiriting' }]}
          >
            <Input 
              placeholder="Masalan, Bepul maslahat"
              onChange={(e) => {
                const title = e.target.value;
                const currentSlug = form.getFieldValue('slug');
                if (!currentSlug || currentSlug === createSlug(form.getFieldValue('title_uz') || '')) {
                  form.setFieldsValue({ slug: createSlug(title) });
                }
              }}
            />
          </Form.Item>
          <Form.Item
            label="Sarlavha (ru)"
            name="title_ru"
            rules={[{ required: true, message: 'Пожалуйста, введите заголовок' }]}
          >
            <Input placeholder="Например, Бесплатная консультация" />
          </Form.Item>

          <Form.Item
            label="Thumbnail rasm"
            name="coverId"
          >
            <ImageSizeHint type="post" showAsAlert={false} />
            <Space direction="vertical" style={{ width: '100%' }}>
              {coverPreview && (
                <Image
                  src={normalizeImageUrl(coverPreview)}
                  alt="Cover preview"
                  style={{ maxWidth: 200, maxHeight: 200, objectFit: 'cover' }}
                  preview={false}
                />
              )}
              <Space>
                <Upload
                  beforeUpload={handleCoverUpload}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />} loading={uploadingCover}>
                    Rasm yuklash
                  </Button>
                </Upload>
                <Button 
                  icon={<FolderOutlined />} 
                  onClick={() => setCoverModalOpen(true)}
                >
                  Mavjud rasmdan tanlash
                </Button>
              </Space>
              {form.getFieldValue('coverId') && (
                <div style={{ fontSize: 12, color: '#666' }}>
                  Tanlangan: {mediaList?.find(m => m.id === form.getFieldValue('coverId'))?.filename || 'Noma\'lum'}
                </div>
              )}
            </Space>
          </Form.Item>

          {postType === 'article' && (
            <Form.Item 
              label="Kategoriya" 
              name="categoryId"
              help={
                isLoadingCategories 
                  ? 'Kategoriyalar yuklanmoqda...' 
                  : categoriesError 
                    ? `Xatolik: ${categoriesError.message || 'Kategoriyalarni yuklashda xatolik'}` 
                    : categoryOptions.length === 0 
                      ? 'Kategoriyalar mavjud emas. "Kategoriyalar" tabida yangi kategoriya yarating.' 
                      : undefined
              }
              validateStatus={categoriesError ? 'error' : undefined}
            >
              <Select 
                options={categoryOptions} 
                placeholder={
                  isLoadingCategories 
                    ? "Yuklanmoqda..." 
                    : categoriesError
                      ? "Xatolik yuz berdi"
                      : categoryOptions.length === 0 
                        ? "Kategoriyalar mavjud emas" 
                        : "Kategoriyani tanlang"
                } 
                allowClear 
                loading={isLoadingCategories}
                disabled={isLoadingCategories}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                notFoundContent={isLoadingCategories ? 'Yuklanmoqda...' : categoryOptions.length === 0 ? 'Kategoriyalar mavjud emas' : 'Kategoriya topilmadi'}
              />
            </Form.Item>
          )}

          <Form.Item 
            label="Muallif (ixtiyoriy)" 
            name="authorId"
            help="Agar maqola muallifga bog'liq bo'lsa, muallifni tanlang"
          >
            <Select 
              options={doctorOptions} 
              placeholder={
                isLoadingDoctors 
                  ? "Yuklanmoqda..." 
                  : doctorOptions.length === 0 
                    ? "Mualliflar mavjud emas" 
                    : "Muallifni tanlang (ixtiyoriy)"
              } 
              allowClear 
              loading={isLoadingDoctors}
              disabled={isLoadingDoctors}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent={isLoadingDoctors ? 'Yuklanmoqda...' : doctorOptions.length === 0 ? 'Mualliflar mavjud emas' : 'Muallif topilmadi'}
            />
          </Form.Item>

          <Form.Item
            label="Qisqa tavsif (uz)"
            name="excerpt_uz"
          >
            <Input.TextArea rows={2} placeholder="Qisqa tavsif (ixtiyoriy)" />
          </Form.Item>
          <Form.Item
            label="Qisqa tavsif (ru)"
            name="excerpt_ru"
          >
            <Input.TextArea rows={2} placeholder="Краткое описание (необязательно)" />
          </Form.Item>

          <Form.Item
            label="Matn (uz)"
            name="body_uz"
            rules={[{ required: true, message: 'Matnni kiriting' }]}
          >
            <RichTextEditor placeholder="Maqola matni" />
          </Form.Item>
          <Form.Item
            label="Matn (ru)"
            name="body_ru"
            rules={[{ required: true, message: 'Введите текст' }]}
          >
            <RichTextEditor placeholder="Текст статьи" />
          </Form.Item>
          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Slug kiriting' }]}
            extra="URL uchun qisqa nom (avtomatik yaratiladi yoki qo'lda kiriting)"
          >
            <Input placeholder="Avtomatik yaratiladi..." />
          </Form.Item>
          <Form.Item label="Teglar" name="tags">
            <Input placeholder="tag1, tag2, tag3" />
          </Form.Item>
          <Form.Item label="Holati" name="status" rules={[{ required: true }]}>
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item label="Nashr sana" name="publishAt">
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Media Library Modal for Cover Image */}
      <MediaLibraryModal
        open={coverModalOpen}
        onCancel={() => setCoverModalOpen(false)}
        onSelect={handleSelectCoverFromMedia}
        fileType="image"
        selectedMediaIds={form.getFieldValue('coverId') ? [form.getFieldValue('coverId')] : []}
      />
    </div>
  );
}

// Categories Tab Component
function CategoriesTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<PostCategoryDto[], ApiError>({
    queryKey: ['post-categories'],
    queryFn: getPostCategories,
    retry: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PostCategoryDto | null>(null);
  const [form] = Form.useForm();

  const { mutateAsync: createCategoryMutation, isPending: isCreating } = useMutation({
    mutationFn: createPostCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-categories'] });
      message.success('Kategoriya saqlandi');
    },
    onError: (error: any) => message.error(error.message || 'Saqlashda xatolik'),
  });

  const { mutateAsync: updateCategoryMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updatePostCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-categories'] });
      message.success('Kategoriya yangilandi');
    },
    onError: (error: any) => message.error(error.message || 'Yangilashda xatolik'),
  });

  const { mutateAsync: deleteCategoryMutation, isPending: isDeleting } = useMutation({
    mutationFn: deletePostCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-categories'] });
      message.success('Kategoriya o\'chirildi');
    },
    onError: (error: any) => message.error(error.message || "O'chirishda xatolik"),
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'published',
      order: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category: PostCategoryDto) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name_uz: category.name_uz,
      name_ru: category.name_ru,
      slug: category.slug,
      description_uz: category.description_uz,
      description_ru: category.description_ru,
      order: category.order,
      status: category.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (category: PostCategoryDto) => {
    await deleteCategoryMutation(category.id);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name_uz: values.name_uz,
        name_ru: values.name_ru,
        slug: values.slug || createSlug(values.name_uz),
        description_uz: values.description_uz || null,
        description_ru: values.description_ru || null,
        order: values.order || 0,
        status: values.status,
      };

      if (editingCategory) {
        await updateCategoryMutation({ id: editingCategory.id, payload });
      } else {
        await createCategoryMutation(payload);
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      // validation error handled by antd
    }
  };

  const columns: ColumnsType<PostCategoryDto> = [
    {
      title: 'Nomi (UZ)',
      dataIndex: 'name_uz',
      key: 'name_uz',
      render: (value) => <strong>{value}</strong>,
    },
    {
      title: 'Nomi (RU)',
      dataIndex: 'name_ru',
      key: 'name_ru',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Tartib',
      dataIndex: 'order',
      key: 'order',
    },
    {
      title: 'Holati',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => {
        const color = value === 'published' ? 'green' : 'orange';
        return <Tag color={color}>{value}</Tag>;
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
            title="Kategoriyani o'chirish"
            description="Haqiqatan ham o'chirilsinmi?"
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
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreateModal}>
          Yangi kategoriya
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
        title={editingCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={isCreating || isUpdating}
        width={600}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Nomi (uz)"
            name="name_uz"
            rules={[{ required: true, message: 'Iltimos nom kiriting' }]}
          >
            <Input placeholder="Masalan, Bemorlar" />
          </Form.Item>
          <Form.Item
            label="Nomi (ru)"
            name="name_ru"
            rules={[{ required: true, message: 'Пожалуйста, введите название' }]}
          >
            <Input placeholder="Например, Пациентам" />
          </Form.Item>
          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Slug kiriting' }]}
            extra="URL uchun qisqa nom (avtomatik yaratiladi)"
          >
            <Input placeholder="Avtomatik yaratiladi..." />
          </Form.Item>
          <Form.Item label="Tavsif (uz)" name="description_uz">
            <Input.TextArea rows={2} placeholder="Kategoriya tavsifi (ixtiyoriy)" />
          </Form.Item>
          <Form.Item label="Tavsif (ru)" name="description_ru">
            <Input.TextArea rows={2} placeholder="Описание категории (необязательно)" />
          </Form.Item>
          <Form.Item label="Tartib" name="order">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Holati" name="status" rules={[{ required: true }]}>
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default function PostsPage() {
  const tabItems: TabsProps['items'] = [
    {
      key: 'posts',
      label: 'Maqolalar va Yangiliklar',
      children: <PostsTab />,
    },
    {
      key: 'categories',
      label: 'Kategoriyalar',
      children: <CategoriesTab />,
    },
  ];

  return <Tabs items={tabItems} />;
}
