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
  InputNumber,
  Tabs,
} from 'antd';
import { UploadOutlined, DeleteOutlined, SaveOutlined, FolderOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSettings,
  updateSettings,
  getMedia,
  uploadMedia,
  getBrands,
  type SettingsDto,
  type UpdateSettingsPayload,
  type MediaDto,
  type SidebarSection,
  type BrandDto,
  ApiError,
} from '../lib/api';
import MediaLibraryModal from '../components/MediaLibraryModal';
import ImageSizeHint from '../components/ImageSizeHint';
import { normalizeImageUrl } from '../utils/image';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [uploadingCatalogHero, setUploadingCatalogHero] = useState(false);
  const [previewCatalogHero, setPreviewCatalogHero] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [previewFavicon, setPreviewFavicon] = useState<string | null>(null);
  const [catalogHeroModalOpen, setCatalogHeroModalOpen] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [faviconModalOpen, setFaviconModalOpen] = useState(false);
  const [sidebarSections, setSidebarSections] = useState<SidebarSection[]>([]);
  const [sidebarSectionImageModals, setSidebarSectionImageModals] = useState<Record<string, boolean>>({});
  
  // Per-page-type sidebar configs
  const [sidebarConfigs, setSidebarConfigs] = useState<{
    catalog?: { sections?: SidebarSection[]; brandIds?: string[] };
    products?: { sections?: SidebarSection[]; brandIds?: string[] };
    services?: { sections?: SidebarSection[]; brandIds?: string[] };
    posts?: { sections?: SidebarSection[]; brandIds?: string[] };
  }>({});
  const [sidebarConfigImageModals, setSidebarConfigImageModals] = useState<Record<string, Record<string, boolean>>>({});
  
  // Social media links state
  const [socialLinks, setSocialLinks] = useState<{
    tiktok?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
    telegram?: string;
  }>({});

  // Analytics settings state
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [yandexMetrikaId, setYandexMetrikaId] = useState('');


  const { data: settings, isLoading } = useQuery<SettingsDto, ApiError>({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  const { data: mediaList } = useQuery<MediaDto[], ApiError>({
    queryKey: ['media'],
    queryFn: getMedia,
  });

  const { data: brandsList } = useQuery<BrandDto[], ApiError>({
    queryKey: ['brands'],
    queryFn: getBrands,
  });

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: async (data, variables) => {
      console.log('🟢 [Settings] updateMutation.onSuccess called');
      console.log('🟢 [Settings] Response data:', data);
      console.log('🟢 [Settings] Variables sent:', variables);
      
      // Invalidate and refetch settings
      await queryClient.invalidateQueries({ queryKey: ['settings'] });
      const updatedSettings = await queryClient.fetchQuery({ queryKey: ['settings'], queryFn: getSettings });
      
      // Update form with new values
      if (updatedSettings) {
        console.log('🟢 [Settings] Updating form with new settings:', {
          telegramBotToken: updatedSettings.telegramBotToken ? '***SET***' : 'EMPTY',
          telegramChatId: updatedSettings.telegramChatId || 'EMPTY',
          telegramButtonBotToken: updatedSettings.telegramButtonBotToken ? '***SET***' : 'EMPTY',
          telegramButtonBotUsername: updatedSettings.telegramButtonBotUsername || 'EMPTY',
          telegramButtonMessage_uz: updatedSettings.telegramButtonMessage_uz || 'EMPTY',
          telegramButtonMessage_ru: updatedSettings.telegramButtonMessage_ru || 'EMPTY',
        });
        
        form.setFieldsValue({
          telegramBotToken: updatedSettings.telegramBotToken || '',
          telegramChatId: updatedSettings.telegramChatId || '',
          telegramButtonBotToken: updatedSettings.telegramButtonBotToken || '',
          telegramButtonBotUsername: updatedSettings.telegramButtonBotUsername || '',
          telegramButtonMessage_uz: updatedSettings.telegramButtonMessage_uz || 'Assalomu alaykum!\nSavolingiz bormi?',
          telegramButtonMessage_ru: updatedSettings.telegramButtonMessage_ru || 'Здравствуйте!\nУ вас есть вопрос?',
        });
      }
      
      // Note: Specific success messages are shown in individual handlers
      // This is a fallback for other tabs
      message.success('Sozlamalar saqlandi', 3);
    },
    onError: (error: ApiError) => {
      console.error('🔴 [Settings] updateMutation.onError called');
      console.error('🔴 [Settings] Error:', error);
      console.error('🔴 [Settings] Error message:', error.message);
      message.error(error.message || 'Xatolik yuz berdi', 5);
    },
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
        telegramButtonBotToken: settings.telegramButtonBotToken || '',
        telegramButtonBotUsername: settings.telegramButtonBotUsername || '',
        telegramButtonMessage_uz: settings.telegramButtonMessage_uz || 'Assalomu alaykum!\nSavolingiz bormi?',
        telegramButtonMessage_ru: settings.telegramButtonMessage_ru || 'Здравствуйте!\nУ вас есть вопрос?',
        brandPrimary: settings.brandPrimary || '#F07E22',
        brandAccent: settings.brandAccent || '#3F3091',
        catalogHeroImageId: settings.catalogHeroImageId || null,
        logoId: settings.logoId || null,
        faviconId: settings.faviconId || null,
      });
      if (settings.catalogHeroImage?.url) {
        setPreviewCatalogHero(normalizeImageUrl(settings.catalogHeroImage.url));
      }
      if (settings.logo?.url) {
        setPreviewLogo(normalizeImageUrl(settings.logo.url));
      }
      if (settings.favicon?.url) {
        setPreviewFavicon(normalizeImageUrl(settings.favicon.url));
      }
      // Initialize sidebar sections (legacy - only if sidebarConfigs doesn't exist)
      // Don't set default sections - use sidebarConfigs instead
      if (settings.sidebarSections && Array.isArray(settings.sidebarSections)) {
        setSidebarSections(settings.sidebarSections as SidebarSection[]);
      } else {
        // Empty array - don't use hard-coded defaults
        setSidebarSections([]);
      }
      // Initialize sidebar brand IDs
      form.setFieldsValue({
        sidebarBrandIds: settings.sidebarBrandIds || [],
      });
      
      // Initialize social media links
      if (settings.socialLinks && typeof settings.socialLinks === 'object') {
        const links = settings.socialLinks as Record<string, string>;
        setSocialLinks({
          tiktok: links.tiktok || '',
          instagram: links.instagram || '',
          facebook: links.facebook || '',
          youtube: links.youtube || '',
          telegram: links.telegram || '',
        });
        form.setFieldsValue({
          socialTiktok: links.tiktok || '',
          socialInstagram: links.instagram || '',
          socialFacebook: links.facebook || '',
          socialYoutube: links.youtube || '',
          socialTelegram: links.telegram || '',
        });
      } else {
        // Default empty values
        setSocialLinks({});
        form.setFieldsValue({
          socialTiktok: '',
          socialInstagram: '',
          socialFacebook: '',
          socialYoutube: '',
          socialTelegram: '',
        });
      }
    }
  }, [settings, form]);

  // Initialize per-page-type sidebar configs when settings and brandsList are loaded
  useEffect(() => {
    if (settings && brandsList) {
      if (settings.sidebarConfigs && typeof settings.sidebarConfigs === 'object') {
        setSidebarConfigs(settings.sidebarConfigs as typeof sidebarConfigs);
      } else {
        // Initialize with default configs (from hard-coded values) - only on first load
        // Find Oticon, ReSound, Signia brands for default brandIds
        const defaultBrandIds: string[] = [];
        brandsList.forEach(brand => {
          const brandName = (brand.name || '').toLowerCase();
          const brandSlug = (brand.slug || '').toLowerCase();
          if (
            brandName.includes('oticon') || brandSlug.includes('oticon') ||
            brandName.includes('resound') || brandSlug.includes('resound') ||
            brandName.includes('signia') || brandSlug.includes('signia')
          ) {
            defaultBrandIds.push(brand.id);
          }
        });
        
        const defaultSections: SidebarSection[] = [
          { id: 'accessories', title_uz: 'Aksessuarlar', title_ru: 'Аксессуары', link: '/catalog/accessories', icon: '📱', imageId: null, order: 0 },
          { id: 'earmolds', title_uz: 'Quloq qo\'shimchalari', title_ru: 'Ушные вкладыши', link: '/catalog/earmolds', icon: '👂', imageId: null, order: 1 },
          { id: 'batteries', title_uz: 'Batareyalar', title_ru: 'Батарейки', link: '/catalog/batteries', icon: '🔋', imageId: null, order: 2 },
          { id: 'care', title_uz: 'Parvarish vositalari', title_ru: 'Средства ухода', link: '/catalog/care', icon: '🧴', imageId: null, order: 3 },
        ];
        
        const defaultConfigs = {
          catalog: { sections: defaultSections, brandIds: defaultBrandIds },
          products: { sections: defaultSections, brandIds: defaultBrandIds },
          services: { sections: defaultSections, brandIds: defaultBrandIds },
          posts: { sections: defaultSections, brandIds: defaultBrandIds },
        };
        
        setSidebarConfigs(defaultConfigs);
        // Don't auto-save - let user save manually
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, brandsList]);

  // Check URL params for OAuth callback results
  useEffect(() => {
    // Handle URL parameters if needed (for future features)
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const error = params.get('error');
    
    if (success || error) {
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [queryClient]);



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

  const handleFaviconUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploadingFavicon(true);
    try {
      const media = await uploadMedia(file as File);
      form.setFieldsValue({ faviconId: media.id });
      setPreviewFavicon(normalizeImageUrl(media.url));
      message.success('Favicon yuklandi');
      queryClient.invalidateQueries({ queryKey: ['media'] });
      onSuccess?.(media);
    } catch (error) {
      const apiError = error as ApiError;
      message.error(apiError.message || 'Favicon yuklashda xatolik');
      onError?.(error as Error);
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleRemoveFavicon = () => {
    form.setFieldsValue({ faviconId: null });
    setPreviewFavicon(null);
  };

  const handleSelectExistingFavicon = (mediaId: string, mediaUrl: string) => {
    form.setFieldsValue({ faviconId: mediaId });
    setPreviewFavicon(normalizeImageUrl(mediaUrl));
    setFaviconModalOpen(false);
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
        telegramButtonBotToken: values.telegramButtonBotToken || undefined,
        telegramButtonBotUsername: values.telegramButtonBotUsername || undefined,
        telegramButtonMessage_uz: values.telegramButtonMessage_uz || undefined,
        telegramButtonMessage_ru: values.telegramButtonMessage_ru || undefined,
        brandPrimary: values.brandPrimary || undefined,
        brandAccent: values.brandAccent || undefined,
        catalogHeroImageId: values.catalogHeroImageId || null,
        logoId: values.logoId || null,
        sidebarSections: sidebarSections.length > 0 ? sidebarSections : undefined,
        sidebarBrandIds: values.sidebarBrandIds || [],
        // Don't include sidebarConfigs here - it's saved separately
      };
      await updateMutation.mutateAsync(payload);
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  // Handle sidebar config save for specific page type
  const handleSidebarConfigSave = async (pageType: 'catalog' | 'products' | 'services' | 'posts') => {
    try {
      // Ensure we have a valid config structure
      const currentConfig = sidebarConfigs[pageType] || { sections: [], brandIds: [] };
      
      // Clean up sections: remove null imageId, ensure all required fields exist
      const cleanedSections = (currentConfig.sections || []).map((section: SidebarSection) => ({
        id: section.id,
        title_uz: section.title_uz || '',
        title_ru: section.title_ru || '',
        link: section.link || '',
        icon: section.icon || '',
        imageId: section.imageId || null,
        order: section.order || 0,
      }));
      
      // Ensure brandIds is an array
      const cleanedBrandIds = Array.isArray(currentConfig.brandIds) ? currentConfig.brandIds : [];
      
      // Build complete sidebarConfigs object with all page types
      const completeSidebarConfigs = {
        catalog: sidebarConfigs.catalog || { sections: [], brandIds: [] },
        products: sidebarConfigs.products || { sections: [], brandIds: [] },
        services: sidebarConfigs.services || { sections: [], brandIds: [] },
        posts: sidebarConfigs.posts || { sections: [], brandIds: [] },
        [pageType]: {
          sections: cleanedSections,
          brandIds: cleanedBrandIds,
        },
      };
      
      const payload: UpdateSettingsPayload = {
        sidebarConfigs: completeSidebarConfigs,
      };
      
      console.log('Saving sidebar config:', JSON.stringify(payload, null, 2));
      await updateMutation.mutateAsync(payload);
      message.success(`${pageType === 'catalog' ? 'Catalog' : pageType === 'products' ? 'Mahsulot' : pageType === 'services' ? 'Xizmat' : 'Maqola'} sahifasi sidebar konfiguratsiyasi saqlandi`);
    } catch (error) {
      console.error('Sidebar config save error:', error);
      const apiError = error as ApiError;
      message.error(apiError.message || 'Saqlashda xatolik yuz berdi');
    }
  };

  const handleAddSidebarSection = () => {
    const newSection: SidebarSection = {
      id: `section-${Date.now()}`,
      title_uz: '',
      title_ru: '',
      link: '',
      icon: '',
      imageId: null,
      order: sidebarSections.length,
    };
    setSidebarSections([...sidebarSections, newSection]);
  };

  const handleRemoveSidebarSection = (id: string) => {
    setSidebarSections(sidebarSections.filter(s => s.id !== id));
  };

  const handleUpdateSidebarSection = (id: string, field: keyof SidebarSection, value: any) => {
    setSidebarSections(sidebarSections.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const handleSidebarSectionImageSelect = (sectionId: string, mediaId: string, mediaUrl: string) => {
    handleUpdateSidebarSection(sectionId, 'imageId', mediaId);
    setSidebarSectionImageModals({ ...sidebarSectionImageModals, [sectionId]: false });
  };

  if (isLoading) {
    return <div>Yuklanmoqda...</div>;
  }

  // Handle general settings save
  const handleGeneralSettingsSave = async () => {
    try {
      const values = await form.validateFields(['phonePrimary', 'phoneSecondary', 'email', 'brandPrimary', 'brandAccent']);
      const payload: UpdateSettingsPayload = {
        phonePrimary: values.phonePrimary || undefined,
        phoneSecondary: values.phoneSecondary || undefined,
        email: values.email || undefined,
        brandPrimary: values.brandPrimary || undefined,
        brandAccent: values.brandAccent || undefined,
      };
      await updateMutation.mutateAsync(payload);
    } catch (error) {
      console.error('[Settings] Form validation error:', error);
      message.error('Formani to\'ldirishda xatolik yuz berdi');
    }
  };

  // Handle Telegram settings save
  const handleTelegramSettingsSave = async () => {
    console.log('🔵 [Settings] ========== Telegram Save Started ==========');
    console.log('🔵 [Settings] Button clicked, starting save process...');
    
    try {
      // Get all form values without validation (to allow empty values)
      const formValues = form.getFieldsValue();
      console.log('🔵 [Settings] Form values retrieved:', {
        telegramBotToken: formValues.telegramBotToken ? '***SET***' : 'EMPTY',
        telegramChatId: formValues.telegramChatId || 'EMPTY',
        telegramButtonBotToken: formValues.telegramButtonBotToken ? '***SET***' : 'EMPTY',
        telegramButtonBotUsername: formValues.telegramButtonBotUsername || 'EMPTY',
        telegramButtonMessage_uz: formValues.telegramButtonMessage_uz || 'EMPTY',
        telegramButtonMessage_ru: formValues.telegramButtonMessage_ru || 'EMPTY',
      });
      
      // Helper function to convert empty strings to undefined
      const toUndefinedIfEmpty = (value: string | undefined | null): string | undefined => {
        if (value === null || value === undefined || value.trim() === '') {
          return undefined;
        }
        return value.trim();
      };
      
      const payload: UpdateSettingsPayload = {
        telegramBotToken: toUndefinedIfEmpty(formValues.telegramBotToken),
        telegramChatId: toUndefinedIfEmpty(formValues.telegramChatId),
        telegramButtonBotToken: toUndefinedIfEmpty(formValues.telegramButtonBotToken),
        telegramButtonBotUsername: toUndefinedIfEmpty(formValues.telegramButtonBotUsername),
        telegramButtonMessage_uz: toUndefinedIfEmpty(formValues.telegramButtonMessage_uz),
        telegramButtonMessage_ru: toUndefinedIfEmpty(formValues.telegramButtonMessage_ru),
      };
      
      console.log('🔵 [Settings] Payload prepared:', {
        telegramBotToken: payload.telegramBotToken ? '***SET***' : 'undefined',
        telegramChatId: payload.telegramChatId || 'undefined',
        telegramButtonBotToken: payload.telegramButtonBotToken ? '***SET***' : 'undefined',
        telegramButtonBotUsername: payload.telegramButtonBotUsername || 'undefined',
        telegramButtonMessage_uz: payload.telegramButtonMessage_uz || 'undefined',
        telegramButtonMessage_ru: payload.telegramButtonMessage_ru || 'undefined',
      });
      
      console.log('🔵 [Settings] Calling updateMutation.mutateAsync...');
      console.log('🔵 [Settings] updateMutation state:', {
        isPending: updateMutation.isPending,
        isError: updateMutation.isError,
        isSuccess: updateMutation.isSuccess,
      });
      
      const result = await updateMutation.mutateAsync(payload);
      
      console.log('🟢 [Settings] ========== Telegram Save SUCCESS ==========');
      console.log('🟢 [Settings] Response received:', result);
      console.log('🟢 [Settings] Settings saved successfully!');
      
      // Show explicit success message
      message.success('Telegram sozlamalari muvaffaqiyatli saqlandi!', 3);
      
    } catch (error: any) {
      console.error('🔴 [Settings] ========== Telegram Save ERROR ==========');
      console.error('🔴 [Settings] Error type:', typeof error);
      console.error('🔴 [Settings] Error object:', error);
      console.error('🔴 [Settings] Error message:', error?.message);
      console.error('🔴 [Settings] Error response:', error?.response);
      console.error('🔴 [Settings] Error status:', error?.status);
      console.error('🔴 [Settings] Error stack:', error?.stack);
      
      const errorMessage = error?.message || error?.response?.data?.message || 'Sozlamalarni saqlashda xatolik yuz berdi';
      console.error('🔴 [Settings] Showing error message:', errorMessage);
      message.error(errorMessage, 5);
    }
  };

  // Handle images save
  const handleImagesSave = async () => {
    try {
      const values = await form.validateFields(['catalogHeroImageId', 'logoId', 'faviconId']);
      const payload: UpdateSettingsPayload = {
        catalogHeroImageId: values.catalogHeroImageId || null,
        logoId: values.logoId || null,
        faviconId: values.faviconId || null,
      };
      await updateMutation.mutateAsync(payload);
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  // Handle social media links save
  const handleSocialLinksSave = async () => {
    try {
      const values = await form.validateFields(['socialTiktok', 'socialInstagram', 'socialFacebook', 'socialYoutube', 'socialTelegram']);
      const socialLinksData: Record<string, string> = {};
      
      if (values.socialTiktok?.trim()) socialLinksData.tiktok = values.socialTiktok.trim();
      if (values.socialInstagram?.trim()) socialLinksData.instagram = values.socialInstagram.trim();
      if (values.socialFacebook?.trim()) socialLinksData.facebook = values.socialFacebook.trim();
      if (values.socialYoutube?.trim()) socialLinksData.youtube = values.socialYoutube.trim();
      if (values.socialTelegram?.trim()) socialLinksData.telegram = values.socialTelegram.trim();
      
      const payload: UpdateSettingsPayload = {
        socialLinks: Object.keys(socialLinksData).length > 0 ? socialLinksData : undefined,
      };
      await updateMutation.mutateAsync(payload);
      setSocialLinks(socialLinksData);
    } catch (error) {
      console.error('Social links save error:', error);
    }
  };


  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>Sozlamalar</h2>
      
      <Tabs
        defaultActiveKey="general"
        items={[
          {
            key: 'general',
            label: 'Umumiy sozlamalar',
            children: (
              <Form form={form} layout="vertical">
                <Card>
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


                  <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleGeneralSettingsSave}
                      loading={updateMutation.isPending}
                      size="large"
                    >
                      Saqlash
                    </Button>
                  </div>
                </Card>
              </Form>
            ),
          },
          {
            key: 'images',
            label: 'Rasmlar',
            children: (
              <Form form={form} layout="vertical">
                <Card>
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
                      <ImageSizeHint type="logo" showAsAlert={false} />
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

                  {/* Favicon */}
                  <div style={{ marginBottom: 24 }}>
                    <Form.Item
                      label="Favicon"
                      name="faviconId"
                      tooltip="Brauzer tab'idagi kichik ikonka (16x16 yoki 32x32 px tavsiya etiladi)"
                    >
                      <div>
                        {previewFavicon ? (
                          <div style={{ marginBottom: 16 }}>
                            <Image
                              src={normalizeImageUrl(previewFavicon)}
                              alt="Favicon"
                              style={{ maxWidth: '32px', maxHeight: '32px', objectFit: 'contain' }}
                              preview={false}
                            />
                            <Button
                              type="link"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={handleRemoveFavicon}
                              style={{ marginTop: 8 }}
                            >
                              O'chirish
                            </Button>
                          </div>
                        ) : null}
                        
                        <Upload
                          customRequest={handleFaviconUpload}
                          showUploadList={false}
                          accept="image/*"
                        >
                          <Button icon={<UploadOutlined />} loading={uploadingFavicon} block>
                            {previewFavicon ? 'Faviconni almashtirish' : 'Favicon yuklash'}
                          </Button>
                        </Upload>

                        <div style={{ marginTop: 16 }}>
                          <Button
                            icon={<FolderOutlined />}
                            onClick={() => setFaviconModalOpen(true)}
                            block
                            style={{ marginBottom: 8 }}
                          >
                            Mavjud rasmdan tanlash
                          </Button>
                          {form.getFieldValue('faviconId') && (
                            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                              Tanlangan: {mediaList?.find(m => m.id === form.getFieldValue('faviconId'))?.filename || 'Noma\'lum'}
                            </div>
                          )}
                        </div>
                      </div>
                    </Form.Item>
                  </div>

                  <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleImagesSave}
                      loading={updateMutation.isPending}
                      size="large"
                    >
                      Saqlash
                    </Button>
                  </div>
                </Card>
              </Form>
            ),
          },
          {
            key: 'telegram',
            label: 'Telegram sozlamalari',
            children: (
              <Form form={form} layout="vertical">
                <Card>
                  <Alert
                    message="Bot ma'lumotlari"
                    description={
                      <div>
                        <p><strong>1. Telegram Bot (Formalar uchun):</strong></p>
                        <ul style={{ marginLeft: 20, marginBottom: 16 }}>
                          <li><strong>Telegram Bot Token</strong> - Saytdagi formalardan kelgan barcha so'rovlar shu botga yuboriladi</li>
                          <li><strong>Telegram Chat ID</strong> - Formalar yuboriladigan chat ID (masalan: @your_chat yoki chat ID raqami)</li>
                        </ul>
                        <p><strong>2. Telegram Button Bot:</strong></p>
                        <ul style={{ marginLeft: 20 }}>
                          <li><strong>Telegram Button Bot Token</strong> - Saytdagi Telegram tugmasidan kelgan xabarlar uchun bot token</li>
                          <li><strong>Telegram Button Bot Username</strong> - Bot username (masalan: @yourbot)</li>
                        </ul>
                        <p style={{ marginTop: 16, color: '#666' }}>
                          <strong>Eslatma:</strong> Hozir barcha formalar Telegram botga yuboriladi. AmoCRM integratsiyasi o'chirilgan.
                        </p>
                      </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />

                  <h3 style={{ marginBottom: 16 }}>Telegram Bot (Formalar uchun)</h3>
                  <Form.Item
                    label="Telegram Bot Token"
                    name="telegramBotToken"
                    extra="Saytdagi formalardan kelgan barcha so'rovlar shu botga yuboriladi"
                  >
                    <Input.Password placeholder="Bot token" />
                  </Form.Item>

                  <Form.Item
                    label="Telegram Chat ID"
                    name="telegramChatId"
                    extra="Formalar yuboriladigan chat ID (masalan: @your_chat yoki chat ID raqami)"
                  >
                    <Input placeholder="Chat ID" />
                  </Form.Item>

                  <Divider />

                  <h3 style={{ marginBottom: 16 }}>Telegram Button Bot</h3>
                  <Form.Item
                    label="Telegram Button Bot Token"
                    name="telegramButtonBotToken"
                    extra="Saytdagi Telegram tugmasidan kelgan xabarlar uchun bot token"
                  >
                    <Input.Password placeholder="Bot token" />
                  </Form.Item>

                  <Form.Item
                    label="Telegram Button Bot Username"
                    name="telegramButtonBotUsername"
                    extra="Bot username (masalan: @yourbot yoki yourbot)"
                  >
                    <Input placeholder="@yourbot" />
                  </Form.Item>

                  <Form.Item
                    label="Telegram Button Xabari (O'zbek)"
                    name="telegramButtonMessage_uz"
                    extra="Chat bubble'da ko'rsatiladigan xabar (O'zbek)"
                  >
                    <Input.TextArea 
                      rows={3} 
                      placeholder="Assalomu alaykum!&#10;Savolingiz bormi?"
                      showCount
                      maxLength={200}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Telegram Button Xabari (Rus)"
                    name="telegramButtonMessage_ru"
                    extra="Chat bubble'da ko'rsatiladigan xabar (Rus)"
                  >
                    <Input.TextArea 
                      rows={3} 
                      placeholder="Здравствуйте!&#10;У вас есть вопрос?"
                      showCount
                      maxLength={200}
                    />
                  </Form.Item>

                  <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleTelegramSettingsSave}
                      loading={updateMutation.isPending}
                      size="large"
                    >
                      Saqlash
                    </Button>
                  </div>
                </Card>
              </Form>
            ),
          },
          {
            key: 'sidebar',
            label: 'Sidebar boshqaruvi',
            children: (
              <Card>
                <Tabs
                  defaultActiveKey="catalog"
                  items={[
                    {
                      key: 'catalog',
                      label: 'Catalog sahifasi',
                      children: <SidebarConfigTab 
                        pageType="catalog"
                        config={sidebarConfigs.catalog || { sections: [], brandIds: [] }}
                        onUpdate={(config) => setSidebarConfigs({ ...sidebarConfigs, catalog: config })}
                        onSave={() => handleSidebarConfigSave('catalog')}
                        brandsList={brandsList || []}
                        imageModals={sidebarConfigImageModals.catalog || {}}
                        onImageModalChange={(modals) => setSidebarConfigImageModals({ ...sidebarConfigImageModals, catalog: modals })}
                        isSaving={updateMutation.isPending}
                      />,
                    },
                    {
                      key: 'products',
                      label: 'Mahsulot sahifasi',
                      children: <SidebarConfigTab 
                        pageType="products"
                        config={sidebarConfigs.products || { sections: [], brandIds: [] }}
                        onUpdate={(config) => setSidebarConfigs({ ...sidebarConfigs, products: config })}
                        onSave={() => handleSidebarConfigSave('products')}
                        brandsList={brandsList || []}
                        imageModals={sidebarConfigImageModals.products || {}}
                        onImageModalChange={(modals) => setSidebarConfigImageModals({ ...sidebarConfigImageModals, products: modals })}
                        isSaving={updateMutation.isPending}
                      />,
                    },
                    {
                      key: 'services',
                      label: 'Xizmat sahifasi',
                      children: <SidebarConfigTab 
                        pageType="services"
                        config={sidebarConfigs.services || { sections: [], brandIds: [] }}
                        onUpdate={(config) => setSidebarConfigs({ ...sidebarConfigs, services: config })}
                        onSave={() => handleSidebarConfigSave('services')}
                        brandsList={brandsList || []}
                        imageModals={sidebarConfigImageModals.services || {}}
                        onImageModalChange={(modals) => setSidebarConfigImageModals({ ...sidebarConfigImageModals, services: modals })}
                        isSaving={updateMutation.isPending}
                      />,
                    },
                    {
                      key: 'posts',
                      label: 'Maqola sahifasi',
                      children: <SidebarConfigTab 
                        pageType="posts"
                        config={sidebarConfigs.posts || { sections: [], brandIds: [] }}
                        onUpdate={(config) => setSidebarConfigs({ ...sidebarConfigs, posts: config })}
                        onSave={() => handleSidebarConfigSave('posts')}
                        brandsList={brandsList || []}
                        imageModals={sidebarConfigImageModals.posts || {}}
                        onImageModalChange={(modals) => setSidebarConfigImageModals({ ...sidebarConfigImageModals, posts: modals })}
                        isSaving={updateMutation.isPending}
                      />,
                    },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: 'homepage-content',
            label: 'Bosh sahifa kontenti',
            children: (
              <Card>
                <Alert
                  message="Bosh sahifa kontenti"
                  description="Bu bo'lim hozircha mavjud emas. Keyingi versiyada qo'shiladi."
                  type="info"
                  showIcon
                />
              </Card>
            ),
          },
          {
            key: 'social-media',
            label: 'Ijtimoiy tarmoqlar',
            children: (
              <Form form={form} layout="vertical">
                <Card>
                  <Alert
                    message="Ijtimoiy tarmoq linklari"
                    description="Footer'dagi ijtimoiy tarmoq linklarini boshqaring. To'liq URL kiriting (masalan: https://instagram.com/acoustic)"
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                  
                  <Form.Item
                    label="TikTok"
                    name="socialTiktok"
                    extra="TikTok profil linki (masalan: https://tiktok.com/@acoustic)"
                  >
                    <Input placeholder="https://tiktok.com/@acoustic" />
                  </Form.Item>

                  <Form.Item
                    label="Instagram"
                    name="socialInstagram"
                    extra="Instagram profil linki (masalan: https://instagram.com/acoustic)"
                  >
                    <Input placeholder="https://instagram.com/acoustic" />
                  </Form.Item>

                  <Form.Item
                    label="Facebook"
                    name="socialFacebook"
                    extra="Facebook profil linki (masalan: https://facebook.com/acoustic)"
                  >
                    <Input placeholder="https://facebook.com/acoustic" />
                  </Form.Item>

                  <Form.Item
                    label="YouTube"
                    name="socialYoutube"
                    extra="YouTube kanal linki (masalan: https://youtube.com/@acoustic)"
                  >
                    <Input placeholder="https://youtube.com/@acoustic" />
                  </Form.Item>

                  <Form.Item
                    label="Telegram"
                    name="socialTelegram"
                    extra="Telegram kanal yoki bot linki (masalan: https://t.me/acoustic)"
                  >
                    <Input placeholder="https://t.me/acoustic" />
                  </Form.Item>

                  <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSocialLinksSave}
                      loading={updateMutation.isPending}
                      size="large"
                    >
                      Saqlash
                    </Button>
                  </div>
                </Card>
              </Form>
            ),
          },
        ]}
      />

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

      {/* Favicon Media Library Modal */}
      <MediaLibraryModal
        open={faviconModalOpen}
        onCancel={() => setFaviconModalOpen(false)}
        onSelect={(media) => handleSelectExistingFavicon(media.id, media.url)}
        fileType="image"
        selectedMediaIds={form.getFieldValue('faviconId') ? [form.getFieldValue('faviconId')] : []}
      />

      {/* Sidebar Section Image Modals */}
      {sidebarSections.map((section) => (
        <MediaLibraryModal
          key={`sidebar-section-${section.id}`}
          open={sidebarSectionImageModals[section.id] || false}
          onCancel={() => setSidebarSectionImageModals({ ...sidebarSectionImageModals, [section.id]: false })}
          onSelect={(media) => handleSidebarSectionImageSelect(section.id, media.id, media.url)}
          fileType="image"
          selectedMediaIds={section.imageId ? [section.imageId] : []}
        />
      ))}
    </div>
  );
}

// Sidebar Config Tab Component
function SidebarConfigTab({
  pageType,
  config,
  onUpdate,
  onSave,
  brandsList,
  imageModals,
  onImageModalChange,
  isSaving,
}: {
  pageType: 'catalog' | 'products' | 'services' | 'posts';
  config: { sections?: SidebarSection[]; brandIds?: string[] };
  onUpdate: (config: { sections?: SidebarSection[]; brandIds?: string[] }) => void;
  onSave: () => void;
  brandsList: BrandDto[];
  imageModals: Record<string, boolean>;
  onImageModalChange: (modals: Record<string, boolean>) => void;
  isSaving?: boolean;
}) {
  const sections = config.sections || [];
  const brandIds = config.brandIds || [];

  const handleAddSection = () => {
    const newSection: SidebarSection = {
      id: `section-${Date.now()}`,
      title_uz: '',
      title_ru: '',
      link: '',
      icon: '',
      imageId: null,
      order: sections.length,
    };
    onUpdate({ ...config, sections: [...sections, newSection] });
  };

  const handleRemoveSection = (id: string) => {
    onUpdate({ ...config, sections: sections.filter(s => s.id !== id) });
  };

  const handleUpdateSection = (id: string, field: keyof SidebarSection, value: any) => {
    onUpdate({
      ...config,
      sections: sections.map(s => s.id === id ? { ...s, [field]: value } : s),
    });
  };

  const handleSectionImageSelect = (sectionId: string, mediaId: string) => {
    handleUpdateSection(sectionId, 'imageId', mediaId);
    onImageModalChange({ ...imageModals, [sectionId]: false });
  };

  const handleBrandIdsChange = (ids: string[]) => {
    onUpdate({ ...config, brandIds: ids });
  };

  return (
    <div>
      {/* Boshqa bo'limlar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h4 style={{ margin: 0 }}>Boshqa bo'limlar</h4>
          <Button type="dashed" onClick={handleAddSection}>
            + Qo'shish
          </Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sections.map((section) => (
            <Card key={section.id} size="small" style={{ backgroundColor: '#fafafa' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Input
                    placeholder="Icon (emoji)"
                    value={section.icon || ''}
                    onChange={(e) => handleUpdateSection(section.id, 'icon', e.target.value)}
                    style={{ width: 80 }}
                  />
                  <Input
                    placeholder="Sarlavha (UZ)"
                    value={section.title_uz}
                    onChange={(e) => handleUpdateSection(section.id, 'title_uz', e.target.value)}
                    style={{ flex: 1, minWidth: 150 }}
                  />
                  <Input
                    placeholder="Sarlavha (RU)"
                    value={section.title_ru}
                    onChange={(e) => handleUpdateSection(section.id, 'title_ru', e.target.value)}
                    style={{ flex: 1, minWidth: 150 }}
                  />
                  <Input
                    placeholder="Link"
                    value={section.link}
                    onChange={(e) => handleUpdateSection(section.id, 'link', e.target.value)}
                    style={{ flex: 1, minWidth: 150 }}
                  />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveSection(section.id)}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button
                    icon={<FolderOutlined />}
                    onClick={() => onImageModalChange({ ...imageModals, [section.id]: true })}
                  >
                    Rasm tanlash
                  </Button>
                  {section.imageId && (
                    <span style={{ fontSize: 12, color: '#666' }}>
                      Rasm tanlangan
                    </span>
                  )}
                  <InputNumber
                    placeholder="Tartib"
                    value={section.order}
                    onChange={(value) => handleUpdateSection(section.id, 'order', value || 0)}
                    style={{ width: 100 }}
                    min={0}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Brendlar */}
      <Divider />
      <div>
        <h4 style={{ marginBottom: 16 }}>Sidebar'da ko'rsatiladigan brendlar</h4>
        <Select
          mode="multiple"
          placeholder="Brendlarni tanlang"
          style={{ width: '100%' }}
          value={brandIds}
          onChange={handleBrandIdsChange}
          options={brandsList.map(brand => ({
            label: brand.name,
            value: brand.id,
          }))}
        />
      </div>

      {/* Save Button */}
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={onSave}
          loading={isSaving}
          size="large"
        >
          Saqlash
        </Button>
      </div>

      {/* Image Modals */}
      {sections.map((section) => (
        <MediaLibraryModal
          key={`${pageType}-section-${section.id}`}
          open={imageModals[section.id] || false}
          onCancel={() => onImageModalChange({ ...imageModals, [section.id]: false })}
          onSelect={(media) => handleSectionImageSelect(section.id, media.id, media.url)}
          fileType="image"
          selectedMediaIds={section.imageId ? [section.imageId] : []}
        />
      ))}
    </div>
  );
}

