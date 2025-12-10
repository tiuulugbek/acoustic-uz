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
  Upload,
  Image,
  Tabs,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UploadOutlined, FolderOutlined, PlusOutlined } from '@ant-design/icons';
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
  uploadMedia,
  MediaDto,
  getPostCategories,
  PostCategoryDto,
  createPostCategory,
  updatePostCategory,
  deletePostCategory,
  CreatePostCategoryPayload,
  UpdatePostCategoryPayload,
  getDoctors,
  DoctorDto,
} from '../lib/api';
import ImageSizeHint from '../components/ImageSizeHint';
import { normalizeImageUrl } from '../utils/image';
import { compressImage } from '../utils/image-compression';
import { ApiError } from '../lib/api';
import RichTextEditor from '../components/RichTextEditor';
import MediaLibraryModal from '../components/MediaLibraryModal';
import { createSlug } from '../utils/slug';

const statusOptions = [
  { label: 'Nashr etilgan', value: 'published' },
  { label: 'Qoralama', value: 'draft' },
  { label: 'Arxiv', value: 'archived' },
];

function formatDate(date?: string) {
  if (!date) return '-';
  return dayjs(date).format('DD.MM.YYYY');
}

interface SectionPostsPageProps {
  section: 'patients' | 'children';
  sectionName: { uz: string; ru: string };
}

