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
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
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
} from '../lib/api';
import { createSlug } from '../utils/slug';
import { ApiError } from '../lib/api';

const statusOptions = [
  { label: 'Nashr etilgan', value: 'published' },
  { label: 'Qoralama', value: 'draft' },
  { label: 'Arxiv', value: 'archived' },
];

function formatDate(date?: string) {
  if (!date) return '-';
  return dayjs(date).format('DD.MM.YYYY');
}

export default function PostsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<PostDto[], ApiError>({
    queryKey: ['posts'],
    queryFn: getPosts,
    retry: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostDto | null>(null);
  const [form] = Form.useForm();

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
    form.resetFields();
    form.setFieldsValue({
      status: 'draft',
      publishAt: dayjs(),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (post: PostDto) => {
    setEditingPost(post);
    form.setFieldsValue({
      title_uz: post.title_uz,
      title_ru: post.title_ru,
      body_uz: post.body_uz,
      body_ru: post.body_ru,
      slug: post.slug,
      status: post.status,
      publishAt: post.publishAt ? dayjs(post.publishAt) : undefined,
      tags: post.tags.join(', '),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (post: PostDto) => {
    await deletePostMutation(post.id);
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
    } catch (error) {
      // validation error handled by antd
    }
  };

  const columns: ColumnsType<PostDto> = useMemo(
    () => [
      {
        title: 'Sarlavha (UZ)',
        dataIndex: 'title_uz',
        key: 'title_uz',
        render: (value) => <strong>{value}</strong>,
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
        title: 'Teglar',
        dataIndex: 'tags',
        key: 'tags',
        render: (tags: string[]) => (
          <Space size={[4, 0]} wrap>
            {tags?.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            )) || '-'}
          </Space>
        ),
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
              title="Maqolani o‘chirish"
              description="Haqiqatan ham o‘chirilsinmi?"
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
          Yangi maqola
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
        title={editingPost ? 'Maqolani tahrirlash' : 'Yangi maqola'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={isCreating || isUpdating}
        width={720}
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
            label="Matn (uz)"
            name="body_uz"
            rules={[{ required: true, message: 'Matnni kiriting' }]}
          >
            <Input.TextArea rows={4} placeholder="Maqola matni" />
          </Form.Item>
          <Form.Item
            label="Matn (ru)"
            name="body_ru"
            rules={[{ required: true, message: 'Введите текст' }]}
          >
            <Input.TextArea rows={4} placeholder="Текст статьи" />
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
    </div>
  );
}
