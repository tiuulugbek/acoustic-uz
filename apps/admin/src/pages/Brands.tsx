import { useMemo, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  type BrandDto,
  type CreateBrandPayload,
  type UpdateBrandPayload,
  ApiError,
} from '../lib/api';
import { normalizeImageUrl } from '../utils/image';

export default function BrandsPage() {
  const queryClient = useQueryClient();
  const { data: brands, isLoading } = useQuery<BrandDto[], ApiError>({
    queryKey: ['brands'],
    queryFn: getBrands,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandDto | null>(null);
  const [form] = Form.useForm();

  const { mutateAsync: createMutation, isPending: isCreating } = useMutation<BrandDto, ApiError, CreateBrandPayload>({
    mutationFn: createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      message.success('Brend saqlandi');
    },
    onError: (error) => message.error(error.message || 'Saqlashda xatolik'),
  });

  const { mutateAsync: updateMutation, isPending: isUpdating } = useMutation<
    BrandDto,
    ApiError,
    { id: string; payload: UpdateBrandPayload }
  >({
    mutationFn: ({ id, payload }) => updateBrand(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      message.success('Brend yangilandi');
    },
    onError: (error) => message.error(error.message || 'Yangilashda xatolik'),
  });

  const { mutateAsync: deleteMutation, isPending: isDeleting } = useMutation<void, ApiError, string>({
    mutationFn: deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      message.success('Brend o‘chirildi');
    },
    onError: (error) => message.error(error.message || "O'chirishda xatolik"),
  });

  const openCreateModal = () => {
    setEditingBrand(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (brand: BrandDto) => {
    setEditingBrand(brand);
    form.setFieldsValue({
      name: brand.name,
      slug: brand.slug,
      desc_uz: brand.desc_uz ?? undefined,
      desc_ru: brand.desc_ru ?? undefined,
      logoId: brand.logo?.id ?? undefined,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (brand: BrandDto) => {
    await deleteMutation(brand.id);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateBrandPayload = {
        name: values.name,
        slug: values.slug,
        desc_uz: values.desc_uz || undefined,
        desc_ru: values.desc_ru || undefined,
        logoId: values.logoId || undefined,
      };

      if (editingBrand) {
        await updateMutation({ id: editingBrand.id, payload });
      } else {
        await createMutation(payload);
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      // handled by form validation
    }
  };

  const columns: ColumnsType<BrandDto> = useMemo(
    () => [
      {
        title: 'Brend',
        dataIndex: 'name',
        key: 'name',
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: 'Slug',
        dataIndex: 'slug',
        key: 'slug',
      },
      {
        title: "Ta'rif (uz)",
        dataIndex: 'desc_uz',
        key: 'desc_uz',
        render: (value: string | undefined) => value || '—',
      },
      {
        title: 'Logo',
        key: 'logo',
        render: (_, record) =>
          record.logo?.url ? (
            <img src={normalizeImageUrl(record.logo.url)} alt={record.name} style={{ width: 64, height: 32, objectFit: 'contain' }} />
          ) : (
            <Tag color="default">Logo yo'q</Tag>
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
              title="Brendni o‘chirish"
              description="Ushbu brendni o‘chirishni tasdiqlang"
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

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreateModal}>
          Yangi brend
        </Button>
      </Space>

      <Table
        loading={isLoading}
        dataSource={brands ?? []}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingBrand ? 'Brendni tahrirlash' : 'Yangi brend'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={isCreating || isUpdating}
        width={600}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Nomi" name="name" rules={[{ required: true, message: 'Nomi majburiy' }]}>
            <Input 
              placeholder="Masalan, Oticon"
              onChange={(e) => {
                const name = e.target.value;
                const currentSlug = form.getFieldValue('slug');
                if (!currentSlug || currentSlug === createSlug(form.getFieldValue('name') || '')) {
                  form.setFieldsValue({ slug: createSlug(name) });
                }
              }}
            />
          </Form.Item>
          <Form.Item 
            label="Slug" 
            name="slug" 
            rules={[{ required: true, message: 'Slug majburiy' }]}
            extra="URL uchun qisqa nom (avtomatik yaratiladi yoki qo'lda kiriting)"
          >
            <Input placeholder="Avtomatik yaratiladi..." />
          </Form.Item>
          <Form.Item label="Ta'rif (uz)" name="desc_uz">
            <Input.TextArea rows={3} placeholder="Brend haqida qisqa maʼlumot" />
          </Form.Item>
          <Form.Item label="Ta'rif (ru)" name="desc_ru">
            <Input.TextArea rows={3} placeholder="Краткое описание бренда" />
          </Form.Item>
          <Form.Item label="Logo ID" name="logoId" extra="Media ID ni kiriting (hozircha qo‘lda)">
            <Input placeholder="Media ID" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