export default function SectionPostsPage({ section, sectionName }: SectionPostsPageProps) {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostDto | null>(null);
  const [editingCategory, setEditingCategory] = useState<PostCategoryDto | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [categoryImageModalOpen, setCategoryImageModalOpen] = useState(false);
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null);

  // Fetch categories for this section
  const { data: categories } = useQuery<PostCategoryDto[], ApiError>({
    queryKey: ['post-categories', section],
    queryFn: () => getPostCategories(section),
    retry: false,
  });

  const categoryIds = useMemo(() => categories?.map(cat => cat.id) || [], [categories]);

  // Fetch posts ONLY from categories in this section
  // Each section shows only posts that belong to its own categories
  const { data, isLoading } = useQuery<PostDto[], ApiError>({
    queryKey: ['posts', section],
    queryFn: async () => {
      const allPosts = await getPosts();
      // Filter posts: only include posts that belong to this section's categories
      return allPosts.filter(post => {
        // Only show articles
        if (post.postType !== 'article') return false;
        // Post must have a category AND belong to this section
        if (!post.categoryId) return false;
        return categoryIds.includes(post.categoryId);
      });
    },
    enabled: categoryIds.length > 0, // Only enabled if there are categories
    retry: false,
  });

  const { data: doctors } = useQuery<DoctorDto[], ApiError>({
    queryKey: ['doctors'],
    queryFn: getDoctors,
    retry: false,
  });

  const categoryOptions = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    return categories
      .filter(cat => cat.section === section)
      .map(cat => ({
        label: `${cat.name_uz}${cat.name_ru ? ` (${cat.name_ru})` : ''}`,
        value: cat.id,
      }));
  }, [categories, section]);

  const doctorOptions = useMemo(() => {
    if (!doctors || doctors.length === 0) return [];
    return doctors
      .filter(doctor => doctor.status === 'published')
      .sort((a, b) => a.order - b.order)
      .map(doctor => ({
        label: `${doctor.name_uz}${doctor.name_ru ? ` (${doctor.name_ru})` : ''}`,
        value: doctor.id,
      }));
  }, [doctors]);

  const { mutateAsync: createPostMutation, isPending: isCreating } = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', section] });
      queryClient.invalidateQueries({ queryKey: ['post-categories'] });
      message.success('Maqola saqlandi');
      setIsModalOpen(false);
      form.resetFields();
      setCoverPreview(null);
    },
    onError: (error: ApiError) => message.error(error.message || 'Saqlashda xatolik'),
  });

  const { mutateAsync: updatePostMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePostPayload }) => updatePost(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', section] });
      message.success('Maqola yangilandi');
      setIsModalOpen(false);
      form.resetFields();
      setCoverPreview(null);
    },
    onError: (error: ApiError) => message.error(error.message || 'Yangilashda xatolik'),
  });

  const { mutateAsync: deletePostMutation, isPending: isDeleting } = useMutation<void, ApiError, string>({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', section] });
      message.success('Maqola o\'chirildi');
    },
    onError: (error) => message.error(error.message || "O'chirishda xatolik"),
  });

  const { mutateAsync: createCategoryMutation, isPending: isCreatingCategory } = useMutation({
    mutationFn: createPostCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-categories', section] });
      queryClient.invalidateQueries({ queryKey: ['posts', section] });
      message.success('Kategoriya saqlandi');
      setIsCategoryModalOpen(false);
      categoryForm.resetFields();
      setCategoryImagePreview(null);
      setEditingCategory(null);
    },
    onError: (error: ApiError) => message.error(error.message || 'Kategoriya saqlashda xatolik'),
  });

  const { mutateAsync: updateCategoryMutation, isPending: isUpdatingCategory } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePostCategoryPayload }) => updatePostCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-categories', section] });
      queryClient.invalidateQueries({ queryKey: ['posts', section] });
      message.success('Kategoriya yangilandi');
      setIsCategoryModalOpen(false);
      categoryForm.resetFields();
      setCategoryImagePreview(null);
      setEditingCategory(null);
    },
    onError: (error: ApiError) => message.error(error.message || 'Kategoriyani yangilashda xatolik'),
  });

  const { mutateAsync: deleteCategoryMutation, isPending: isDeletingCategory } = useMutation<void, ApiError, string>({
    mutationFn: deletePostCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-categories', section] });
      queryClient.invalidateQueries({ queryKey: ['posts', section] });
      message.success('Kategoriya o\'chirildi');
    },
    onError: (error) => message.error(error.message || "Kategoriyani o'chirishda xatolik"),
  });

  const openCreateModal = () => {
    setEditingPost(null);
    setCoverPreview(null);
    form.resetFields();
    // Set default category to first category in this section (if available)
    const defaultCategoryId = categoryOptions.length > 0 ? categoryOptions[0].value : undefined;
    form.setFieldsValue({
      postType: 'article',
      status: 'draft',
      publishAt: dayjs(),
      categoryId: defaultCategoryId, // Set default category from this section
      authorId: undefined,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (post: PostDto) => {
    setEditingPost(post);
    setCoverPreview(post.cover?.url ? normalizeImageUrl(post.cover.url) : null);
    
    const categoryId = post.category?.id || post.categoryId || null;
    
    form.setFieldsValue({
      title_uz: post.title_uz,
      title_ru: post.title_ru,
      body_uz: post.body_uz,
      body_ru: post.body_ru,
      slug: post.slug,
      postType: 'article',
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

  const openCreateCategoryModal = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    categoryForm.setFieldsValue({
      section: section,
      status: 'published',
      order: 0,
      imageId: null,
    });
    setCategoryImagePreview(null);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category: PostCategoryDto) => {
    setEditingCategory(category);
    setCategoryImagePreview(category.image?.url ? normalizeImageUrl(category.image.url) : null);
    categoryForm.setFieldsValue({
      name_uz: category.name_uz,
      name_ru: category.name_ru,
      slug: category.slug,
      description_uz: category.description_uz || undefined,
      description_ru: category.description_ru || undefined,
      order: category.order,
      status: category.status,
      section: category.section || section,
      imageId: category.image?.id || undefined,
    });
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (category: PostCategoryDto) => {
    await deleteCategoryMutation(category.id);
  };

  const handleDelete = async (post: PostDto) => {
    await deletePostMutation(post.id);
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    try {
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
    return false;
  };

  const handleSelectCoverFromMedia = (media: MediaDto) => {
    form.setFieldsValue({ coverId: media.id });
    setCoverPreview(normalizeImageUrl(media.url));
    setCoverModalOpen(false);
    message.success('Rasm tanlandi');
  };

  const handleCategoryImageUpload = async (file: File) => {
    setUploadingCategoryImage(true);
    try {
      const compressedFile = await compressImage(file);
      const media = await uploadMedia(compressedFile);
      categoryForm.setFieldsValue({ imageId: media.id });
      setCategoryImagePreview(normalizeImageUrl(media.url));
      message.success('Rasm yuklandi');
    } catch (error) {
      message.error('Rasm yuklashda xatolik');
    } finally {
      setUploadingCategoryImage(false);
    }
    return false;
  };

  const handleSelectCategoryImageFromMedia = (media: MediaDto) => {
    categoryForm.setFieldsValue({ imageId: media.id });
    setCategoryImagePreview(normalizeImageUrl(media.url));
    setCategoryImageModalOpen(false);
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
        slug: values.slug || createSlug(values.title_uz),
        postType: 'article',
        categoryId: values.categoryId, // Category is required
        authorId: values.authorId || null,
        excerpt_uz: values.excerpt_uz,
        excerpt_ru: values.excerpt_ru,
        coverId: values.coverId || null,
        status: values.status,
        publishAt: (values.publishAt || dayjs()).toISOString(),
        tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      };

      if (editingPost) {
        await updatePostMutation({ id: editingPost.id, payload });
      } else {
        await createPostMutation(payload);
      }
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  const handleCategorySubmit = async () => {
    try {
      const values = await categoryForm.validateFields();
      const payload: CreatePostCategoryPayload = {
        name_uz: values.name_uz,
        name_ru: values.name_ru,
        slug: values.slug || createSlug(values.name_uz),
        description_uz: values.description_uz || null,
        description_ru: values.description_ru || null,
        order: values.order || 0,
        status: values.status || 'published',
        section: section,
        imageId: values.imageId || null,
      };
      if (editingCategory) {
        await updateCategoryMutation({ id: editingCategory.id, payload });
      } else {
        await createCategoryMutation(payload);
      }
    } catch (error) {
      console.error('Category form validation error:', error);
    }
  };

  const categoryColumns: ColumnsType<PostCategoryDto> = [
    {
      title: 'Nomi (uz)',
      dataIndex: 'name_uz',
      key: 'name_uz',
      render: (text: string) => <span>{text}</span>,
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
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          published: { label: 'Nashr etilgan', color: 'green' },
          draft: { label: 'Qoralama', color: 'orange' },
          archived: { label: 'Arxiv', color: 'default' },
        };
        const statusInfo = statusMap[status] || { label: status, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
    },
    {
      title: 'Rasm',
      dataIndex: 'image',
      key: 'image',
      render: (image: MediaDto) => (
        image?.url ? <Image src={normalizeImageUrl(image.url)} alt="Category" width={50} height={50} style={{ objectFit: 'cover' }} /> : '-'
      ),
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (_: any, record: PostCategoryDto) => (
        <Space>
          <Button size="small" onClick={() => openEditCategoryModal(record)}>
            Tahrirlash
          </Button>
          <Popconfirm
            title="Kategoriyani o'chirish"
            description="Ushbu kategoriyani o'chirishni xohlaysizmi? Bu unga bog'liq maqolalarni ham o'chirmaydi, faqat kategoriyani olib tashlaydi."
            onConfirm={() => handleDeleteCategory(record)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button size="small" danger loading={isDeletingCategory}>
              O'chirish
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const columns: ColumnsType<PostDto> = [
    {
      title: 'Sarlavha (uz)',
      dataIndex: 'title_uz',
      key: 'title_uz',
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: 'Kategoriya',
      dataIndex: 'category',
      key: 'category',
      render: (category: any) => {
        const categoryId = category?.id || (category as any)?.categoryId;
        if (!categoryId) return <Tag>Kategoriyasiz</Tag>;
        const cat = categories?.find(c => c.id === categoryId);
        return <Tag color="blue">{cat?.name_uz || 'Noma\'lum'}</Tag>;
      },
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          published: { label: 'Nashr etilgan', color: 'green' },
          draft: { label: 'Qoralama', color: 'orange' },
          archived: { label: 'Arxiv', color: 'default' },
        };
        const statusInfo = statusMap[status] || { label: status, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
    },
    {
      title: 'Sana',
      dataIndex: 'publishAt',
      key: 'publishAt',
      render: formatDate,
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (_: any, record: PostDto) => (
        <Space>
          <Button size="small" onClick={() => openEditModal(record)}>
            Tahrirlash
          </Button>
          <Popconfirm
            title="Maqolani o'chirish"
            description="Ushbu maqolani o'chirishni xohlaysizmi?"
            onConfirm={() => handleDelete(record)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button size="small" danger loading={isDeleting}>
              O'chirish
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'posts',
      label: 'Maqolalar',
      children: (
        <>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{sectionName.uz} bo'limi maqolalari</h2>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={openCreateModal}
              disabled={categoryOptions.length === 0}
            >
              Yangi maqola
            </Button>
          </div>
          {categoryOptions.length === 0 && (
            <div style={{ marginBottom: '16px', padding: '16px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '4px' }}>
              <p style={{ margin: 0 }}>
                <strong>Eslatma:</strong> Avval "Kategoriyalar" tabida kategoriya yarating. Maqola yaratish uchun kategoriya kerak.
              </p>
            </div>
          )}
          <Table
            columns={columns}
            dataSource={data || []}
            loading={isLoading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </>
      ),
    },
    {
      key: 'categories',
      label: 'Kategoriyalar',
      children: (
        <>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{sectionName.uz} bo'limi kategoriyalari</h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateCategoryModal}>
              Yangi kategoriya
            </Button>
          </div>
          <Table
            columns={categoryColumns}
            dataSource={categories || []}
            loading={false}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>{sectionName.uz} bo'limi</h1>
      <Tabs defaultActiveKey="posts" items={tabItems} />

      {/* Post Modal */}
      <Modal
        title={editingPost ? 'Maqolani tahrirlash' : 'Yangi maqola'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
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
            label="Kategoriya"
            name="categoryId"
            rules={[{ required: true, message: 'Iltimos kategoriyani tanlang' }]}
            extra="Maqola qaysi kategoriyaga tegishli bo'lishini tanlang"
          >
            <Select
              placeholder="Kategoriyani tanlang"
              options={categoryOptions}
              disabled={categoryOptions.length === 0}
            />
          </Form.Item>
          <Form.Item label="Muallif (ixtiyoriy)" name="authorId">
            <Select
              placeholder="Muallifni tanlang (ixtiyoriy)"
              allowClear
              options={doctorOptions}
            />
          </Form.Item>
          <Form.Item label="Qisqa tavsif (uz)" name="excerpt_uz">
            <Input.TextArea rows={2} placeholder="Qisqa tavsif (ixtiyoriy)" />
          </Form.Item>
          <Form.Item label="Qisqa tavsif (ru)" name="excerpt_ru">
            <Input.TextArea rows={2} placeholder="Краткое описание (необязательно)" />
          </Form.Item>
          <Form.Item
            label="Thumbnail rasm"
            name="coverId"
            extra="Maqola rasmi. Keng format, social media uchun mos."
          >
            <ImageSizeHint type="post" showAsAlert={false} />
            <Space direction="vertical" style={{ width: '100%' }}>
              {coverPreview && (
                <Image
                  src={coverPreview}
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
            </Space>
          </Form.Item>
          <Form.Item label="Kontent (uz)" name="body_uz" rules={[{ required: true, message: 'Iltimos kontent kiriting' }]}>
            <RichTextEditor />
          </Form.Item>
          <Form.Item label="Kontent (ru)" name="body_ru" rules={[{ required: true, message: 'Пожалуйста, введите контент' }]}>
            <RichTextEditor />
          </Form.Item>
          <Form.Item label="Slug" name="slug" extra="URL uchun qisqa nom (avtomatik yaratiladi)">
            <Input placeholder="Avtomatik yaratiladi..." />
          </Form.Item>
          <Form.Item label="Holat" name="status" initialValue="draft">
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item label="Nashr qilish sanasi" name="publishAt">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Teglar" name="tags" extra="Vergul bilan ajratilgan">
            <Input placeholder="maslahat, eshitish, quloq" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Category Modal */}
      <Modal
        title={editingCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
        open={isCategoryModalOpen}
        onCancel={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
          setCategoryImagePreview(null);
        }}
        onOk={handleCategorySubmit}
        confirmLoading={isCreatingCategory || isUpdatingCategory}
        width={600}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form layout="vertical" form={categoryForm}>
          <Form.Item
            label="Nomi (uz)"
            name="name_uz"
            rules={[{ required: true, message: 'Iltimos nom kiriting' }]}
          >
            <Input placeholder="Masalan, Eshitish maslahati" />
          </Form.Item>
          <Form.Item
            label="Nomi (ru)"
            name="name_ru"
            rules={[{ required: true, message: 'Пожалуйста, введите название' }]}
          >
            <Input placeholder="Например, Консультация по слуху" />
          </Form.Item>
          <Form.Item
            label="Slug"
            name="slug"
            extra="URL uchun qisqa nom (avtomatik yaratiladi)"
          >
            <Input placeholder="Avtomatik yaratiladi..." />
          </Form.Item>
          <Form.Item label="Tavsif (uz)" name="description_uz">
            <Input.TextArea rows={3} placeholder="Kategoriya tavsifi (ixtiyoriy)" />
          </Form.Item>
          <Form.Item label="Tavsif (ru)" name="description_ru">
            <Input.TextArea rows={3} placeholder="Описание категории (необязательно)" />
          </Form.Item>
          <Form.Item label="Rasm (ixtiyoriy)" name="imageId" extra="Kategoriya rasmi">
            <ImageSizeHint type="category" showAsAlert={false} />
            <Space direction="vertical" style={{ width: '100%' }}>
              {categoryImagePreview && (
                <Image
                  src={categoryImagePreview}
                  alt="Category preview"
                  style={{ maxWidth: 200, maxHeight: 200, objectFit: 'cover' }}
                  preview={false}
                />
              )}
              <Space>
                <Upload
                  beforeUpload={handleCategoryImageUpload}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />} loading={uploadingCategoryImage}>
                    Rasm yuklash
                  </Button>
                </Upload>
                <Button
                  icon={<FolderOutlined />}
                  onClick={() => setCategoryImageModalOpen(true)}
                >
                  Mavjud rasmdan tanlash
                </Button>
              </Space>
            </Space>
          </Form.Item>
          <Form.Item label="Holat" name="status" initialValue="published">
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item label="Tartib" name="order" initialValue={0}>
            <Input type="number" placeholder="0" />
          </Form.Item>
        </Form>
      </Modal>

      <MediaLibraryModal
        open={coverModalOpen}
        onCancel={() => setCoverModalOpen(false)}
        onSelect={handleSelectCoverFromMedia}
        fileType="image"
      />

      <MediaLibraryModal
        open={categoryImageModalOpen}
        onCancel={() => setCategoryImageModalOpen(false)}
        onSelect={handleSelectCategoryImageFromMedia}
        fileType="image"
      />
    </div>
  );
}
