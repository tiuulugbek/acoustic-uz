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
} from 'antd';
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
} from '../lib/api';

const statusOptions = [
  { label: 'Nashr etilgan', value: 'published' },
  { label: 'Qoralama', value: 'draft' },
  { label: 'Arxiv', value: 'archived' },
];

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<ServiceDto[], ApiError>({
    queryKey: ['services'],
    queryFn: getServices,
    retry: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceDto | null>(null);
  const [form] = Form.useForm();

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
    form.setFieldsValue({
      status: 'published',
      order: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service: ServiceDto) => {
    setEditingService(service);
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
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (service: ServiceDto) => {
    await deleteServiceMutation(service.id);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
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
      };

      if (editingService) {
        await updateServiceMutation({ id: editingService.id, payload });
      } else {
        await createServiceMutation(payload);
      }

      setIsModalOpen(false);
      form.resetFields();
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
                src={record.cover.url}
                alt={record.title_uz}
                style={{ width: 72, height: 56, objectFit: 'cover', borderRadius: 8 }}
              />
            ) : null}
            <div>
              <strong>{value}</strong>
              {record.title_ru ? (
                <div style={{ fontSize: 12, color: '#6b7280' }}>{record.title_ru}</div>
              ) : null}
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
            rules={[{ required: true, message: 'Iltimos sarlavhani kiriting' }]}
          >
            <Input placeholder="Masalan, Eshitish diagnostikasi" />
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
          <Form.Item label="Batafsil mazmun (uz)" name="body_uz">
            <Input.TextArea rows={4} placeholder="Xizmat tafsilotlari" />
          </Form.Item>
          <Form.Item label="Batafsil mazmun (ru)" name="body_ru">
            <Input.TextArea rows={4} placeholder="Подробности услуги" />
          </Form.Item>
          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Slug maydoni majburiy' }]}
            extra="URL uchun qisqa nom, masalan, eshitish-diagnostikasi"
          >
            <Input />
          </Form.Item>
          <Form.Item label="Tartib" name="order" initialValue={0}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Holat" name="status" initialValue="published">
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item label="Cover ID" name="coverId" extra="Media ID (ixtiyoriy)">
            <Input placeholder="Media ID" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
