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
  Radio,
  InputNumber,
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
  getMedia,
  uploadMedia,
  MediaDto,
  getPostCategories,
  PostCategoryDto,
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostDto | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverModalOpen, setCoverModalOpen] = useState(false);

  // Fetch posts filtered by section categories
  const { data: categories } = useQuery<PostCategoryDto[], ApiError>({
    queryKey: ['post-categories', section],
    queryFn: () => getPostCategories(section),
    retry: false,
  });

  const categoryIds = useMemo(() => categories?.map(cat => cat.id) || [], [categories]);

  const { data, isLoading } = useQuery<PostDto[], ApiError>({
    queryKey: ['posts', section],
    queryFn: async () => {
      const allPosts = await getPosts();
      // Filter posts that belong to categories in this section
      return allPosts.filter(post => 
        post.categoryId && categoryIds.includes(post.categoryId) && post.postType === 'article'
      );
    },
    enabled: categoryIds.length > 0,
    retry: false,
  });

  const { data: mediaList } = useQuery<MediaDto[], ApiError>({
    queryKey: ['media'],
    queryFn: getMedia,
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

  const openCreateModal = () => {
    setEditingPost(null);
    setCoverPreview(null);
    form.resetFields();
    form.setFieldsValue({
      postType: 'article',
      status: 'draft',
      publishAt: dayjs(),
      categoryId: categoryOptions.length > 0 ? categoryOptions[0].value : undefined,
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreatePostPayload = {
        title_uz: values.title_uz,
        title_ru: values.title_ru,
        body_uz: values.body_uz,
        body_ru: values.body_ru,
        slug: values.slug,
        postType: 'article',
        categoryId: values.categoryId || null,
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
        if (!categoryId) return <Tag>Umumiy</Tag>;
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

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{sectionName.uz} bo'limi maqolalari</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Yangi maqola
        </Button>
      </div>

      {categoryOptions.length === 0 && (
        <div style={{ marginBottom: '16px', padding: '16px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '4px' }}>
          <p style={{ margin: 0 }}>
            <strong>Eslatma:</strong> Bu bo'lim uchun kategoriyalar mavjud emas. Avval "Maqolalar" bo'limida kategoriya yarating va uni "{sectionName.uz}" bo'limiga biriktiring.
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
            <Input placeholder="Masalan, Bepul maslahat" />
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
            rules={[{ required: true, message: 'Kategoriyani tanlang' }]}
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

      <MediaLibraryModal
        open={coverModalOpen}
        onCancel={() => setCoverModalOpen(false)}
        onSelect={handleSelectCoverFromMedia}
        fileType="image"
      />
    </div>
  );
}

