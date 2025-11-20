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
  InputNumber,
  Upload,
  Image,
} from 'antd';
import { UploadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  type BranchDto,
  type CreateBranchPayload,
  type UpdateBranchPayload,
  ApiError,
  getMedia,
  uploadMedia,
  type MediaDto,
} from '../lib/api';
import { createSlug } from '../utils/slug';

export default function BranchesPage() {
  const queryClient = useQueryClient();
  const { data: branches, isLoading } = useQuery<BranchDto[], ApiError>({
    queryKey: ['branches'],
    queryFn: getBranches,
  });

  // Fetch media list for image selection
  const { data: mediaList } = useQuery<MediaDto[], ApiError>({
    queryKey: ['media'],
    queryFn: getMedia,
    retry: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchDto | null>(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { mutateAsync: createMutation, isPending: isCreating } = useMutation<BranchDto, ApiError, CreateBranchPayload>({
    mutationFn: createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      message.success('Filial saqlandi');
    },
    onError: (error) => message.error(error.message || 'Saqlashda xatolik'),
  });

  const { mutateAsync: updateMutation, isPending: isUpdating } = useMutation<
    BranchDto,
    ApiError,
    { id: string; payload: UpdateBranchPayload }
  >({
    mutationFn: ({ id, payload }) => updateBranch(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      message.success('Filial yangilandi');
    },
    onError: (error) => message.error(error.message || 'Yangilashda xatolik'),
  });

  const { mutateAsync: deleteMutation, isPending: isDeleting } = useMutation<void, ApiError, string>({
    mutationFn: deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      message.success('Filial o\'chirildi');
    },
    onError: (error) => message.error(error.message || 'O\'chirishda xatolik'),
  });

  const openCreateModal = () => {
    setEditingBranch(null);
    form.resetFields();
    setPreviewImage(null);
    form.setFieldsValue({
      phones: [],
      order: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (branch: BranchDto) => {
    setEditingBranch(branch);
    setPreviewImage(branch.image?.url || null);
    form.setFieldsValue({
      name_uz: branch.name_uz,
      name_ru: branch.name_ru,
      slug: branch.slug || '',
      address_uz: branch.address_uz,
      address_ru: branch.address_ru,
      phone: branch.phone,
      phones: branch.phones || [],
      map_iframe: branch.map_iframe,
      tour3d_iframe: branch.tour3d_iframe,
      latitude: branch.latitude,
      longitude: branch.longitude,
      order: branch.order,
      imageId: branch.image?.id,
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

  const handleDelete = async (branch: BranchDto) => {
    await deleteMutation(branch.id);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Generate slug automatically if not provided
      let slug = values.slug?.trim();
      if (!slug && values.name_uz) {
        slug = createSlug(values.name_uz);
      }
      
      const payload: CreateBranchPayload = {
        name_uz: values.name_uz,
        name_ru: values.name_ru,
        slug: slug || undefined,
        address_uz: values.address_uz,
        address_ru: values.address_ru,
        phone: values.phone,
        phones: values.phones || [],
        map_iframe: values.map_iframe || undefined,
        tour3d_iframe: values.tour3d_iframe || undefined,
        latitude: values.latitude != null ? Number(values.latitude) : undefined,
        longitude: values.longitude != null ? Number(values.longitude) : undefined,
        order: typeof values.order === 'number' ? values.order : Number(values.order ?? 0),
        imageId: values.imageId || undefined,
      };

      if (editingBranch) {
        await updateMutation({ id: editingBranch.id, payload });
      } else {
        await createMutation(payload);
      }

      setIsModalOpen(false);
      form.resetFields();
      setPreviewImage(null);
    } catch (error) {
      // validation handled by antd
    }
  };

  const columns: ColumnsType<BranchDto> = useMemo(
    () => [
      {
        title: 'Filial',
        dataIndex: 'name_uz',
        key: 'name_uz',
        render: (value: string, record) => (
          <Space align="start">
            {record.image?.url ? (
              <img
                src={record.image.url}
                alt={record.name_uz}
                style={{ width: 72, height: 56, objectFit: 'cover', borderRadius: 8 }}
              />
            ) : null}
            <div>
              <strong>{value}</strong>
              {record.name_ru ? (
                <div style={{ fontSize: 12, color: '#6b7280' }}>{record.name_ru}</div>
              ) : null}
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                {record.address_uz}
              </div>
            </div>
          </Space>
        ),
      },
      {
        title: 'Telefon',
        dataIndex: 'phone',
        key: 'phone',
        render: (value: string) => <a href={`tel:${value}`}>{value}</a>,
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
              title="Filialni o'chirish"
              description="Ushbu filialni o'chirishni tasdiqlang"
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
        <h2>Filiallar va manzillar</h2>
        <Button type="primary" onClick={openCreateModal} icon={<PlusOutlined />}>
          + Yangi filial
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={branches || []}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />
      <Modal
        title={editingBranch ? 'Filialni tahrirlash' : 'Yangi filial'}
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
            label="Nomi (uz)"
            name="name_uz"
            rules={[{ required: true, message: 'Iltimos nomni kiriting' }]}
          >
            <Input 
              placeholder="Masalan, Toshkent filiali"
              onChange={(e) => {
                const value = e.target.value.trim();
                if (value && !form.getFieldValue('slug')) {
                  // Auto-generate slug from name_uz if slug is empty
                  form.setFieldsValue({ slug: createSlug(value) });
                }
              }}
            />
          </Form.Item>
          <Form.Item
            label="Nomi (ru)"
            name="name_ru"
            rules={[{ required: true, message: 'Iltimos nomni kiriting' }]}
          >
            <Input placeholder="Например, Филиал Ташкента" />
          </Form.Item>
          <Form.Item
            label="Slug (URL)"
            name="slug"
            extra="URL uchun slug (avtomatik yaratiladi yoki qo'lda kiriting)"
            tooltip="Agar bo'sh qoldirilsa, nomdan avtomatik yaratiladi"
          >
            <Input 
              placeholder="Masalan, acoustic-chilonzor-filiali"
              onChange={(e) => {
                const value = e.target.value.trim();
                if (value) {
                  form.setFieldsValue({ slug: createSlug(value) });
                }
              }}
            />
          </Form.Item>
          <Form.Item
            label="Manzil (uz)"
            name="address_uz"
            rules={[{ required: true, message: 'Iltimos manzilni kiriting' }]}
          >
            <Input.TextArea rows={2} placeholder="Masalan, Toshkent shahri, Chilonzor tumani..." />
          </Form.Item>
          <Form.Item
            label="Manzil (ru)"
            name="address_ru"
            rules={[{ required: true, message: 'Iltimos manzilni kiriting' }]}
          >
            <Input.TextArea rows={2} placeholder="Например, г. Ташкент, Чилонзорский район..." />
          </Form.Item>
          <Form.Item
            label="Asosiy telefon"
            name="phone"
            rules={[{ required: true, message: 'Iltimos telefon raqamini kiriting' }]}
          >
            <Input placeholder="Masalan, +998 71 202 14 41" />
          </Form.Item>
          <Form.Item
            label="Qo'shimcha telefonlar"
            name="phones"
            extra="Har bir telefon raqamini alohida qatorga yozing"
          >
            <Input.TextArea
              rows={3}
              placeholder="+998 71 123 45 67&#10;+998 90 123 45 67"
              onChange={(e) => {
                const phones = e.target.value
                  .split('\n')
                  .map((p) => p.trim())
                  .filter((p) => p.length > 0);
                form.setFieldsValue({ phones });
              }}
            />
          </Form.Item>
          <Form.Item
            label="Xarita iframe"
            name="map_iframe"
            extra="Google Maps yoki boshqa xarita xizmatidan iframe kodini kiriting"
          >
            <Input.TextArea
              rows={4}
              placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
            />
          </Form.Item>
          <Form.Item
            label="3D Tour iframe"
            name="tour3d_iframe"
            extra="3D virtual tour iframe kodini kiriting (masalan, Matterport, Kuula, yoki boshqa 3D tour xizmatidan)"
          >
            <Input.TextArea
              rows={4}
              placeholder='<iframe src="https://my.matterport.com/show/?m=..." width="100%" height="600" frameborder="0" allowfullscreen allow="xr-spatial-tracking"></iframe>'
            />
          </Form.Item>
          <Form.Item label="Rasm" name="imageId" extra="Filial rasmi">
            <div>
              {previewImage ? (
                <div style={{ marginBottom: 16, position: 'relative', display: 'inline-block' }}>
                  <Image
                    src={previewImage}
                    alt="Preview"
                    width={200}
                    height={150}
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
          <Form.Item
            label="Kenglik (Latitude)"
            name="latitude"
            extra="GPS kenglik koordinatasi (masalan, 41.2973)"
          >
            <InputNumber
              style={{ width: '100%' }}
              step={0.0001}
              min={-90}
              max={90}
              placeholder="41.2973"
            />
          </Form.Item>
          <Form.Item
            label="Uzunlik (Longitude)"
            name="longitude"
            extra="GPS uzunlik koordinatasi (masalan, 69.2050)"
          >
            <InputNumber
              style={{ width: '100%' }}
              step={0.0001}
              min={-180}
              max={180}
              placeholder="69.2050"
            />
          </Form.Item>
          <Form.Item label="Tartib" name="order" initialValue={0}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
