import { useState, useEffect, useRef } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  Card,
  Row,
  Col,
  Tabs,
  Switch,
  InputNumber,
  Select,
  Space,
  Table,
  Popconfirm,
  Image,
  Upload,
} from 'antd';
import {
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getHomepageSections,
  getHomepageLinks,
  getHomepagePlaceholders,
  getHomepageEmptyStates,
  getCatalogPageConfig,
  getCommonTexts,
  getAvailabilityStatuses,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
  createHomepageLink,
  updateHomepageLink,
  deleteHomepageLink,
  createHomepagePlaceholder,
  updateHomepagePlaceholder,
  deleteHomepagePlaceholder,
  createHomepageEmptyState,
  updateHomepageEmptyState,
  deleteHomepageEmptyState,
  updateCatalogPageConfig,
  createCommonText,
  updateCommonText,
  deleteCommonText,
  createAvailabilityStatus,
  updateAvailabilityStatus,
  deleteAvailabilityStatus,
  getMedia,
  uploadMedia,
  type HomepageSectionDto,
  type HomepageLinkDto,
  type HomepagePlaceholderDto,
  type HomepageEmptyStateDto,
  type CatalogPageConfigDto,
  type CommonTextDto,
  type AvailabilityStatusDto,
  type MediaDto,
  ApiError,
} from '../lib/api';
import MediaLibraryModal from './MediaLibraryModal';
import { compressImage } from '../utils/image-compression';
import { normalizeImageUrl } from '../utils/image';
import type { UploadProps } from 'antd';

const { TextArea } = Input;

