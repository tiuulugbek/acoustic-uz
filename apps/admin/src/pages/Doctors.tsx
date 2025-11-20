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
  Upload,
  Image,
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
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  DoctorDto,
  CreateDoctorPayload,
  UpdateDoctorPayload,
  ApiError,
  getMedia,
  uploadMedia,
  type MediaDto,
} from '../lib/api';
import { createSlug } from '../utils/slug';

const statusOptions = [
  { label: 'Nashr etilgan', value: 'published' },
  { label: 'Qoralama', value: 'draft' },
  { label: 'Arxiv', value: 'archived' },
];

export default function DoctorsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<DoctorDto[], ApiError>({
    queryKey: ['doctors'],
    queryFn: getDoctors,
    retry: false,
  });

  // Fetch media list for image selection
  const { data: mediaList } = useQuery<MediaDto[], ApiError>({
    queryKey: ['media'],
    queryFn: getMedia,
    retry: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorDto | null>(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { mutateAsync: createDoctorMutation, isPending: isCreating } = useMutation<DoctorDto, ApiError, CreateDoctorPayload>({
    mutationFn: createDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      message.success('Mutaxassis saqlandi');
    },
    onError: (error) => message.error(error.message || 'Saqlashda xatolik'),
  });

  const { mutateAsync: updateDoctorMutation, isPending: isUpdating } = useMutation<DoctorDto, ApiError, { id: string; payload: UpdateDoctorPayload }>({
    mutationFn: ({ id, payload }) => updateDoctor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      message.success('Mutaxassis yangilandi');
    },
    onError: (error) => message.error(error.message || 'Yangilashda xatolik'),
  });

  const { mutateAsync: deleteDoctorMutation, isPending: isDeleting } = useMutation<void, ApiError, string>({
    mutationFn: deleteDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      message.success('Mutaxassis o\'chirildi');
    },
    onError: (error) => message.error(error.message || 'O\'chirishda xatolik'),
  });

  const openCreateModal = () => {
    setEditingDoctor(null);
    form.resetFields();
    setPreviewImage(null);
    form.setFieldsValue({
      status: 'published',
      order: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (doctor: DoctorDto) => {
    setEditingDoctor(doctor);
    setPreviewImage(doctor.image?.url || null);
    form.setFieldsValue({
      name_uz: doctor.name_uz,
      name_ru: doctor.name_ru,
      position_uz: doctor.position_uz,
      position_ru: doctor.position_ru,
      experience_uz: doctor.experience_uz,
      experience_ru: doctor.experience_ru,
      description_uz: doctor.description_uz,
      description_ru: doctor.description_ru,
      slug: doctor.slug,
      status: doctor.status,
      order: doctor.order,
      imageId: doctor.image?.id,
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

  const handleDelete = async (doctor: DoctorDto) => {
    await deleteDoctorMutation(doctor.id);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateDoctorPayload = {
        name_uz: values.name_uz,
        name_ru: values.name_ru,
        position_uz: values.position_uz ?? undefined,
        position_ru: values.position_ru ?? undefined,
        experience_uz: values.experience_uz ?? undefined,
        experience_ru: values.experience_ru ?? undefined,
        description_uz: values.description_uz ?? undefined,
        description_ru: values.description_ru ?? undefined,
        slug: values.slug,
        order: typeof values.order === 'number' ? values.order : Number(values.order ?? 0),
        status: values.status,
        imageId: values.imageId || undefined,
      };

      if (editingDoctor) {
        await updateDoctorMutation({ id: editingDoctor.id, payload });
      } else {
        await createDoctorMutation(payload);
      }

      setIsModalOpen(false);
      form.resetFields();
      setPreviewImage(null);
    } catch (error) {
      // validation handled by antd
    }
  };

  const columns: ColumnsType<DoctorDto> = useMemo(
    () => [
      {
        title: 'Mutaxassis',
        dataIndex: 'name_uz',
        key: 'name_uz',
        render: (value: string, record) => (
          <Space align="start">
            {record.image?.url ? (
              <img
                src={record.image.url}
                alt={record.name_uz}
                style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }}
              />
            ) : null}
            <div>
              <strong>{value}</strong>
              {record.name_ru ? (
                <div style={{ fontSize: 12, color: '#6b7280' }}>{record.name_ru}</div>
              ) : null}
              {record.position_uz && (
                <div style={{ fontSize: 12, color: '#9ca3af' }}>
                  {record.position_uz}
                </div>
              )}
            </div>
          </Space>
        ),
      },
      {
        title: 'Holati',
        dataIndex: 'status',
        key: 'status',
        render: (value: DoctorDto['status']) => {
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
              title="Mutaxassisni o'chirish"
              description="Ushbu mutaxassisni o'chirishni tasdiqlang"
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
    [isDeleting],
  );

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Mutaxassislar</h2>
        <Button type="primary" onClick={openCreateModal}>
          + Yangi mutaxassis
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />
      <Modal
        title={editingDoctor ? 'Mutaxassisni tahrirlash' : 'Yangi mutaxassis'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setPreviewImage(null);
        }}
        onOk={handleSubmit}
        confirmLoading={isCreating || isUpdating}
        width={800}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Ism (uz)"
            name="name_uz"
            rules={[{ required: true, message: 'Iltimos ismni kiriting' }]}
          >
            <Input
              placeholder="Masalan, Ahmadjon Aliyev"
              onChange={(e) => {
                const name = e.target.value;
                const currentSlug = form.getFieldValue('slug');
                // Only auto-generate slug if it's empty or was auto-generated
                if (!currentSlug || currentSlug === createSlug(form.getFieldValue('name_uz') || '')) {
                  form.setFieldsValue({ slug: createSlug(name) });
                }
              }}
            />
          </Form.Item>
          <Form.Item
            label="Ism (ru)"
            name="name_ru"
            rules={[{ required: true, message: 'Iltimos ismni kiriting' }]}
          >
            <Input placeholder="Например, Ахмаджон Алиев" />
          </Form.Item>
          <Form.Item label="Lavozim (uz)" name="position_uz">
            <Input placeholder="Masalan, Bosh surdolog" />
          </Form.Item>
          <Form.Item label="Lavozim (ru)" name="position_ru">
            <Input placeholder="Например, Главный сурдолог" />
          </Form.Item>
          <Form.Item label="Tajriba (uz)" name="experience_uz">
            <Input placeholder="Masalan, 10 yillik tajriba" />
          </Form.Item>
          <Form.Item label="Tajriba (ru)" name="experience_ru">
            <Input placeholder="Например, 10 лет опыта" />
          </Form.Item>
          <Form.Item label="Tavsif (uz)" name="description_uz">
            <Input.TextArea rows={4} placeholder="Mutaxassis haqida batafsil ma'lumot" />
          </Form.Item>
          <Form.Item label="Tavsif (ru)" name="description_ru">
            <Input.TextArea rows={4} placeholder="Подробная информация о специалисте" />
          </Form.Item>
          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Slug maydoni majburiy' }]}
            extra="URL uchun qisqa nom (avtomatik yaratiladi yoki qo'lda kiriting)"
          >
            <Input placeholder="Avtomatik yaratiladi..." />
          </Form.Item>
          <Form.Item label="Rasm" name="imageId" extra="Mutaxassis rasmi">
            <div>
              {previewImage ? (
                <div style={{ marginBottom: 16, position: 'relative', display: 'inline-block' }}>
                  <Image
                    src={previewImage}
                    alt="Preview"
                    width={200}
                    height={200}
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                    preview={false}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleRemoveImage}
                    style={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    O'chirish
                  </Button>
                </div>
              ) : null}
              <Upload
                customRequest={handleUpload}
                showUploadList={false}
                accept="image/*"
                disabled={uploading}
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {previewImage ? 'Rasmni almashtirish' : 'Rasm yuklash'}
                </Button>
              </Upload>
              {mediaList && mediaList.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
                    Yoki mavjud rasmni tanlang:
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                      gap: 8,
                      maxHeight: 200,
                      overflowY: 'auto',
                      padding: 8,
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                    }}
                  >
                    {mediaList.slice(0, 20).map((media) => (
                      <div
                        key={media.id}
                        onClick={() => handleSelectExistingMedia(media.id, media.url)}
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          border: currentImageId === media.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                          borderRadius: 4,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          position: 'relative',
                          backgroundColor: currentImageId === media.id ? '#e6f7ff' : '#fff',
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
          <Form.Item label="Tartib" name="order" initialValue={0}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Holat" name="status" initialValue="published">
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
