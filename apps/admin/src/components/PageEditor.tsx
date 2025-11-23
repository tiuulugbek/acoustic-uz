import { Card, Form, Input, Select, Button, message, Spin, Tabs, Upload, Image, Space, Transfer } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPageBySlug, updatePage, createPage, ApiError, type PageDto, getMedia, uploadMedia, type MediaDto, getPosts, type PostDto } from '../lib/api';
import RichTextEditor from './RichTextEditor';
import { useEffect, useState } from 'react';
import type { UploadProps } from 'antd';

interface PageEditorProps {
  slug: string;
  defaultTitleUz?: string;
  defaultTitleRu?: string;
}

export default function PageEditor({ slug, defaultTitleUz, defaultTitleRu }: PageEditorProps) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: page, isLoading, error } = useQuery<PageDto | null, ApiError>({
    queryKey: ['page', slug],
    queryFn: () => getPageBySlug(slug),
    retry: false,
    throwOnError: false,
  });

  const { data: mediaList } = useQuery<MediaDto[], ApiError>({
    queryKey: ['media'],
    queryFn: getMedia,
  });

  const { data: postsList } = useQuery<PostDto[], ApiError>({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  const { mutateAsync: savePage, isPending: isSaving } = useMutation<PageDto, ApiError, PageDto>({
    mutationFn: async (data) => {
      if (page) {
        return updatePage(page.id, data);
      } else {
        return createPage({ ...data, slug });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page', slug] });
      message.success('Sahifa saqlandi');
    },
    onError: (error) => {
      message.error(error.message || 'Saqlashda xatolik');
    },
  });

  // Calculate initial values
  const initialValues = page
    ? {
        title_uz: page.title_uz,
        title_ru: page.title_ru,
        body_uz: page.body_uz || '',
        body_ru: page.body_ru || '',
        metaTitle_uz: page.metaTitle_uz || '',
        metaTitle_ru: page.metaTitle_ru || '',
        metaDescription_uz: page.metaDescription_uz || '',
        metaDescription_ru: page.metaDescription_ru || '',
        galleryIds: page.galleryIds || [],
        videoUrl: page.videoUrl || '',
        usefulArticleSlugs: page.usefulArticleSlugs || [],
        status: page.status,
      }
    : defaultTitleUz && defaultTitleRu
      ? {
          title_uz: defaultTitleUz,
          title_ru: defaultTitleRu,
          galleryIds: [],
          usefulArticleSlugs: [],
          status: 'published',
        }
      : { galleryIds: [], usefulArticleSlugs: [] };

  useEffect(() => {
    if (page) {
      form.setFieldsValue({
        title_uz: page.title_uz,
        title_ru: page.title_ru,
        body_uz: page.body_uz || '',
        body_ru: page.body_ru || '',
        metaTitle_uz: page.metaTitle_uz || '',
        metaTitle_ru: page.metaTitle_ru || '',
        metaDescription_uz: page.metaDescription_uz || '',
        metaDescription_ru: page.metaDescription_ru || '',
        galleryIds: page.galleryIds || [],
        videoUrl: page.videoUrl || '',
        usefulArticleSlugs: page.usefulArticleSlugs || [],
        status: page.status,
      });
    } else if (defaultTitleUz && defaultTitleRu) {
      form.setFieldsValue({
        title_uz: defaultTitleUz,
        title_ru: defaultTitleRu,
        galleryIds: [],
        usefulArticleSlugs: [],
        status: 'published',
      });
    }
  }, [page, form, defaultTitleUz, defaultTitleRu]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await savePage({
        slug,
        title_uz: values.title_uz,
        title_ru: values.title_ru,
        body_uz: values.body_uz || null,
        body_ru: values.body_ru || null,
        metaTitle_uz: values.metaTitle_uz || null,
        metaTitle_ru: values.metaTitle_ru || null,
        metaDescription_uz: values.metaDescription_uz || null,
        metaDescription_ru: values.metaDescription_ru || null,
        galleryIds: values.galleryIds || [],
        videoUrl: values.videoUrl || null,
        usefulArticleSlugs: values.usefulArticleSlugs || [],
        status: values.status || 'published',
      });
    } catch (error) {
      // Validation errors handled by form
    }
  };

  const handleGalleryUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      const media = await uploadMedia(file as File);
      const currentGalleryIds = form.getFieldValue('galleryIds') || [];
      form.setFieldsValue({ galleryIds: [...currentGalleryIds, media.id] });
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

  const handleRemoveGalleryImage = (mediaId: string) => {
    const currentGalleryIds = form.getFieldValue('galleryIds') || [];
    form.setFieldsValue({ galleryIds: currentGalleryIds.filter((id: string) => id !== mediaId) });
  };

  const handleSelectExistingMedia = (mediaId: string) => {
    const currentGalleryIds = form.getFieldValue('galleryIds') || [];
    if (!currentGalleryIds.includes(mediaId)) {
      form.setFieldsValue({ galleryIds: [...currentGalleryIds, mediaId] });
    }
  };

  const galleryIds = Form.useWatch('galleryIds', form) || [];
  const galleryImages = mediaList?.filter((m) => galleryIds.includes(m.id)) || [];

  // Prepare posts for Transfer component
  const postsForTransfer = postsList?.map((post) => ({
    key: post.slug,
    title: `${post.title_uz} / ${post.title_ru}`,
  })) || [];

  const selectedArticleSlugs = Form.useWatch('usefulArticleSlugs', form) || [];

  if (isLoading) {
    return (
      <Card>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error && (error as ApiError).status !== 404) {
    return (
      <Card>
        <div style={{ color: 'red', padding: '20px' }}>
          Xatolik: {error.message || 'Ma\'lumotlarni yuklashda xatolik yuz berdi'}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={initialValues}>
        <Tabs
          items={[
            {
              key: 'content',
              label: 'Kontent',
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Form.Item
                    label="Sarlavha (uz)"
                    name="title_uz"
                    rules={[{ required: true, message: 'Sarlavha (uz) majburiy' }]}
                  >
                    <Input placeholder="Masalan, Biz haqimizda" />
                  </Form.Item>

                  <Form.Item
                    label="Sarlavha (ru)"
                    name="title_ru"
                    rules={[{ required: true, message: 'Sarlavha (ru) majburiy' }]}
                  >
                    <Input placeholder="Например, О нас" />
                  </Form.Item>

                  <Form.Item label="Kontent (uz)" name="body_uz">
                    <RichTextEditor placeholder="O'zbekcha kontentni kiriting..." />
                  </Form.Item>

                  <Form.Item label="Kontent (ru)" name="body_ru">
                    <RichTextEditor placeholder="Введите русский контент..." />
                  </Form.Item>

                  <Form.Item label="Rasm galereyasi" name="galleryIds">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {galleryImages.map((media) => (
                          <div key={media.id} style={{ position: 'relative', width: 120, height: 120 }}>
                            <Image
                              src={media.url}
                              alt={media.alt_uz || ''}
                              width={120}
                              height={120}
                              style={{ objectFit: 'cover', borderRadius: 8 }}
                            />
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemoveGalleryImage(media.id)}
                              style={{ position: 'absolute', top: 4, right: 4 }}
                            />
                          </div>
                        ))}
                      </div>
                      <Space>
                        <Upload customRequest={handleGalleryUpload} showUploadList={false} accept="image/*">
                          <Button icon={<UploadOutlined />} loading={uploading}>
                            Rasm yuklash
                          </Button>
                        </Upload>
                        {mediaList && mediaList.length > 0 && (
                          <Select
                            placeholder="Mavjud rasmni tanlash"
                            style={{ width: 200 }}
                            showSearch
                            optionFilterProp="children"
                            onSelect={handleSelectExistingMedia}
                          >
                            {mediaList
                              .filter((m) => !galleryIds.includes(m.id))
                              .map((media) => (
                                <Select.Option key={media.id} value={media.id}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Image src={media.url} alt="" width={40} height={40} style={{ objectFit: 'cover' }} />
                                    <span>{media.alt_uz || media.filename || 'Rasm'}</span>
                                  </div>
                                </Select.Option>
                              ))}
                          </Select>
                        )}
                      </Space>
                    </div>
                  </Form.Item>

                  <Form.Item
                    label="YouTube video URL"
                    name="videoUrl"
                    help="Masalan: https://www.youtube.com/watch?v=VIDEO_ID yoki https://youtu.be/VIDEO_ID"
                  >
                    <Input placeholder="https://www.youtube.com/watch?v=..." />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: 'articles',
              label: 'Foydali maqolalar',
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Form.Item
                    label="Foydali maqolalar (sidebar'da ko'rsatiladi)"
                    name="usefulArticleSlugs"
                    help="Sidebar'da ko'rsatiladigan foydali maqolalarni tanlang"
                  >
                    <Transfer
                      dataSource={postsForTransfer}
                      titles={['Barcha maqolalar', 'Tanlangan maqolalar']}
                      targetKeys={selectedArticleSlugs}
                      onChange={(keys) => form.setFieldsValue({ usefulArticleSlugs: keys })}
                      render={(item) => item.title}
                      listStyle={{ width: 300, height: 300 }}
                    />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: 'seo',
              label: 'SEO',
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Form.Item label="Meta sarlavha (uz)" name="metaTitle_uz">
                    <Input placeholder="Meta sarlavha (uz)" />
                  </Form.Item>

                  <Form.Item label="Meta sarlavha (ru)" name="metaTitle_ru">
                    <Input placeholder="Meta заголовок (ru)" />
                  </Form.Item>

                  <Form.Item label="Meta tavsif (uz)" name="metaDescription_uz">
                    <Input.TextArea rows={3} placeholder="Meta tavsif (uz)" />
                  </Form.Item>

                  <Form.Item label="Meta tavsif (ru)" name="metaDescription_ru">
                    <Input.TextArea rows={3} placeholder="Meta описание (ru)" />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: 'settings',
              label: 'Sozlamalar',
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Form.Item
                    label="Holat"
                    name="status"
                    initialValue="published"
                  >
                    <Select>
                      <Select.Option value="published">Nashr qilingan</Select.Option>
                      <Select.Option value="draft">Qoralama</Select.Option>
                      <Select.Option value="archived">Arxivlangan</Select.Option>
                    </Select>
                  </Form.Item>
                </div>
              ),
            },
          ]}
        />

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button type="primary" htmlType="submit" loading={isSaving}>
            Saqlash
          </Button>
        </div>
      </Form>
    </Card>
  );
}
