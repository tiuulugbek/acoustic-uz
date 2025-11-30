import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Space,
  Table,
  Popconfirm,
  message,
  Select,
  Modal,
  Row,
  Col,
  Tag,
  Tooltip,
  Empty,
  Upload,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';
import MediaLibraryModal from './MediaLibraryModal';
import { normalizeImageUrl } from '../utils/image';
import { uploadMedia } from '../lib/api';
import type { MediaDto } from '../lib/api';

interface HotSpot {
  id: string;
  pitch: number;
  yaw: number;
  type: 'scene' | 'info';
  text: string;
  sceneId?: string;
  description?: string;
}

interface Scene {
  id: string;
  panorama: string;
  panoramaMediaId?: string;
  title_uz: string;
  title_ru: string;
  hfov: number;
  pitch: number;
  yaw: number;
  hotSpots: HotSpot[];
  order: number;
}

interface Tour3DEditorProps {
  value?: any;
  onChange?: (value: any) => void;
  mediaList?: MediaDto[];
}

export default function Tour3DEditor({ value, onChange, mediaList = [] }: Tour3DEditorProps) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [defaultPitch, setDefaultPitch] = useState<number>(0);
  const [defaultYaw, setDefaultYaw] = useState<number>(0);
  const [defaultHfov, setDefaultHfov] = useState<number>(100);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [editingHotSpot, setEditingHotSpot] = useState<HotSpot | null>(null);
  const [sceneModalOpen, setSceneModalOpen] = useState(false);
  const [hotSpotModalOpen, setHotSpotModalOpen] = useState(false);
  const [panoramaModalOpen, setPanoramaModalOpen] = useState(false);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const [sceneForm] = Form.useForm();
  const [hotSpotForm] = Form.useForm();
  const [previewPanoramaScene, setPreviewPanoramaScene] = useState<Scene | null>(null);
  const [previewPanoramaModalOpen, setPreviewPanoramaModalOpen] = useState(false);
  const [uploadingPanorama, setUploadingPanorama] = useState(false);
  const panoramaImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (value) {
      try {
        const config = typeof value === 'string' ? JSON.parse(value) : value;
        
        // Load default values from config
        if (config.default) {
          setDefaultPitch(config.default.pitch ?? 0);
          setDefaultYaw(config.default.yaw ?? 0);
          setDefaultHfov(config.default.hfov ?? 100);
        }
        
        if (config.scenes) {
          const scenesList = Object.entries(config.scenes).map(([id, scene]: [string, any]) => ({
            id,
            panorama: scene.panorama || '',
            panoramaMediaId: scene.panoramaMediaId,
            title_uz: typeof scene.title === 'string' ? scene.title : scene.title?.uz || '',
            title_ru: typeof scene.title === 'string' ? scene.title : scene.title?.ru || '',
            hfov: scene.hfov || 100,
            pitch: scene.pitch ?? config.default?.pitch ?? 0,
            yaw: scene.yaw ?? config.default?.yaw ?? 0,
            hotSpots: (scene.hotSpots || []).map((hs: any, index: number) => ({
              id: `hs-${id}-${index}`,
              ...hs,
            })),
            order: scene.order || 0,
          }));
          setScenes(scenesList.sort((a, b) => a.order - b.order));
        } else {
          setScenes([]);
        }
      } catch (e) {
        console.error('Error parsing tour config:', e);
        setScenes([]);
      }
    } else {
      setScenes([]);
    }
  }, [value]);

  const updateConfig = useCallback((newScenes: Scene[]) => {
    const sortedScenes = [...newScenes].sort((a, b) => a.order - b.order);
    setScenes(sortedScenes);

    const config = {
      default: {
        firstScene: sortedScenes[0]?.id || '',
        hfov: defaultHfov,
        pitch: defaultPitch,
        yaw: defaultYaw,
        autoLoad: true,
        autoRotate: -2,
        compass: true,
      },
      scenes: sortedScenes.reduce((acc, scene) => {
        acc[scene.id] = {
          id: scene.id,
          panorama: scene.panorama,
          panoramaMediaId: scene.panoramaMediaId,
          type: 'equirectangular',
          hfov: scene.hfov,
          pitch: scene.pitch,
          yaw: scene.yaw,
          title: {
            uz: scene.title_uz,
            ru: scene.title_ru,
          },
          hotSpots: scene.hotSpots.map(({ id, ...rest }) => rest),
          order: scene.order,
        };
        return acc;
      }, {} as Record<string, any>),
      autoRotate: -2,
      autoLoad: true,
      showControls: true,
      showFullscreenCtrl: true,
      showZoomCtrl: true,
      keyboardZoom: true,
      mouseZoom: true,
      compass: false,
    };

    console.log('🔄 updateConfig called:', {
      scenesCount: sortedScenes.length,
      scenes: sortedScenes.map(s => ({ id: s.id, panorama: s.panorama, hasPanorama: !!s.panorama })),
      config: JSON.stringify(config, null, 2)
    });

    onChange?.(config);
  }, [onChange, defaultPitch, defaultYaw, defaultHfov]);

  const handleAddScene = useCallback(() => {
    setEditingScene(null);
    sceneForm.resetFields();
    sceneForm.setFieldsValue({
      hfov: 100,
      pitch: 0,
      yaw: 0,
      order: scenes.length,
    });
    setSceneModalOpen(true);
  }, [scenes.length, sceneForm]);

  const handleEditScene = useCallback((scene: Scene) => {
    setEditingScene(scene);
    sceneForm.setFieldsValue({
      id: scene.id,
      title_uz: scene.title_uz,
      title_ru: scene.title_ru,
      panorama: scene.panorama,
      panoramaMediaId: scene.panoramaMediaId,
      hfov: scene.hfov,
      pitch: scene.pitch,
      yaw: scene.yaw,
      order: scene.order,
    });
    setSceneModalOpen(true);
  }, [sceneForm]);

  const handleSaveScene = async () => {
    try {
      const values = await sceneForm.validateFields();
      const newScene: Scene = {
        id: values.id || `scene-${Date.now()}`,
        panorama: values.panorama || '',
        panoramaMediaId: values.panoramaMediaId || editingScene?.panoramaMediaId,
        title_uz: values.title_uz,
        title_ru: values.title_ru,
        hfov: values.hfov || 100,
        pitch: values.pitch || 0,
        yaw: values.yaw || 0,
        hotSpots: editingScene?.hotSpots || [],
        order: values.order ?? scenes.length,
      };

      if (editingScene) {
        const updated = scenes.map((s) => (s.id === editingScene.id ? newScene : s));
        updateConfig(updated);
      } else {
        updateConfig([...scenes, newScene]);
      }

      setSceneModalOpen(false);
      message.success('Sahna saqlandi');
    } catch (e) {
      console.error('Error saving scene:', e);
    }
  };

  const handleDeleteScene = useCallback((sceneId: string) => {
    const updated = scenes.filter((s) => s.id !== sceneId);
    updateConfig(updated);
    message.success('Sahna o\'chirildi');
  }, [scenes, updateConfig]);

  const handleAddHotSpot = useCallback((sceneId: string) => {
    setCurrentSceneId(sceneId);
    setEditingHotSpot(null);
    hotSpotForm.resetFields();
    hotSpotForm.setFieldsValue({
      type: 'info',
      pitch: 0,
      yaw: 0,
    });
    setHotSpotModalOpen(true);
  }, [hotSpotForm]);

  const handleEditHotSpot = (sceneId: string, hotSpot: HotSpot) => {
    setCurrentSceneId(sceneId);
    setEditingHotSpot(hotSpot);
    hotSpotForm.setFieldsValue({
      pitch: hotSpot.pitch,
      yaw: hotSpot.yaw,
      type: hotSpot.type,
      text: hotSpot.text,
      sceneId: hotSpot.sceneId,
      description: hotSpot.description,
    });
    setHotSpotModalOpen(true);
  };

  const handleSaveHotSpot = async () => {
    try {
      const values = await hotSpotForm.validateFields();
      if (!currentSceneId) return;

      const newHotSpot: HotSpot = {
        id: editingHotSpot?.id || `hs-${Date.now()}`,
        pitch: values.pitch,
        yaw: values.yaw,
        type: values.type,
        text: values.text,
        sceneId: values.type === 'scene' ? values.sceneId : undefined,
        description: values.type === 'info' ? values.description : undefined,
      };

      const updated = scenes.map((scene) => {
        if (scene.id === currentSceneId) {
          if (editingHotSpot) {
            return {
              ...scene,
              hotSpots: scene.hotSpots.map((hs) => (hs.id === editingHotSpot.id ? newHotSpot : hs)),
            };
          } else {
            return {
              ...scene,
              hotSpots: [...scene.hotSpots, newHotSpot],
            };
          }
        }
        return scene;
      });

      updateConfig(updated);
      setHotSpotModalOpen(false);
      message.success('Hotspot saqlandi');
    } catch (e) {
      console.error('Error saving hotspot:', e);
    }
  };

  const handleDeleteHotSpot = (sceneId: string, hotSpotId: string) => {
    const updated = scenes.map((scene) => {
      if (scene.id === sceneId) {
        return {
          ...scene,
          hotSpots: scene.hotSpots.filter((hs) => hs.id !== hotSpotId),
        };
      }
      return scene;
    });
    updateConfig(updated);
    message.success('Hotspot o\'chirildi');
  };

  const handleSelectPanorama = (media: MediaDto) => {
    if (!currentSceneId) return;

    const updated = scenes.map((scene) => {
      if (scene.id === currentSceneId) {
        const updatedScene = {
          ...scene,
          panorama: normalizeImageUrl(media.url),
          panoramaMediaId: media.id,
        };
        sceneForm.setFieldsValue({
          panorama: normalizeImageUrl(media.url),
          panoramaMediaId: media.id,
        });
        return updatedScene;
      }
      return scene;
    });

    updateConfig(updated);
    setPanoramaModalOpen(false);
    message.success('Panorama rasm tanlandi');
  };

  const handleUploadPanorama = async (file: File, sceneId: string) => {
    setUploadingPanorama(true);
    setCurrentSceneId(sceneId);
    try {
      console.log('🔄 Uploading panorama image:', { fileName: file.name, sceneId });
      
      // Panorama rasmlar uchun skipWebp=true (WebP convertatsiyasini o'chirish)
      const media = await uploadMedia(file, undefined, undefined, true);
      
      console.log('✅ Panorama image uploaded:', { mediaId: media.id, url: media.url, normalizedUrl: normalizeImageUrl(media.url) });
      
      const normalizedUrl = normalizeImageUrl(media.url);
      
      const updated = scenes.map((scene) => {
        if (scene.id === sceneId) {
          const updatedScene = {
            ...scene,
            panorama: normalizedUrl,
            panoramaMediaId: media.id,
          };
          
          console.log('🔄 Updating scene:', { sceneId, panorama: normalizedUrl });
          
          // Update form fields
          sceneForm.setFieldsValue({
            panorama: normalizedUrl,
            panoramaMediaId: media.id,
          });
          
          return updatedScene;
        }
        return scene;
      });

      console.log('🔄 Updating config with scenes:', updated);
      updateConfig(updated);
      
      message.success('Panorama rasm yuklandi (original format saqlandi)');
    } catch (error: any) {
      console.error('❌ Error uploading panorama:', error);
      const errorMessage = error?.message || 'Panorama rasm yuklashda xatolik';
      message.error(errorMessage);
    } finally {
      setUploadingPanorama(false);
    }
  };

  const handlePanoramaClick = useCallback((e: React.MouseEvent<HTMLImageElement>, scene: Scene) => {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Equirectangular panorama uchun pitch va yaw hisoblash
    const width = rect.width;
    const height = rect.height;
    
    // Pitch: -90 (past) dan +90 (yuqori) gacha
    // y=0 (yuqori) bo'lsa pitch=90, y=height (past) bo'lsa pitch=-90
    const pitch = 90 - ((y / height) * 180);
    
    // Yaw: -180 dan +180 gacha
    // x=0 (chap) bo'lsa yaw=-180, x=width (o'ng) bo'lsa yaw=180
    const yaw = ((x / width) * 360) - 180;
    
    // Hotspot qo'shish modalini ochish
    setCurrentSceneId(scene.id);
    hotSpotForm.setFieldsValue({
      pitch: Math.round(pitch * 10) / 10,
      yaw: Math.round(yaw * 10) / 10,
      type: 'info',
      text: '',
      description: '',
    });
    setHotSpotModalOpen(true);
    
    message.info(`Pozitsiya belgilandi: Pitch=${Math.round(pitch * 10) / 10}, Yaw=${Math.round(yaw * 10) / 10}`);
  }, [hotSpotForm]);

  const handlePreviewPanorama = useCallback((scene: Scene) => {
    setPreviewPanoramaScene(scene);
    setPreviewPanoramaModalOpen(true);
  }, []);

  const sceneColumns: ColumnsType<Scene> = useMemo(() => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
    },
    {
      title: 'Nomi (uz)',
      dataIndex: 'title_uz',
      key: 'title_uz',
    },
    {
      title: 'Panorama',
      key: 'panorama',
      render: (_, record) => (
        <div>
          {record.panorama ? (
            <div style={{ position: 'relative' }}>
              <img
                src={normalizeImageUrl(record.panorama)}
                alt={record.title_uz}
                style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
                onClick={() => handlePreviewPanorama(record)}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="60"%3E%3Crect fill="%23f5f5f5" width="100" height="60"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="10" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ERasm%3C/text%3E%3C/svg%3E';
                }}
              />
              <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>
                <Button
                  type="link"
                  size="small"
                  onClick={() => handlePreviewPanorama(record)}
                  style={{ padding: 0, height: 'auto', fontSize: 10 }}
                >
                  Hotspot belgilash
                </Button>
              </div>
            </div>
          ) : (
            <span style={{ color: '#999' }}>Rasm yo'q</span>
          )}
        </div>
      ),
    },
    {
      title: 'Hotspotlar',
      key: 'hotSpots',
      render: (_, record) => (
        <div>
          <span>{record.hotSpots.length} ta</span>
          <Button
            type="link"
            size="small"
            onClick={() => handleAddHotSpot(record.id)}
            style={{ marginLeft: 8 }}
          >
            + Qo'shish
          </Button>
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
      title: 'Amallar',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditScene(record)}
          >
            Tahrirlash
          </Button>
          {record.panorama && (
            <Button
              size="small"
              type="primary"
              onClick={() => handlePreviewPanorama(record)}
            >
              Hotspot belgilash
            </Button>
          )}
          <Popconfirm
            title="Sahnani o'chirish"
            description="Ushbu sahna va barcha hotspot'lar o'chiriladi. Davom etasizmi?"
            onConfirm={() => handleDeleteScene(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              O'chirish
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ], [handlePreviewPanorama, handleAddHotSpot, handleEditScene, handleDeleteScene]);

  return (
    <div>
      <Card style={{ marginBottom: 16 }} title="Boshlang'ich ko'rinish sozlamalari" size="small">
        <Row gutter={16}>
          <Col span={8}>
            <div>
              <strong>Default HFOV:</strong>
              <InputNumber
                min={50}
                max={150}
                value={defaultHfov}
                onChange={(val) => {
                  const newVal = val ?? 100;
                  setDefaultHfov(newVal);
                  updateConfig(scenes);
                }}
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>
          </Col>
          <Col span={8}>
            <div>
              <strong>Default Pitch:</strong>
              <InputNumber
                min={-90}
                max={90}
                value={defaultPitch}
                onChange={(val) => {
                  const newVal = val ?? 0;
                  setDefaultPitch(newVal);
                  updateConfig(scenes);
                }}
                style={{ width: '100%', marginTop: 4 }}
              />
              <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                -90 (past) dan +90 (yuqori) gacha
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div>
              <strong>Default Yaw:</strong>
              <InputNumber
                min={-180}
                max={180}
                value={defaultYaw}
                onChange={(val) => {
                  const newVal = val ?? 0;
                  setDefaultYaw(newVal);
                  updateConfig(scenes);
                }}
                style={{ width: '100%', marginTop: 4 }}
              />
              <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                -180 (chap) dan +180 (o'ng) gacha
              </div>
            </div>
          </Col>
        </Row>
        <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
          💡 Bu qiymatlar panoramani boshlanish nuqtasini belgilaydi. Agar sahna'da pitch/yaw belgilanmagan bo'lsa, bu default qiymatlar ishlatiladi.
        </div>
      </Card>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddScene}>
          Yangi sahna qo'shish
        </Button>
      </div>

      <Table
        columns={sceneColumns}
        dataSource={scenes}
        rowKey="id"
        pagination={false}
        loading={false}
        size="small"
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
              <h4>Hotspotlar ({record.hotSpots.length})</h4>
              {record.hotSpots.length === 0 ? (
                <p style={{ color: '#999' }}>Hotspot'lar yo'q</p>
              ) : (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {record.hotSpots.map((hs) => (
                    <Card key={hs.id} size="small">
                      <Row gutter={16}>
                        <Col span={6}>
                          <strong>Tur:</strong> {hs.type === 'scene' ? 'Sahna' : 'Ma\'lumot'}
                        </Col>
                        <Col span={6}>
                          <strong>Pitch:</strong> {hs.pitch}
                        </Col>
                        <Col span={6}>
                          <strong>Yaw:</strong> {hs.yaw}
                        </Col>
                        <Col span={6}>
                          <Space>
                            <Button
                              size="small"
                              onClick={() => handleEditHotSpot(record.id, hs)}
                            >
                              Tahrirlash
                            </Button>
                            <Popconfirm
                              title="Hotspot'ni o'chirish"
                              onConfirm={() => handleDeleteHotSpot(record.id, hs.id)}
                            >
                              <Button size="small" danger>
                                O'chirish
                              </Button>
                            </Popconfirm>
                          </Space>
                        </Col>
                      </Row>
                      <div style={{ marginTop: 8 }}>
                        <strong>Matn:</strong> {hs.text}
                        {hs.type === 'scene' && hs.sceneId && (
                          <span style={{ marginLeft: 8 }}>
                            → {hs.sceneId}
                          </span>
                        )}
                        {hs.type === 'info' && hs.description && (
                          <div style={{ marginTop: 4, color: '#666' }}>
                            {hs.description}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </Space>
              )}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => handleAddHotSpot(record.id)}
                style={{ marginTop: 8 }}
                block
              >
                Hotspot qo'shish
              </Button>
            </div>
          ),
        }}
      />

      {/* Scene Modal */}
      <Modal
        title={editingScene ? 'Sahnani tahrirlash' : 'Yangi sahna'}
        open={sceneModalOpen}
        onOk={handleSaveScene}
        onCancel={() => setSceneModalOpen(false)}
        width={600}
      >
        <Form form={sceneForm} layout="vertical">
          <Form.Item
            label="ID"
            name="id"
            rules={[{ required: true, message: 'ID kiriting' }]}
            extra="Sahna identifikatori (masalan: hall, room1)"
          >
            <Input disabled={!!editingScene} />
          </Form.Item>
          <Form.Item
            label="Nomi (uz)"
            name="title_uz"
            rules={[{ required: true, message: 'Nomi kiriting' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Nomi (ru)"
            name="title_ru"
            rules={[{ required: true, message: 'Nomi kiriting' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Panorama rasm" name="panorama">
            <div>
              {sceneForm.getFieldValue('panorama') && (
                <img
                  src={normalizeImageUrl(sceneForm.getFieldValue('panorama'))}
                  alt="Preview"
                  style={{ width: 200, height: 120, objectFit: 'cover', borderRadius: 4, marginBottom: 8 }}
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="120"%3E%3Crect fill="%23f5f5f5" width="200" height="120"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="12" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ERasm%3C/text%3E%3C/svg%3E';
                  }}
                />
              )}
              <Space direction="vertical" style={{ width: '100%' }}>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={async (file) => {
                    const sceneId = sceneForm.getFieldValue('id');
                    if (!sceneId) {
                      message.warning('Avval sahna ID sini kiriting');
                      return false;
                    }
                    await handleUploadPanorama(file, sceneId);
                    return false;
                  }}
                  disabled={uploadingPanorama}
                >
                  <Button icon={<UploadOutlined />} loading={uploadingPanorama} block>
                    Panorama rasm yuklash (WebP o'chirilgan)
                  </Button>
                </Upload>
                <Button
                  onClick={() => {
                    const sceneId = sceneForm.getFieldValue('id');
                    if (sceneId) {
                      setCurrentSceneId(sceneId);
                      setPanoramaModalOpen(true);
                    } else {
                      message.warning('Avval sahna ID sini kiriting');
                    }
                  }}
                  block
                >
                  Media kutubxonasidan tanlash
                </Button>
              </Space>
              <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                💡 Panorama rasmlar uchun WebP convertatsiyasi o'chirilgan (original format saqlanadi)
              </div>
            </div>
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="HFOV" name="hfov">
                <InputNumber min={50} max={150} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Pitch" name="pitch">
                <InputNumber min={-90} max={90} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Yaw" name="yaw">
                <InputNumber min={-180} max={180} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Tartib" name="order">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* HotSpot Modal */}
      <Modal
        title={editingHotSpot ? 'Hotspot\'ni tahrirlash' : 'Yangi hotspot'}
        open={hotSpotModalOpen}
        onOk={handleSaveHotSpot}
        onCancel={() => setHotSpotModalOpen(false)}
        width={500}
      >
        <Form form={hotSpotForm} layout="vertical">
          <Form.Item
            label="Tur"
            name="type"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="scene">Sahna (boshqa sahna'ga o'tish)</Select.Option>
              <Select.Option value="info">Ma'lumot (tooltip ko'rsatish)</Select.Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Pitch"
                name="pitch"
                rules={[{ required: true }]}
              >
                <InputNumber min={-90} max={90} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Yaw"
                name="yaw"
                rules={[{ required: true }]}
              >
                <InputNumber min={-180} max={180} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Matn"
            name="text"
            rules={[{ required: true, message: 'Matn kiriting' }]}
          >
            <Input />
          </Form.Item>
          {hotSpotForm.getFieldValue('type') === 'scene' && (
            <Form.Item
              label="Sahna ID"
              name="sceneId"
              rules={[{ required: true, message: 'Sahna ID kiriting' }]}
              extra="O'tiladigan sahna ID si"
            >
              <Select>
                {scenes.map((s) => (
                  <Select.Option key={s.id} value={s.id}>
                    {s.title_uz} ({s.id})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
          {hotSpotForm.getFieldValue('type') === 'info' && (
            <Form.Item
              label="Tavsif"
              name="description"
              rules={[{ required: true, message: 'Tavsif kiriting' }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Panorama Media Library Modal */}
      <MediaLibraryModal
        open={panoramaModalOpen}
        onCancel={() => setPanoramaModalOpen(false)}
        onSelect={handleSelectPanorama}
        fileType="image"
      />

      {/* Panorama Preview Modal for Hotspot Selection */}
      <Modal
        title={`Hotspot belgilash: ${previewPanoramaScene?.title_uz || ''}`}
        open={previewPanoramaModalOpen}
        onCancel={() => {
          setPreviewPanoramaModalOpen(false);
          setPreviewPanoramaScene(null);
        }}
        footer={null}
        width={900}
      >
        {previewPanoramaScene && (
          <div>
            <div style={{ marginBottom: 16, padding: 12, background: '#f0f0f0', borderRadius: 4 }}>
              <p style={{ margin: 0, fontWeight: 500 }}>
                📍 Panorama rasmdan hotspot pozitsiyasini belgilash:
              </p>
              <ol style={{ margin: '8px 0 0 20px', padding: 0 }}>
                <li>Panorama rasmdan kerakli joyga bosing</li>
                <li>Hotspot qo'shish formasi avtomatik ochiladi</li>
                <li>Pitch va Yaw qiymatlari avtomatik to'ldiriladi</li>
                <li>Hotspot turi va matnini kiriting</li>
              </ol>
            </div>
            <div style={{ position: 'relative', width: '100%', textAlign: 'center', backgroundColor: '#000', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                <img
                  ref={panoramaImgRef}
                  src={normalizeImageUrl(previewPanoramaScene.panorama)}
                  alt={previewPanoramaScene.title_uz}
                  onClick={(e) => handlePanoramaClick(e, previewPanoramaScene)}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '600px',
                    aspectRatio: '2 / 1',
                    objectFit: 'contain',
                    cursor: 'crosshair',
                    display: 'block',
                  }}
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23f5f5f5" width="800" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EPanorama rasm yuklanmadi%3C/text%3E%3C/svg%3E';
                  }}
                />
                {/* Render existing hotspots as visual markers */}
                {previewPanoramaScene.hotSpots.map((hs) => {
                  if (!panoramaImgRef.current) return null;
                  
                  const rect = panoramaImgRef.current.getBoundingClientRect();
                  const width = rect.width;
                  const height = rect.height;
                  
                  // Convert pitch/yaw to x/y coordinates
                  // Pitch: -90 (past) to +90 (yuqori)
                  // Yaw: -180 (chap) to +180 (o'ng)
                  // y = ((90 - pitch) / 180) * height (y=0 yuqori, y=height past)
                  // x = ((yaw + 180) / 360) * width (x=0 chap, x=width o'ng)
                  const y = ((90 - hs.pitch) / 180) * height;
                  const x = ((hs.yaw + 180) / 360) * width;
                  
                  return (
                    <Tooltip
                      key={hs.id}
                      title={`${hs.text}${hs.type === 'scene' ? ` → ${hs.sceneId}` : ''} (Pitch: ${hs.pitch}, Yaw: ${hs.yaw})`}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: `${(x / width) * 100}%`,
                          top: `${(y / height) * 100}%`,
                          transform: 'translate(-50%, -50%)',
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: hs.type === 'scene' ? 'rgba(255, 165, 0, 0.9)' : 'rgba(0, 123, 255, 0.9)',
                          border: '3px solid white',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                          zIndex: 10,
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditHotSpot(previewPanoramaScene.id, hs);
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </div>
              <div style={{ marginTop: 12, padding: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: 4, fontSize: 12 }}>
                💡 Hotspot qo'shish uchun rasmdan kerakli joyga bosing. Mavjud hotspot'larni ko'rish uchun ularga hover qiling.
              </div>
            </div>
            {previewPanoramaScene.hotSpots.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>Mavjud hotspot'lar:</h4>
                <Space wrap>
                  {previewPanoramaScene.hotSpots.map((hs) => (
                    <Tag key={hs.id} color="blue">
                      {hs.text} (Pitch: {hs.pitch}, Yaw: {hs.yaw})
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

