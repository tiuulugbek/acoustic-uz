import { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  Card,
  Row,
  Col,
  Upload,
  Image,
  Space,
  Divider,
  Select,
  Alert,
  Tag,
} from 'antd';
import { UploadOutlined, DeleteOutlined, SaveOutlined, FolderOutlined, CheckCircleOutlined, CloseCircleOutlined, LinkOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSettings,
  updateSettings,
  getMedia,
  uploadMedia,
  getAmoCRMAuthUrl,
  testAmoCRMConnection,
  type SettingsDto,
  type UpdateSettingsPayload,
  type MediaDto,
  ApiError,
} from '../lib/api';
import MediaLibraryModal from '../components/MediaLibraryModal';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [uploadingCatalogHero, setUploadingCatalogHero] = useState(false);
  const [previewCatalogHero, setPreviewCatalogHero] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [catalogHeroModalOpen, setCatalogHeroModalOpen] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [testingAmoCRM, setTestingAmoCRM] = useState(false);
  const [amocrmTestResult, setAmocrmTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Helper function to normalize image URLs - same as Media.tsx
  const normalizeImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/uploads/')) {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const baseUrl = apiBase.replace('/api', '');
      return `${baseUrl}${url}`;
    }
    return url;
  };

  const { data: settings, isLoading } = useQuery<SettingsDto, ApiError>({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  const { data: mediaList } = useQuery<MediaDto[], ApiError>({
    queryKey: ['media'],
    queryFn: getMedia,
  });

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      message.success('Sozlamalar saqlandi');
    },
    onError: (error: ApiError) => message.error(error.message || 'Xatolik yuz berdi'),
  });

  // Initialize form when settings load
  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        phonePrimary: settings.phonePrimary || '',
        phoneSecondary: settings.phoneSecondary || '',
        email: settings.email || '',
        telegramBotToken: settings.telegramBotToken || '',
        telegramChatId: settings.telegramChatId || '',
        brandPrimary: settings.brandPrimary || '#F07E22',
        brandAccent: settings.brandAccent || '#3F3091',
        catalogHeroImageId: settings.catalogHeroImageId || null,
        logoId: settings.logoId || null,
        // AmoCRM settings
        amocrmDomain: settings.amocrmDomain || '',
        amocrmClientId: settings.amocrmClientId || '',
        amocrmClientSecret: settings.amocrmClientSecret || '',
        amocrmPipelineId: settings.amocrmPipelineId || '',
        amocrmStatusId: settings.amocrmStatusId || '',
      });
      if (settings.catalogHeroImage?.url) {
        setPreviewCatalogHero(normalizeImageUrl(settings.catalogHeroImage.url));
      }
      if (settings.logo?.url) {
        setPreviewLogo(normalizeImageUrl(settings.logo.url));
      }
    }
  }, [settings, form]);

  // Check URL params for OAuth callback results
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const error = params.get('error');
    
    if (success === 'amocrm_connected') {
      message.success('AmoCRM integratsiyasi muvaffaqiyatli ulandi!');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (error) {
      const errorMessages: Record<string, string> = {
        no_code: 'AmoCRM avtorizatsiya kodi topilmadi',
        not_configured: 'AmoCRM sozlamalari to\'liq emas',
        oauth_failed: 'AmoCRM avtorizatsiyasi muvaffaqiyatsiz',
      };
      message.error(errorMessages[error] || 'Xatolik yuz berdi');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [queryClient]);

  const handleAmoCRMAuthorize = async () => {
    try {
      const { authUrl } = await getAmoCRMAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      const apiError = error as ApiError;
      message.error(apiError.message || 'Avtorizatsiya URL olishda xatolik');
    }
  };

  const handleTestAmoCRM = async () => {
    setTestingAmoCRM(true);
    setAmocrmTestResult(null);
    try {
      const result = await testAmoCRMConnection();
      setAmocrmTestResult({
        success: result.success,
        message: result.message,
      });
      if (result.success) {
        message.success('AmoCRM ulanishi muvaffaqiyatli!');
      } else {
        message.warning(result.message);
      }
    } catch (error) {
      const apiError = error as ApiError;
      setAmocrmTestResult({
        success: false,
        message: apiError.message || 'Test muvaffaqiyatsiz',
      });
      message.error(apiError.message || 'Test muvaffaqiyatsiz');
    } finally {
      setTestingAmoCRM(false);
    }
  };

  const handleCatalogHeroUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploadingCatalogHero(true);
    try {
      const media = await uploadMedia(file as File);
      form.setFieldsValue({ catalogHeroImageId: media.id });
      setPreviewCatalogHero(normalizeImageUrl(media.url));
      message.success('Rasm yuklandi');
      queryClient.invalidateQueries({ queryKey: ['media'] });
      onSuccess?.(media);
    } catch (error) {
      const apiError = error as ApiError;
      message.error(apiError.message || 'Rasm yuklashda xatolik');
      onError?.(error as Error);
    } finally {
      setUploadingCatalogHero(false);
    }
  };

  const handleRemoveCatalogHero = () => {
    form.setFieldsValue({ catalogHeroImageId: null });
    setPreviewCatalogHero(null);
  };

  const handleSelectExistingCatalogHero = (mediaId: string, mediaUrl: string) => {
    form.setFieldsValue({ catalogHeroImageId: mediaId });
    setPreviewCatalogHero(normalizeImageUrl(mediaUrl));
  };

  const handleLogoUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploadingLogo(true);
    try {
      const media = await uploadMedia(file as File);
      form.setFieldsValue({ logoId: media.id });
      setPreviewLogo(normalizeImageUrl(media.url));
      message.success('Logo yuklandi');
      queryClient.invalidateQueries({ queryKey: ['media'] });
      onSuccess?.(media);
    } catch (error) {
      const apiError = error as ApiError;
      message.error(apiError.message || 'Logo yuklashda xatolik');
      onError?.(error as Error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    form.setFieldsValue({ logoId: null });
    setPreviewLogo(null);
  };

  const handleSelectExistingLogo = (mediaId: string, mediaUrl: string) => {
    form.setFieldsValue({ logoId: mediaId });
    setPreviewLogo(normalizeImageUrl(mediaUrl));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: UpdateSettingsPayload = {
        phonePrimary: values.phonePrimary || undefined,
        phoneSecondary: values.phoneSecondary || undefined,
        email: values.email || undefined,
        telegramBotToken: values.telegramBotToken || undefined,
        telegramChatId: values.telegramChatId || undefined,
        brandPrimary: values.brandPrimary || undefined,
        brandAccent: values.brandAccent || undefined,
        catalogHeroImageId: values.catalogHeroImageId || null,
        logoId: values.logoId || null,
        // AmoCRM settings
        amocrmDomain: values.amocrmDomain?.trim() || undefined,
        amocrmClientId: values.amocrmClientId?.trim() || undefined,
        amocrmClientSecret: values.amocrmClientSecret?.trim() || undefined,
        amocrmPipelineId: values.amocrmPipelineId?.trim() || undefined,
        amocrmStatusId: values.amocrmStatusId?.trim() || undefined,
      };
      await updateMutation.mutateAsync(payload);
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  if (isLoading) {
    return <div>Yuklanmoqda...</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>Sozlamalar</h2>
      
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={[24, 24]}>
          {/* Left Column - General Settings */}
          <Col xs={24} lg={12}>
            <Card title="Umumiy sozlamalar" style={{ marginBottom: 24 }}>
              <Form.Item
                label="Asosiy telefon"
                name="phonePrimary"
                rules={[{ required: true, message: 'Telefon raqami kiritilishi kerak' }]}
              >
                <Input placeholder="1385" />
              </Form.Item>

              <Form.Item
                label="Qo'shimcha telefon"
                name="phoneSecondary"
              >
                <Input placeholder="+998 71 202 14 41" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Noto\'g\'ri email' }]}
              >
                <Input placeholder="info@acoustic.uz" />
              </Form.Item>

              <Divider />

              <Form.Item
                label="Asosiy rang (Brand Primary)"
                name="brandPrimary"
              >
                <Input type="color" style={{ width: '100%', height: '40px' }} />
              </Form.Item>

              <Form.Item
                label="Ikkinchi rang (Brand Accent)"
                name="brandAccent"
              >
                <Input type="color" style={{ width: '100%', height: '40px' }} />
              </Form.Item>
            </Card>

            <Card title="Telegram sozlamalari">
              <Form.Item
                label="Telegram Bot Token"
                name="telegramBotToken"
              >
                <Input.Password placeholder="Bot token" />
              </Form.Item>

              <Form.Item
                label="Telegram Chat ID"
                name="telegramChatId"
              >
                <Input placeholder="Chat ID" />
              </Form.Item>
            </Card>

            <Card 
              title={
                <Space>
                  <span>AmoCRM integratsiyasi</span>
                  {settings?.amocrmAccessToken ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                      Ulangan
                    </Tag>
                  ) : (
                    <Tag color="default" icon={<CloseCircleOutlined />}>
                      Ulanmagan
                    </Tag>
                  )}
                </Space>
              }
              style={{ marginTop: 16 }}
            >
              {/* Connection Status Alert */}
              {amocrmTestResult && (
                <Alert
                  type={amocrmTestResult.success ? 'success' : 'warning'}
                  message={amocrmTestResult.message}
                  style={{ marginBottom: 16 }}
                  closable
                  onClose={() => setAmocrmTestResult(null)}
                />
              )}

              <Form.Item
                label="AmoCRM Domain"
                name="amocrmDomain"
                extra="Masalan: yourcompany.amocrm.ru"
                rules={[{ required: true, message: 'Domain kiritilishi kerak' }]}
              >
                <Input placeholder="yourcompany.amocrm.ru" />
              </Form.Item>

              <Form.Item
                label="Client ID"
                name="amocrmClientId"
                extra="AmoCRM Integration'dan olingan Client ID"
                rules={[{ required: true, message: 'Client ID kiritilishi kerak' }]}
              >
                <Input placeholder="Client ID" />
              </Form.Item>

              <Form.Item
                label="Client Secret"
                name="amocrmClientSecret"
                extra="AmoCRM Integration'dan olingan Client Secret"
                rules={[{ required: true, message: 'Client Secret kiritilishi kerak' }]}
              >
                <Input.Password placeholder="Client Secret" />
              </Form.Item>

              <Divider />

              <Form.Item
                label="Pipeline ID"
                name="amocrmPipelineId"
                extra="Lead yaratiladigan Pipeline ID (ixtiyoriy)"
              >
                <Input placeholder="Pipeline ID" />
              </Form.Item>

              <Form.Item
                label="Status ID"
                name="amocrmStatusId"
                extra="Lead yaratiladigan Status ID (ixtiyoriy)"
              >
                <Input placeholder="Status ID" />
              </Form.Item>

              <Divider />

              {/* Action Buttons */}
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {settings?.amocrmAccessToken ? (
                  <>
                    <Button
                      type="primary"
                      icon={<ThunderboltOutlined />}
                      onClick={handleTestAmoCRM}
                      loading={testingAmoCRM}
                      block
                    >
                      Ulanishni tekshirish
                    </Button>
                    <Button
                      icon={<LinkOutlined />}
                      onClick={handleAmoCRMAuthorize}
                      block
                    >
                      Qayta avtorizatsiya qilish
                    </Button>
                  </>
                ) : (
                  <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    onClick={handleAmoCRMAuthorize}
                    block
                    disabled={!form.getFieldValue('amocrmDomain') || !form.getFieldValue('amocrmClientId')}
                  >
                    AmoCRM'ga ulanish
                  </Button>
                )}
              </Space>

              <div style={{ marginTop: 16, padding: 12, background: '#f0f0f0', borderRadius: 4 }}>
                <div style={{ fontSize: 12, color: '#666' }}>
                  <strong>Qo'llanma:</strong> AmoCRM integratsiyasini sozlash uchun{' '}
                  <a href="/AMOCRM_INTEGRATSIYA_QOLLANMASI.md" target="_blank" rel="noopener noreferrer">
                    qo'llanmani ko'ring
                  </a>
                </div>
              </div>
            </Card>
          </Col>

          {/* Right Column - Images */}
          <Col xs={24} lg={12}>
            <Card title="Rasmlar">
              {/* Catalog Hero Image */}
              <div style={{ marginBottom: 24 }}>
                <Form.Item
                  label="Catalog Hero Rasm"
                  name="catalogHeroImageId"
                  tooltip="Catalog sahifasidagi promotional banner uchun rasm"
                >
                  <div>
                    {previewCatalogHero ? (
                      <div style={{ marginBottom: 16 }}>
                        <Image
                          src={normalizeImageUrl(previewCatalogHero)}
                          alt="Catalog Hero"
                          style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                          preview={false}
                        />
                        <Button
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={handleRemoveCatalogHero}
                          style={{ marginTop: 8 }}
                        >
                          O'chirish
                        </Button>
                      </div>
                    ) : null}
                    
                    <Upload
                      customRequest={handleCatalogHeroUpload}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <Button icon={<UploadOutlined />} loading={uploadingCatalogHero} block>
                        {previewCatalogHero ? 'Rasmni almashtirish' : 'Rasm yuklash'}
                      </Button>
                    </Upload>

                    {/* Select from existing media */}
                    <div style={{ marginTop: 16 }}>
                      <Button
                        icon={<FolderOutlined />}
                        onClick={() => setCatalogHeroModalOpen(true)}
                        block
                        style={{ marginBottom: 8 }}
                      >
                        Mavjud rasmdan tanlash
                      </Button>
                      {form.getFieldValue('catalogHeroImageId') && (
                        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                          Tanlangan: {mediaList?.find(m => m.id === form.getFieldValue('catalogHeroImageId'))?.filename || 'Noma\'lum'}
                        </div>
                      )}
                    </div>
                  </div>
                </Form.Item>
              </div>

              {/* Logo */}
              <div style={{ marginBottom: 24 }}>
                <Form.Item
                  label="Logo"
                  name="logoId"
                  tooltip="Sayt header'idagi logo rasm"
                >
                  <div>
                    {previewLogo ? (
                      <div style={{ marginBottom: 16 }}>
                        <Image
                          src={normalizeImageUrl(previewLogo)}
                          alt="Logo"
                          style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain' }}
                          preview={false}
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
              </div>
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            loading={updateMutation.isPending}
            size="large"
          >
            Saqlash
          </Button>
        </div>
      </Form>

      {/* Media Library Modals */}
      <MediaLibraryModal
        open={catalogHeroModalOpen}
        onCancel={() => setCatalogHeroModalOpen(false)}
        onSelect={(media) => {
          handleSelectExistingCatalogHero(media.id, media.url);
          setCatalogHeroModalOpen(false);
        }}
        fileType="image"
        selectedMediaIds={form.getFieldValue('catalogHeroImageId') ? [form.getFieldValue('catalogHeroImageId')] : []}
      />

      <MediaLibraryModal
        open={logoModalOpen}
        onCancel={() => setLogoModalOpen(false)}
        onSelect={(media) => {
          handleSelectExistingLogo(media.id, media.url);
          setLogoModalOpen(false);
        }}
        fileType="image"
        selectedMediaIds={form.getFieldValue('logoId') ? [form.getFieldValue('logoId')] : []}
      />
    </div>
  );
}

