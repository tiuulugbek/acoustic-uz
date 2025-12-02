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
  Select,
  Transfer,
  Tabs,
} from 'antd';
import { UploadOutlined, DeleteOutlined, PlusOutlined, FolderOutlined } from '@ant-design/icons';
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
  getServices,
  type ServiceDto,
} from '../lib/api';
import { createSlug } from '../utils/slug';
import MediaLibraryModal from '../components/MediaLibraryModal';
import Tour3DEditor from '../components/Tour3DEditor';
import { normalizeImageUrl } from '../utils/image';
import { compressImage } from '../utils/image-compression';

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

  // Fetch services list for branch services selection
  const { data: servicesList } = useQuery<ServiceDto[], ApiError>({
    queryKey: ['services-admin'],
    queryFn: getServices,
    retry: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchDto | null>(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

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
    mutationFn: ({ id, payload }) => {
      console.log('🔍 [BRANCHES ADMIN] Calling updateBranch:', { id, payload });
      return updateBranch(id, payload);
    },
    onSuccess: (data) => {
      console.log('🔍 [BRANCHES ADMIN] Update success:', {
        id: data.id,
        workingHours_uz: data.workingHours_uz,
        workingHours_ru: data.workingHours_ru,
        serviceIds: data.serviceIds,
      });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      message.success('Filial yangilandi');
    },
    onError: (error) => {
      console.error('🔍 [BRANCHES ADMIN] Update error:', error);
      message.error(error.message || 'Yangilashda xatolik');
    },
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
      serviceIds: [],
      order: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (branch: BranchDto) => {
    setEditingBranch(branch);
    setPreviewImage(branch.image?.url ? normalizeImageUrl(branch.image.url) : null);
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
      tour3d_config: branch.tour3d_config || undefined,
      latitude: branch.latitude,
      longitude: branch.longitude,
      workingHours_uz: branch.workingHours_uz || '',
      workingHours_ru: branch.workingHours_ru || '',
      serviceIds: branch.serviceIds || [],
      order: branch.order,
      imageId: branch.image?.id,
    });
    setIsModalOpen(true);
  };

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      // Rasmni yuklashdan oldin siqish
      const compressedFile = await compressImage(file as File);
      const media = await uploadMedia(compressedFile);
      form.setFieldsValue({ imageId: media.id });
      setPreviewImage(normalizeImageUrl(media.url));
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

  const handleSelectExistingMedia = (media: MediaDto) => {
    form.setFieldsValue({ imageId: media.id });
    setPreviewImage(normalizeImageUrl(media.url));
    setImageModalOpen(false);
    message.success('Rasm tanlandi');
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
        tour3d_config: values.tour3d_config || undefined,
        latitude: values.latitude != null ? Number(values.latitude) : undefined,
        longitude: values.longitude != null ? Number(values.longitude) : undefined,
        workingHours_uz: values.workingHours_uz && values.workingHours_uz.trim() ? values.workingHours_uz.trim() : null,
        workingHours_ru: values.workingHours_ru && values.workingHours_ru.trim() ? values.workingHours_ru.trim() : null,
        serviceIds: values.serviceIds && Array.isArray(values.serviceIds) ? values.serviceIds : [],
        order: typeof values.order === 'number' ? values.order : Number(values.order ?? 0),
        imageId: values.imageId || undefined,
      };

      console.log('🔍 [BRANCHES ADMIN] Payload:', {
        workingHours_uz: payload.workingHours_uz,
        workingHours_ru: payload.workingHours_ru,
        serviceIds: payload.serviceIds,
      });

      if (editingBranch) {
        const result = await updateMutation({ id: editingBranch.id, payload });
        console.log('🔍 [BRANCHES ADMIN] Update result:', {
          id: result.id,
          workingHours_uz: result.workingHours_uz,
          workingHours_ru: result.workingHours_ru,
          serviceIds: result.serviceIds,
        });
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
                src={normalizeImageUrl(record.image.url)}
                alt={record.name_uz}
                style={{ width: 72, height: 56, objectFit: 'cover', borderRadius: 8 }}
                onError={(e) => {
                  console.error('Image load error:', { src: e.currentTarget.src, branchId: record.id });
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="72" height="56"%3E%3Crect fill="%23f5f5f5" width="72" height="56"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="10" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ERasm%3C/text%3E%3C/svg%3E';
                }}
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
          setActiveTab('general');
        }}
        onOk={handleSubmit}
        confirmLoading={isCreating || isUpdating}
        width={1000}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form layout="vertical" form={form}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'general',
                label: 'Umumiy ma\'lumotlar',
                children: (
                  <>
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
          <Form.Item label="Rasm" name="imageId" extra="Filial rasmi">
            <div>
              {(previewImage || form.getFieldValue('imageId')) && (
                <div style={{ marginBottom: 16, position: 'relative', display: 'inline-block' }}>
                  <img
                    src={normalizeImageUrl(previewImage || mediaList?.find(m => m.id === form.getFieldValue('imageId'))?.url || '')}
                    alt="Preview"
                    style={{ width: 200, height: 150, objectFit: 'cover', borderRadius: 8, display: 'block' }}
                    onError={(e) => {
                      console.error('Image load error:', {
                        src: e.currentTarget.src,
                        previewImage,
                        imageId: form.getFieldValue('imageId'),
                      });
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23f5f5f5" width="200" height="150"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ERasm%3C/text%3E%3C/svg%3E';
                    }}
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
              )}
              <Space direction="vertical" style={{ width: '100%' }}>
                <Upload
                  customRequest={handleUpload}
                  showUploadList={false}
                  accept="image/*"
                  disabled={uploading}
                >
                  <Button icon={<UploadOutlined />} loading={uploading} block>
                    {previewImage ? 'Rasmni almashtirish' : 'Rasm yuklash'}
                  </Button>
                </Upload>
                <Button
                  icon={<FolderOutlined />}
                  onClick={() => setImageModalOpen(true)}
                  block
                  style={{ marginBottom: 8 }}
                >
                  Mavjud rasmdan tanlash
                </Button>
                {form.getFieldValue('imageId') && (
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    Tanlangan: {mediaList?.find(m => m.id === form.getFieldValue('imageId'))?.filename || 'Noma\'lum'}
                  </div>
                )}
              </Space>
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

          <Form.Item
            label="Ish vaqti (uz)"
            name="workingHours_uz"
            extra="Har bir kun alohida qatorga yozing. Hozirgi kun avtomatik ajratib ko'rsatiladi. Masalan:&#10;Dushanba: 09:00-20:00&#10;Seshanba: 09:00-20:00&#10;Chorshanba: 09:00-20:00&#10;Payshanba: 09:00-20:00&#10;Juma: 09:00-20:00&#10;Shanba: 09:00-18:00&#10;Yakshanba: 09:00-18:00&#10;&#10;Yoki oralig'ida:&#10;Dushanba - Juma: 09:00-20:00&#10;Shanba - Yakshanba: 09:00-18:00"
          >
            <Input.TextArea
              rows={7}
              placeholder="Dushanba: 09:00-20:00&#10;Seshanba: 09:00-20:00&#10;Chorshanba: 09:00-20:00&#10;Payshanba: 09:00-20:00&#10;Juma: 09:00-20:00&#10;Shanba: 09:00-18:00&#10;Yakshanba: 09:00-18:00"
            />
          </Form.Item>

          <Form.Item
            label="Ish vaqti (ru)"
            name="workingHours_ru"
            extra="Каждый день на отдельной строке. Текущий день будет автоматически выделен. Например:&#10;Понедельник: 09:00-20:00&#10;Вторник: 09:00-20:00&#10;Среда: 09:00-20:00&#10;Четверг: 09:00-20:00&#10;Пятница: 09:00-20:00&#10;Суббота: 09:00-18:00&#10;Воскресенье: 09:00-18:00&#10;&#10;Или диапазоном:&#10;Понедельник - Пятница: 09:00-20:00&#10;Суббота - Воскресенье: 09:00-18:00"
          >
            <Input.TextArea
              rows={7}
              placeholder="Понедельник: 09:00-20:00&#10;Вторник: 09:00-20:00&#10;Среда: 09:00-20:00&#10;Четверг: 09:00-20:00&#10;Пятница: 09:00-20:00&#10;Суббота: 09:00-18:00&#10;Воскресенье: 09:00-18:00"
            />
          </Form.Item>

          <Form.Item
            label="Xizmatlar"
            name="serviceIds"
            extra="Filialda ko'rsatiladigan xizmatlarni tanlang"
          >
            <Select
              mode="multiple"
              placeholder="Xizmatlarni tanlang"
              style={{ width: '100%' }}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={servicesList?.map((service) => ({
                label: `${service.title_uz}${service.title_ru ? ` / ${service.title_ru}` : ''}`,
                value: service.id,
              })) || []}
            />
          </Form.Item>
                  </>
                ),
              },
              {
                key: 'tour3d',
                label: '3D Tour',
                children: (
                  <>
                    <Form.Item
                      label="3D Tour iframe (Eski usul)"
                      name="tour3d_iframe"
                      extra="3D virtual tour iframe kodini kiriting (masalan, Matterport, Kuula, yoki boshqa 3D tour xizmatidan). Agar tour3d_config to'ldirilsa, bu maydon e'tiborsiz qoldiriladi."
                    >
                      <Input.TextArea
                        rows={4}
                        placeholder='<iframe src="https://my.matterport.com/show/?m=..." width="100%" height="600" frameborder="0" allowfullscreen allow="xr-spatial-tracking"></iframe>'
                      />
                    </Form.Item>
                    <Form.Item
                      label="3D Tour Konfiguratsiyasi (Pannellum)"
                      name="tour3d_config"
                      extra="Sahnalar va hotspot'larni qo'shing va tahrirlang. Panorama rasmlarni media kutubxonasidan tanlang."
                    >
                      {activeTab === 'tour3d' && (
                        <Tour3DEditor
                          value={form.getFieldValue('tour3d_config')}
                          onChange={(config) => {
                            form.setFieldsValue({ tour3d_config: config });
                          }}
                          mediaList={mediaList || []}
                        />
                      )}
                      {activeTab !== 'tour3d' && (
                        <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
                          "3D Tour" tab'iga o'ting
                        </div>
                      )}
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
        </Form>
      </Modal>

      {/* Media Library Modal for Branch Image */}
      <MediaLibraryModal
        open={imageModalOpen}
        onCancel={() => setImageModalOpen(false)}
        onSelect={handleSelectExistingMedia}
        fileType="image"
        selectedMediaIds={form.getFieldValue('imageId') ? [form.getFieldValue('imageId')] : []}
      />
    </div>
  );
}