export default function HomepageContentTab() {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState('sections');

  // Sections
  const { data: sections, isLoading: loadingSections, refetch: refetchSections } = useQuery<HomepageSectionDto[], ApiError>({
    queryKey: ['homepage-sections'],
    queryFn: getHomepageSections,
  });
  
  // Debug: log sections changes
  useEffect(() => {
    console.log('Sections data changed:', sections?.length, sections?.map(s => s.key));
  }, [sections]);

  // Links
  const { data: links, isLoading: loadingLinks } = useQuery<HomepageLinkDto[], ApiError>({
    queryKey: ['homepage-links'],
    queryFn: () => getHomepageLinks(),
  });

  // Placeholders
  const { data: placeholders, isLoading: loadingPlaceholders } = useQuery<HomepagePlaceholderDto[], ApiError>({
    queryKey: ['homepage-placeholders'],
    queryFn: getHomepagePlaceholders,
  });

  // Empty States
  const { data: emptyStates, isLoading: loadingEmptyStates } = useQuery<HomepageEmptyStateDto[], ApiError>({
    queryKey: ['homepage-empty-states'],
    queryFn: getHomepageEmptyStates,
  });

  // Catalog Config
  const { data: catalogConfig, isLoading: loadingCatalogConfig } = useQuery<CatalogPageConfigDto, ApiError>({
    queryKey: ['catalog-page-config'],
    queryFn: getCatalogPageConfig,
  });

  // Common Texts
  const { data: commonTexts, isLoading: loadingCommonTexts } = useQuery<CommonTextDto[], ApiError>({
    queryKey: ['common-texts'],
    queryFn: () => getCommonTexts(),
  });

  // Availability Statuses
  const { data: availabilityStatuses, isLoading: loadingAvailabilityStatuses } = useQuery<AvailabilityStatusDto[], ApiError>({
    queryKey: ['availability-statuses'],
    queryFn: getAvailabilityStatuses,
  });

  // Media
  const { data: mediaList } = useQuery<MediaDto[], ApiError>({
    queryKey: ['media'],
    queryFn: getMedia,
  });

  // Mutations
  const createSectionMutation = useMutation({
    mutationFn: async (payload: any) => {
      console.log('Mutation called with payload:', payload);
      try {
        const result = await createHomepageSection(payload);
        console.log('Mutation success, result:', result);
        return result;
      } catch (error) {
        console.error('Mutation error caught:', error);
        throw error;
      }
    },
    onSuccess: async (data) => {
      console.log('onSuccess called with data:', data);
      // Invalidate and refetch - this will update the sections list
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      // Use refetchSections directly for immediate update
      const result = await refetchSections();
      console.log('Sections refetched successfully:', result.data?.length, result.data?.map(s => s.key));
      message.success('Bo\'lim muvaffaqiyatli qo\'shildi');
    },
    onError: (error: ApiError) => {
      console.error('Create section error:', error);
      console.error('Error status:', error.status);
      console.error('Error message:', error.message);
      const errorMessage = error.message || 'Bo\'lim qo\'shishda xatolik yuz berdi';
      message.error(errorMessage);
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ key, data }: { key: string; data: any }) => updateHomepageSection(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      message.success('Bo\'lim saqlandi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: deleteHomepageSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      message.success('Bo\'lim o\'chirildi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const createLinkMutation = useMutation({
    mutationFn: createHomepageLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-links'] });
      message.success('Link qo\'shildi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const updateLinkMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateHomepageLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-links'] });
      message.success('Link yangilandi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const deleteLinkMutation = useMutation({
    mutationFn: deleteHomepageLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-links'] });
      message.success('Link o\'chirildi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const createPlaceholderMutation = useMutation({
    mutationFn: createHomepagePlaceholder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-placeholders'] });
      message.success('Placeholder qo\'shildi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const updatePlaceholderMutation = useMutation({
    mutationFn: ({ sectionKey, data }: { sectionKey: string; data: any }) => updateHomepagePlaceholder(sectionKey, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-placeholders'] });
      message.success('Placeholder saqlandi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const deletePlaceholderMutation = useMutation({
    mutationFn: deleteHomepagePlaceholder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-placeholders'] });
      message.success('Placeholder o\'chirildi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const createEmptyStateMutation = useMutation({
    mutationFn: createHomepageEmptyState,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-empty-states'] });
      message.success('Bo\'sh holat xabari qo\'shildi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const updateEmptyStateMutation = useMutation({
    mutationFn: ({ sectionKey, data }: { sectionKey: string; data: any }) => updateHomepageEmptyState(sectionKey, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-empty-states'] });
      message.success('Bo\'sh holat xabari saqlandi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const deleteEmptyStateMutation = useMutation({
    mutationFn: deleteHomepageEmptyState,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-empty-states'] });
      message.success('Bo\'sh holat xabari o\'chirildi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const updateCatalogConfigMutation = useMutation({
    mutationFn: updateCatalogPageConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-page-config'] });
      message.success('Catalog config saqlandi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const createCommonTextMutation = useMutation({
    mutationFn: createCommonText,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['common-texts'] });
      message.success('Umumiy matn qo\'shildi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const updateCommonTextMutation = useMutation({
    mutationFn: ({ key, data }: { key: string; data: any }) => updateCommonText(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['common-texts'] });
      message.success('Umumiy matn saqlandi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const deleteCommonTextMutation = useMutation({
    mutationFn: deleteCommonText,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['common-texts'] });
      message.success('Umumiy matn o\'chirildi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const createAvailabilityStatusMutation = useMutation({
    mutationFn: createAvailabilityStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-statuses'] });
      message.success('Mavjudlik holati qo\'shildi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const updateAvailabilityStatusMutation = useMutation({
    mutationFn: ({ key, data }: { key: string; data: any }) => updateAvailabilityStatus(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-statuses'] });
      message.success('Mavjudlik holati saqlandi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  const deleteAvailabilityStatusMutation = useMutation({
    mutationFn: deleteAvailabilityStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-statuses'] });
      message.success('Mavjudlik holati o\'chirildi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });


  return (
    <Tabs
      activeKey={activeSubTab}
      onChange={setActiveSubTab}
      items={[
        {
          key: 'sections',
          label: 'Bo\'limlar',
          children: (
            <SectionsTab
              sections={sections || []}
              onCreate={createSectionMutation.mutateAsync}
              onUpdate={updateSectionMutation.mutate}
              onDelete={deleteSectionMutation.mutate}
              isLoading={loadingSections || createSectionMutation.isPending || updateSectionMutation.isPending || deleteSectionMutation.isPending}
            />
          ),
        },
        {
          key: 'links',
          label: 'Linklar',
          children: (
            <LinksTab
              links={links || []}
              onCreate={createLinkMutation.mutate}
              onUpdate={updateLinkMutation.mutate}
              onDelete={deleteLinkMutation.mutate}
              isLoading={loadingLinks || createLinkMutation.isPending || updateLinkMutation.isPending || deleteLinkMutation.isPending}
            />
          ),
        },
        {
          key: 'placeholders',
          label: 'Placeholder rasmlar',
          children: (
            <PlaceholdersTab
              placeholders={placeholders || []}
              mediaList={mediaList || []}
              onCreate={createPlaceholderMutation.mutate}
              onUpdate={updatePlaceholderMutation.mutate}
              onDelete={deletePlaceholderMutation.mutate}
              isLoading={loadingPlaceholders || createPlaceholderMutation.isPending || updatePlaceholderMutation.isPending || deletePlaceholderMutation.isPending}
            />
          ),
        },
        {
          key: 'empty-states',
          label: 'Bo\'sh holat xabarlari',
          children: (
            <EmptyStatesTab
              emptyStates={emptyStates || []}
              onCreate={createEmptyStateMutation.mutate}
              onUpdate={updateEmptyStateMutation.mutate}
              onDelete={deleteEmptyStateMutation.mutate}
              isLoading={loadingEmptyStates || createEmptyStateMutation.isPending || updateEmptyStateMutation.isPending || deleteEmptyStateMutation.isPending}
            />
          ),
        },
        {
          key: 'catalog-config',
          label: 'Katalog sozlamalari',
          children: (
            <CatalogConfigTab
              config={catalogConfig}
              onUpdate={updateCatalogConfigMutation.mutate}
              isLoading={loadingCatalogConfig || updateCatalogConfigMutation.isPending}
            />
          ),
        },
        {
          key: 'common-texts',
          label: 'Umumiy matnlar',
          children: (
            <CommonTextsTab
              texts={commonTexts || []}
              onCreate={createCommonTextMutation.mutate}
              onUpdate={updateCommonTextMutation.mutate}
              onDelete={deleteCommonTextMutation.mutate}
              isLoading={loadingCommonTexts || createCommonTextMutation.isPending || updateCommonTextMutation.isPending || deleteCommonTextMutation.isPending}
            />
          ),
        },
        {
          key: 'availability-statuses',
          label: 'Mavjudlik holatlari',
          children: (
            <AvailabilityStatusesTab
              statuses={availabilityStatuses || []}
              onCreate={createAvailabilityStatusMutation.mutate}
              onUpdate={updateAvailabilityStatusMutation.mutate}
              onDelete={deleteAvailabilityStatusMutation.mutate}
              isLoading={loadingAvailabilityStatuses || createAvailabilityStatusMutation.isPending || updateAvailabilityStatusMutation.isPending || deleteAvailabilityStatusMutation.isPending}
            />
          ),
        },
      ]}
    />
  );
}

// Sections Tab Component
function SectionsTab({
  sections,
  onCreate,
  onUpdate,
  onDelete,
  isLoading,
}: {
  sections: HomepageSectionDto[];
  onCreate: (data: any) => Promise<any>;
  onUpdate: (data: { key: string; data: any }) => void;
  onDelete: (key: string) => void;
  isLoading: boolean;
}) {
  console.log('SectionsTab rendered with sections:', sections?.length, sections?.map(s => s.key));
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form] = Form.useForm();
  const previousSectionsCount = useRef(sections.length);
  const previousSectionsKeys = useRef<string[]>(sections.map(s => s.key));
  
  // Close form after successful creation
  useEffect(() => {
    const currentKeys = sections.map(s => s.key);
    const previousKeys = previousSectionsKeys.current;
    
    console.log('Sections changed:', {
      previousCount: previousSectionsCount.current,
      currentCount: sections.length,
      previousKeys,
      currentKeys,
      showCreateForm,
    });
    
    // Check if a new section was added (by comparing keys)
    const newKeys = currentKeys.filter(key => !previousKeys.includes(key));
    
    if (newKeys.length > 0 && showCreateForm) {
      console.log('New section(s) detected:', newKeys);
      // New section was added, close the form
      form.resetFields();
      setShowCreateForm(false);
      previousSectionsCount.current = sections.length;
      previousSectionsKeys.current = currentKeys;
    } else if (sections.length !== previousSectionsCount.current) {
      // Sections count changed, update refs
      previousSectionsCount.current = sections.length;
      previousSectionsKeys.current = currentKeys;
    }
  }, [sections, showCreateForm, form]);

  const handleSave = (section: HomepageSectionDto) => {
    const values = form.getFieldsValue();
    onUpdate({
      key: section.key,
      data: values,
    });
    setEditingKey(null);
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      console.log('Creating section with values:', values);
      // Ensure all required fields are present with defaults
      const payload = {
        key: values.key,
        title_uz: values.title_uz || null,
        title_ru: values.title_ru || null,
        subtitle_uz: values.subtitle_uz || null,
        subtitle_ru: values.subtitle_ru || null,
        description_uz: values.description_uz || null,
        description_ru: values.description_ru || null,
        showTitle: values.showTitle !== undefined ? values.showTitle : true,
        showSubtitle: values.showSubtitle !== undefined ? values.showSubtitle : false,
        showDescription: values.showDescription !== undefined ? values.showDescription : false,
        order: values.order !== undefined ? values.order : 0,
        status: values.status || 'published',
      };
      console.log('Payload being sent:', payload);
      await onCreate(payload);
      // Form will be closed automatically when sections list updates (see useEffect above)
      form.resetFields();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Validation or creation error:', error);
      // Error is already handled in mutation's onError callback
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          Yangi bo'lim qo'shish
        </Button>
      </div>

      {showCreateForm && (
        <Card title="Yangi bo'lim qo'shish" style={{ marginBottom: 16 }}>
          <Form form={form} layout="vertical" onFinish={handleCreate}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Kalit (key)" name="key" rules={[{ required: true, message: 'Kalit kiritilishi kerak' }]}>
                  <Input placeholder="services, hearing-aids, interacoustics" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Sarlavha (O'zbek)" name="title_uz">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Sarlavha (Rus)" name="title_ru">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Kichik sarlavha (O'zbek)" name="subtitle_uz">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Kichik sarlavha (Rus)" name="subtitle_ru">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Tavsif (O'zbek)" name="description_uz">
                  <TextArea rows={3} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Tavsif (Rus)" name="description_ru">
                  <TextArea rows={3} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Sarlavhani ko'rsatish" name="showTitle" valuePropName="checked" initialValue={true}>
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Kichik sarlavhani ko'rsatish" name="showSubtitle" valuePropName="checked" initialValue={false}>
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Tavsifni ko'rsatish" name="showDescription" valuePropName="checked" initialValue={false}>
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Tartib raqami" name="order" initialValue={0}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Holati" name="status" initialValue="published">
                  <Select>
                    <Select.Option value="published">Nashr etilgan</Select.Option>
                    <Select.Option value="draft">Qoralama</Select.Option>
                    <Select.Option value="hidden">Yashirin</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Space>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Qo'shish
              </Button>
              <Button onClick={() => {
                setShowCreateForm(false);
                form.resetFields();
              }}>
                Bekor qilish
              </Button>
            </Space>
          </Form>
        </Card>
      )}

      {!sections || sections.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
          Hech qanday bo'lim topilmadi. Yangi bo'lim qo'shing.
        </div>
      ) : (
        sections.map((section) => {
          console.log('Rendering section:', section.key, section.id);
          return (
          <Card
          key={section.id}
          title={section.key}
          extra={
            editingKey === section.key ? (
              <Space>
                <Button size="small" onClick={() => setEditingKey(null)}>
                  Bekor qilish
                </Button>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleSave(section)}
                  loading={isLoading}
                >
                  Saqlash
                </Button>
              </Space>
            ) : (
              <Space>
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => {
                    setEditingKey(section.key);
                    form.setFieldsValue(section);
                  }}
                >
                  Tahrirlash
                </Button>
                <Popconfirm
                  title="Bu bo'limni o'chirishni xohlaysizmi?"
                  onConfirm={() => onDelete(section.key)}
                  okText="Ha"
                  cancelText="Yo'q"
                >
                  <Button icon={<DeleteOutlined />} size="small" danger>
                    O'chirish
                  </Button>
                </Popconfirm>
              </Space>
            )
          }
          style={{ marginBottom: 16 }}
        >
          {editingKey === section.key ? (
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Sarlavha (O'zbek)" name="title_uz">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Sarlavha (Rus)" name="title_ru">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Kichik sarlavha (O'zbek)" name="subtitle_uz">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Kichik sarlavha (Rus)" name="subtitle_ru">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Tavsif (O'zbek)" name="description_uz">
                    <TextArea rows={3} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Tavsif (Rus)" name="description_ru">
                    <TextArea rows={3} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Sarlavhani ko'rsatish" name="showTitle" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Kichik sarlavhani ko'rsatish" name="showSubtitle" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Tavsifni ko'rsatish" name="showDescription" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Tartib raqami" name="order">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Holati" name="status">
                    <Select>
                      <Select.Option value="published">Nashr etilgan</Select.Option>
                      <Select.Option value="draft">Qoralama</Select.Option>
                      <Select.Option value="hidden">Yashirin</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          ) : (
            <div>
              <p><strong>Sarlavha (O'zbek):</strong> {section.title_uz || '-'}</p>
              <p><strong>Sarlavha (Rus):</strong> {section.title_ru || '-'}</p>
              <p><strong>Kichik sarlavha (O'zbek):</strong> {section.subtitle_uz || '-'}</p>
              <p><strong>Kichik sarlavha (Rus):</strong> {section.subtitle_ru || '-'}</p>
              <p><strong>Sarlavhani ko'rsatish:</strong> {section.showTitle ? 'Ha' : 'Yo\'q'}</p>
              <p><strong>Kichik sarlavhani ko'rsatish:</strong> {section.showSubtitle ? 'Ha' : 'Yo\'q'}</p>
              <p><strong>Tavsifni ko'rsatish:</strong> {section.showDescription ? 'Ha' : 'Yo\'q'}</p>
              <p><strong>Tartib raqami:</strong> {section.order}</p>
              <p><strong>Holati:</strong> {section.status === 'published' ? 'Nashr etilgan' : section.status === 'draft' ? 'Qoralama' : 'Yashirin'}</p>
            </div>
          )}
        </Card>
          );
        })
      )}
    </div>
  );
}

// Links Tab Component
function LinksTab({
  links,
  onCreate,
  onUpdate,
  onDelete,
  isLoading,
}: {
  links: HomepageLinkDto[];
  onCreate: (data: any) => void;
  onUpdate: (data: { id: string; data: any }) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}) {
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreate = () => {
    const values = form.getFieldsValue();
    onCreate(values);
    form.resetFields();
    setShowCreateForm(false);
  };

  const handleUpdate = (link: HomepageLinkDto) => {
    const values = form.getFieldsValue();
    onUpdate({ id: link.id, data: values });
    setEditingId(null);
  };

  const columns = [
    {
      title: 'Bo\'lim kaliti',
      dataIndex: 'sectionKey',
      key: 'sectionKey',
    },
    {
      title: 'Matn (O\'zbek)',
      dataIndex: 'text_uz',
      key: 'text_uz',
    },
    {
      title: 'Matn (Rus)',
      dataIndex: 'text_ru',
      key: 'text_ru',
    },
    {
      title: 'Havola',
      dataIndex: 'href',
      key: 'href',
    },
    {
      title: 'Joylashuvi',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (_: any, record: HomepageLinkDto) => (
        <Space>
          {editingId === record.id ? (
            <>
              <Button size="small" onClick={() => setEditingId(null)}>
                Bekor qilish
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={() => handleUpdate(record)}
                loading={isLoading}
              >
                Saqlash
              </Button>
            </>
          ) : (
            <>
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => {
                  setEditingId(record.id);
                  form.setFieldsValue(record);
                }}
              >
                Tahrirlash
              </Button>
              <Popconfirm
                title="Bu linkni o'chirishni xohlaysizmi?"
                onConfirm={() => onDelete(record.id)}
                okText="Ha"
                cancelText="Yo'q"
              >
                <Button icon={<DeleteOutlined />} size="small" danger>
                  O'chirish
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          Yangi link qo'shish
        </Button>
      </div>

      {showCreateForm && (
        <Card title="Yangi link qo'shish" style={{ marginBottom: 16 }}>
          <Form form={form} layout="vertical" onFinish={handleCreate}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Bo'lim kaliti" name="sectionKey" rules={[{ required: true, message: 'Bo\'lim kaliti kiritilishi kerak' }]}>
                  <Input placeholder="services, hearing-aids, interacoustics" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Joylashuvi" name="position" rules={[{ required: true, message: 'Joylashuv tanlanishi kerak' }]}>
                  <Select>
                    <Select.Option value="bottom">Pastda</Select.Option>
                    <Select.Option value="header">Yuqorida</Select.Option>
                    <Select.Option value="inline">Ichida</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Matn (O'zbek)" name="text_uz" rules={[{ required: true, message: 'Matn kiritilishi kerak' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Matn (Rus)" name="text_ru" rules={[{ required: true, message: 'Matn kiritilishi kerak' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Havola" name="href" rules={[{ required: true, message: 'Havola kiritilishi kerak' }]}>
                  <Input placeholder="/catalog, /services/{slug}" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Ikona" name="icon">
                  <Input placeholder="arrow-right" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Tartib raqami" name="order">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Holati" name="status">
                  <Select>
                    <Select.Option value="published">Nashr etilgan</Select.Option>
                    <Select.Option value="draft">Qoralama</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Qo'shish
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setShowCreateForm(false)}>
              Bekor qilish
            </Button>
          </Form>
        </Card>
      )}

      <Table
        columns={columns}
        dataSource={links}
        rowKey="id"
        pagination={false}
        expandable={{
          expandedRowRender: (record) => {
            if (editingId === record.id) {
              return (
                <Form form={form} layout="vertical">
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item label="Bo'lim kaliti" name="sectionKey">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Joylashuvi" name="position">
                        <Select>
                          <Select.Option value="bottom">Pastda</Select.Option>
                          <Select.Option value="header">Yuqorida</Select.Option>
                          <Select.Option value="inline">Ichida</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Matn (O'zbek)" name="text_uz">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Matn (Rus)" name="text_ru">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Havola" name="href">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Ikona" name="icon">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Tartib raqami" name="order">
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Holati" name="status">
                        <Select>
                          <Select.Option value="published">Nashr etilgan</Select.Option>
                          <Select.Option value="draft">Qoralama</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              );
            }
            return null;
          },
        }}
      />
    </div>
  );
}

// Placeholders Tab Component
function PlaceholdersTab({
  placeholders,
  mediaList,
  onUpdate,
  isLoading,
}: {
  placeholders: HomepagePlaceholderDto[];
  mediaList: MediaDto[];
  onUpdate: (data: { sectionKey: string; data: any }) => void;
  isLoading: boolean;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [imageModals, setImageModals] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const handleSave = (placeholder: HomepagePlaceholderDto) => {
    const values = form.getFieldsValue();
    onUpdate({
      sectionKey: placeholder.sectionKey,
      data: values,
    });
    setEditingKey(null);
  };

  const handleImageUpload = async (options: any, sectionKey: string) => {
    const { file, onSuccess, onError } = options;
    setUploading({ ...uploading, [sectionKey]: true });
    try {
      const compressedFile = await compressImage(file as File);
      const media = await uploadMedia(compressedFile);
      form.setFieldsValue({ imageId: media.id });
      onSuccess?.(media);
    } catch (error) {
      const apiError = error as ApiError;
      message.error(apiError.message || 'Rasm yuklashda xatolik');
      onError?.(error as Error);
    } finally {
      setUploading({ ...uploading, [sectionKey]: false });
    }
  };

  return (
    <div>
      {placeholders.map((placeholder) => (
        <Card
          key={placeholder.id}
          title={placeholder.sectionKey}
          extra={
            editingKey === placeholder.sectionKey ? (
              <Space>
                <Button size="small" onClick={() => setEditingKey(null)}>
                  Bekor qilish
                </Button>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleSave(placeholder)}
                  loading={isLoading}
                >
                  Saqlash
                </Button>
              </Space>
            ) : (
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => {
                  setEditingKey(placeholder.sectionKey);
                  form.setFieldsValue(placeholder);
                }}
              >
                Tahrirlash
              </Button>
            )
          }
          style={{ marginBottom: 16 }}
        >
          {editingKey === placeholder.sectionKey ? (
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Matn (O'zbek)" name="text_uz">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Matn (Rus)" name="text_ru">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Fon rangi" name="backgroundColor">
                    <Input type="color" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Matn rangi" name="textColor">
                    <Input type="color" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Shrift o'lchami" name="fontSize">
                    <Input placeholder="text-lg, text-xs" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Shrift og'irligi" name="fontWeight">
                    <Input placeholder="font-bold" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Rasm" name="imageId">
                    <div>
                      {placeholder.image && (
                        <Image
                          src={normalizeImageUrl(placeholder.image.url)}
                          alt="Placeholder"
                          style={{ maxWidth: '100%', maxHeight: '200px', marginBottom: 8 }}
                          preview={false}
                        />
                      )}
                      <Space>
                        <Upload
                          customRequest={(options) => handleImageUpload(options, placeholder.sectionKey)}
                          showUploadList={false}
                          accept="image/*"
                        >
                          <Button icon={<UploadOutlined />} loading={uploading[placeholder.sectionKey]}>
                            Rasm yuklash
                          </Button>
                        </Upload>
                        <Button
                          icon={<FolderOutlined />}
                          onClick={() => setImageModals({ ...imageModals, [placeholder.sectionKey]: true })}
                        >
                          Mavjud rasmdan tanlash
                        </Button>
                      </Space>
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          ) : (
            <div>
              <p><strong>Matn (O'zbek):</strong> {placeholder.text_uz || '-'}</p>
              <p><strong>Matn (Rus):</strong> {placeholder.text_ru || '-'}</p>
              <p><strong>Fon rangi:</strong> {placeholder.backgroundColor || '-'}</p>
              <p><strong>Matn rangi:</strong> {placeholder.textColor || '-'}</p>
              {placeholder.image && (
                <Image
                  src={normalizeImageUrl(placeholder.image.url)}
                  alt="Placeholder"
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                  preview={false}
                />
              )}
            </div>
          )}
          <MediaLibraryModal
            open={imageModals[placeholder.sectionKey] || false}
            onCancel={() => setImageModals({ ...imageModals, [placeholder.sectionKey]: false })}
            onSelect={(media) => {
              form.setFieldsValue({ imageId: media.id });
              setImageModals({ ...imageModals, [placeholder.sectionKey]: false });
            }}
            fileType="image"
            selectedMediaIds={placeholder.imageId ? [placeholder.imageId] : []}
          />
        </Card>
      ))}
    </div>
  );
}

// Empty States Tab Component
function EmptyStatesTab({
  emptyStates,
  onUpdate,
  isLoading,
}: {
  emptyStates: HomepageEmptyStateDto[];
  onUpdate: (data: { sectionKey: string; data: any }) => void;
  isLoading: boolean;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleSave = (emptyState: HomepageEmptyStateDto) => {
    const values = form.getFieldsValue();
    onUpdate({
      sectionKey: emptyState.sectionKey,
      data: values,
    });
    setEditingKey(null);
  };

  return (
    <div>
      {emptyStates.map((emptyState) => (
        <Card
          key={emptyState.id}
          title={emptyState.sectionKey}
          extra={
            editingKey === emptyState.sectionKey ? (
              <Space>
                <Button size="small" onClick={() => setEditingKey(null)}>
                  Bekor qilish
                </Button>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleSave(emptyState)}
                  loading={isLoading}
                >
                  Saqlash
                </Button>
              </Space>
            ) : (
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => {
                  setEditingKey(emptyState.sectionKey);
                  form.setFieldsValue(emptyState);
                }}
              >
                Tahrirlash
              </Button>
            )
          }
          style={{ marginBottom: 16 }}
        >
          {editingKey === emptyState.sectionKey ? (
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Xabar (O'zbek)" name="message_uz" rules={[{ required: true, message: 'Xabar kiritilishi kerak' }]}>
                    <TextArea rows={3} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Xabar (Rus)" name="message_ru" rules={[{ required: true, message: 'Xabar kiritilishi kerak' }]}>
                    <TextArea rows={3} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Ikona" name="icon">
                    <Input placeholder="info, empty-box" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          ) : (
            <div>
              <p><strong>Xabar (O'zbek):</strong> {emptyState.message_uz}</p>
              <p><strong>Xabar (Rus):</strong> {emptyState.message_ru}</p>
              <p><strong>Ikona:</strong> {emptyState.icon || '-'}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// Catalog Config Tab Component
function CatalogConfigTab({
  config,
  onUpdate,
  isLoading,
}: {
  config?: CatalogPageConfigDto;
  onUpdate: (data: any) => void;
  isLoading: boolean;
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (config) {
      form.setFieldsValue(config);
    }
  }, [config, form]);

  const handleSave = () => {
    const values = form.getFieldsValue();
    onUpdate(values);
  };

  return (
    <Card
      title="Katalog sahifasi sozlamalari"
      extra={
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={isLoading}
        >
          Saqlash
        </Button>
      }
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Eshitish apparatlari sarlavhasi (O'zbek)" name="hearingAidsTitle_uz">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Eshitish apparatlari sarlavhasi (Rus)" name="hearingAidsTitle_ru">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Interacoustics sarlavhasi (O'zbek)" name="interacousticsTitle_uz">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Interacoustics sarlavhasi (Rus)" name="interacousticsTitle_ru">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Aksessuarlar sarlavhasi (O'zbek)" name="accessoriesTitle_uz">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Aksessuarlar sarlavhasi (Rus)" name="accessoriesTitle_ru">
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}

// Common Texts Tab Component
function CommonTextsTab({
  texts,
  onUpdate,
  isLoading,
}: {
  texts: CommonTextDto[];
  onUpdate: (data: { key: string; data: any }) => void;
  isLoading: boolean;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleSave = (text: CommonTextDto) => {
    const values = form.getFieldsValue();
    onUpdate({
      key: text.key,
      data: values,
    });
    setEditingKey(null);
  };

  return (
    <div>
      {texts.map((text) => (
        <Card
          key={text.id}
          title={text.key}
          extra={
            editingKey === text.key ? (
              <Space>
                <Button size="small" onClick={() => setEditingKey(null)}>
                  Bekor qilish
                </Button>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleSave(text)}
                  loading={isLoading}
                >
                  Saqlash
                </Button>
              </Space>
            ) : (
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => {
                  setEditingKey(text.key);
                  form.setFieldsValue(text);
                }}
              >
                Tahrirlash
              </Button>
            )
          }
          style={{ marginBottom: 16 }}
        >
          {editingKey === text.key ? (
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Matn (O'zbek)" name="text_uz" rules={[{ required: true, message: 'Matn kiritilishi kerak' }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Matn (Rus)" name="text_ru" rules={[{ required: true, message: 'Matn kiritilishi kerak' }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Kategoriya" name="category">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          ) : (
            <div>
              <p><strong>Matn (O'zbek):</strong> {text.text_uz}</p>
              <p><strong>Matn (Rus):</strong> {text.text_ru}</p>
              <p><strong>Kategoriya:</strong> {text.category}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// Availability Statuses Tab Component
function AvailabilityStatusesTab({
  statuses,
  onUpdate,
  isLoading,
}: {
  statuses: AvailabilityStatusDto[];
  onUpdate: (data: { key: string; data: any }) => void;
  isLoading: boolean;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleSave = (status: AvailabilityStatusDto) => {
    const values = form.getFieldsValue();
    onUpdate({
      key: status.key,
      data: values,
    });
    setEditingKey(null);
  };

  return (
    <div>
      {statuses.map((status) => (
        <Card
          key={status.id}
          title={status.key}
          extra={
            editingKey === status.key ? (
              <Space>
                <Button size="small" onClick={() => setEditingKey(null)}>
                  Bekor qilish
                </Button>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleSave(status)}
                  loading={isLoading}
                >
                  Saqlash
                </Button>
              </Space>
            ) : (
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => {
                  setEditingKey(status.key);
                  form.setFieldsValue(status);
                }}
              >
                Tahrirlash
              </Button>
            )
          }
          style={{ marginBottom: 16 }}
        >
          {editingKey === status.key ? (
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Yorliq (O'zbek)" name="label_uz" rules={[{ required: true, message: 'Yorliq kiritilishi kerak' }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Yorliq (Rus)" name="label_ru" rules={[{ required: true, message: 'Yorliq kiritilishi kerak' }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Schema URL" name="schema">
                    <Input placeholder="https://schema.org/InStock" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Rang klassi" name="colorClass">
                    <Input placeholder="text-green-600 bg-green-50" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Tartib raqami" name="order">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          ) : (
            <div>
              <p><strong>Yorliq (O'zbek):</strong> {status.label_uz}</p>
              <p><strong>Yorliq (Rus):</strong> {status.label_ru}</p>
              <p><strong>Schema URL:</strong> {status.schema || '-'}</p>
              <p><strong>Rang klassi:</strong> {status.colorClass || '-'}</p>
              <p><strong>Tartib raqami:</strong> {status.order}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

