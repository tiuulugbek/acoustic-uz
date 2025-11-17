import { useMemo, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
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
  getFaqsAdmin,
  createFaq,
  updateFaq,
  deleteFaq,
  type FaqDto,
  type CreateFaqPayload,
  type UpdateFaqPayload,
  ApiError,
} from '../lib/api';

const statusOptions = [
  { label: 'Nashr etilgan', value: 'published' },
  { label: 'Qoralama', value: 'draft' },
  { label: 'Arxiv', value: 'archived' },
];

export default function FAQPage() {
  const queryClient = useQueryClient();

  const { data: faqs, isLoading } = useQuery<FaqDto[], ApiError>({
    queryKey: ['faqs-admin'],
    queryFn: getFaqsAdmin,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqDto | null>(null);
  const [form] = Form.useForm();

  const { mutateAsync: createMutation, isPending: isCreating } = useMutation<FaqDto, ApiError, CreateFaqPayload>({
    mutationFn: createFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs-admin'] });
      message.success('Savol-javob saqlandi');
    },
    onError: (error) => message.error(error.message || 'Saqlashda xatolik'),
  });

  const { mutateAsync: updateMutation, isPending: isUpdating } = useMutation<
    FaqDto,
    ApiError,
    { id: string; payload: UpdateFaqPayload }
  >({
    mutationFn: ({ id, payload }) => updateFaq(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs-admin'] });
      message.success('Savol-javob yangilandi');
    },
    onError: (error) => message.error(error.message || 'Yangilashda xatolik'),
  });

  const { mutateAsync: deleteMutation, isPending: isDeleting } = useMutation<void, ApiError, string>({
    mutationFn: deleteFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs-admin'] });
      message.success('Savol-javob o\'chirildi');
    },
    onError: (error) => message.error(error.message || "O'chirishda xatolik"),
  });

  const openCreateModal = () => {
    setEditingFaq(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'published',
      order: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (faq: FaqDto) => {
    setEditingFaq(faq);
    form.setFieldsValue({
      question_uz: faq.question_uz,
      question_ru: faq.question_ru,
      answer_uz: faq.answer_uz,
      answer_ru: faq.answer_ru,
      order: faq.order,
      status: faq.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (faq: FaqDto) => {
    await deleteMutation(faq.id);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload: CreateFaqPayload = {
        question_uz: values.question_uz,
        question_ru: values.question_ru,
        answer_uz: values.answer_uz,
        answer_ru: values.answer_ru,
        order: values.order ?? 0,
        status: values.status ?? 'published',
      };

      if (editingFaq) {
        await updateMutation({ id: editingFaq.id, payload });
      } else {
        await createMutation(payload);
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      // validation handled by antd
    }
  };

  const columns: ColumnsType<FaqDto> = useMemo(
    () => [
      {
        title: 'Savol (uz)',
        dataIndex: 'question_uz',
        key: 'question_uz',
        render: (value: string) => (
          <div style={{ maxWidth: 300 }}>
            <strong>{value}</strong>
          </div>
        ),
      },
      {
        title: 'Savol (ru)',
        dataIndex: 'question_ru',
        key: 'question_ru',
        render: (value: string) => (
          <div style={{ maxWidth: 300 }}>
            <strong>{value}</strong>
          </div>
        ),
      },
      {
        title: 'Tartib',
        dataIndex: 'order',
        key: 'order',
        width: 80,
      },
      {
        title: 'Holat',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (value: FaqDto['status']) => {
          const color = value === 'published' ? 'green' : value === 'draft' ? 'orange' : 'default';
          return <Tag color={color}>{value}</Tag>;
        },
      },
      {
        title: 'Amallar',
        key: 'actions',
        width: 150,
        render: (_, record) => (
          <Space>
            <Button size="small" onClick={() => openEditModal(record)}>
              Tahrirlash
            </Button>
            <Popconfirm
              title="Savol-javob o'chiriladi"
              description="Ushbu savol-javobni o'chirishni tasdiqlang"
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
    [isDeleting],
  );

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreateModal}>
          Yangi savol-javob
        </Button>
      </Space>

      <Table
        loading={isLoading}
        dataSource={faqs ?? []}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />

      <Modal
        title={editingFaq ? 'Savol-javobni tahrirlash' : 'Yangi savol-javob'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={isCreating || isUpdating}
        width={800}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Savol (uz)"
            name="question_uz"
            rules={[{ required: true, message: 'Iltimos, savolni kiriting' }]}
          >
            <Input.TextArea rows={2} placeholder="Masalan, Eshitish apparati qanday ishlaydi?" />
          </Form.Item>
          <Form.Item
            label="Savol (ru)"
            name="question_ru"
            rules={[{ required: true, message: 'Iltimos, savolni kiriting' }]}
          >
            <Input.TextArea rows={2} placeholder="Например, Как работает слуховой аппарат?" />
          </Form.Item>
          <Form.Item
            label="Javob (uz)"
            name="answer_uz"
            rules={[{ required: true, message: 'Iltimos, javobni kiriting' }]}
          >
            <Input.TextArea rows={4} placeholder="Batafsil javob..." />
          </Form.Item>
          <Form.Item
            label="Javob (ru)"
            name="answer_ru"
            rules={[{ required: true, message: 'Iltimos, javobni kiriting' }]}
          >
            <Input.TextArea rows={4} placeholder="Подробный ответ..." />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item label="Tartib" name="order">
              <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
            </Form.Item>
            <Form.Item label="Holat" name="status" initialValue="published">
              <Select options={statusOptions} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

