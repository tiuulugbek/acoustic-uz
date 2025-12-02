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
  Upload,
} from 'antd';
import { UploadOutlined, FolderOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadMedia,
  getMedia,
  type BrandDto,
  type CreateBrandPayload,
  type UpdateBrandPayload,
  type MediaDto,
  ApiError,
} from '../lib/api';
import { normalizeImageUrl } from '../utils/image';
import MediaLibraryModal from '../components/MediaLibraryModal';
import { compressImage } from '../utils/image-compression';
import { createSlug } from '../utils/slug';

export default function BrandsPage() {
  const queryClient = useQueryClient();
  const { data: brands, isLoading } = useQuery<BrandDto[], ApiError>({
    queryKey: ['brands'],
    queryFn: getBrands,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandDto | null>(null);
  const [form] = Form.useForm();
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);

  const { data: mediaList } = useQuery<MediaDto[], ApiError>({
    queryKey: ['media'],
    queryFn: getMedia,
  });

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
    setPreviewLogo(null);
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
    setPreviewLogo(brand.logo?.url ? normalizeImageUrl(brand.logo.url) : null);
    setIsModalOpen(true);
  };

  const handleLogoUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploadingLogo(true);
    try {
      const compressedFile = await compressImage(file as File);
      const media = await uploadMedia(compressedFile);
      if (!media || !media.id) {
        throw new Error('Media yuklanmadi');
      }
      form.setFieldsValue({ logoId: media.id });
      const normalizedUrl = normalizeImageUrl(media.url);
      setPreviewLogo(normalizedUrl);
      message.success('Logo yuklandi');
      queryClient.invalidateQueries({ queryKey: ['media'] });
      onSuccess?.(media);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Logo upload error:', error);
      message.error(apiError.message || 'Logo yuklashda xatolik');
      onError?.(error as Error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    form.setFieldsValue({ logoId: undefined });
    setPreviewLogo(null);
  };

  const handleSelectExistingLogo = (mediaId: string, mediaUrl: string) => {
    form.setFieldsValue({ logoId: mediaId });
    setPreviewLogo(normalizeImageUrl(mediaUrl));
    setLogoModalOpen(false);
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
          <Form.Item label="Logo" name="logoId">
            <div>
              {previewLogo ? (
                <div style={{ marginBottom: 16 }}>
                  <img
                    src={previewLogo}
                    alt="Logo preview"
                    style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain', border: '1px solid #d9d9d9', borderRadius: 4, padding: 8 }}
                  />
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleRemoveLogo}
                    style={{ marginTop: 8 }}
                  >
                    O'chirish
                  </Button>
                </div>
              ) : null}
              
              <Upload
                customRequest={handleLogoUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} loading={uploadingLogo} block>
                  {previewLogo ? 'Logoni almashtirish' : 'Logo yuklash'}
                </Button>
              </Upload>

              {/* Select from existing media */}
              <div style={{ marginTop: 16 }}>
                <Button
                  icon={<FolderOutlined />}
                  onClick={() => setLogoModalOpen(true)}
                  block
                  style={{ marginBottom: 8 }}
                >
                  Mavjud rasmdan tanlash
                </Button>
                {form.getFieldValue('logoId') && (
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    Tanlangan: {mediaList?.find(m => m.id === form.getFieldValue('logoId'))?.filename || 'Noma\'lum'}
                  </div>
                )}
              </div>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Media Library Modal for Logo */}
      <MediaLibraryModal
        open={logoModalOpen}
        onCancel={() => setLogoModalOpen(false)}
        onSelect={(media) => handleSelectExistingLogo(media.id, media.url)}
        fileType="image"
        selectedMediaIds={form.getFieldValue('logoId') ? [form.getFieldValue('logoId')] : []}
      />
    </div>
  );
}
