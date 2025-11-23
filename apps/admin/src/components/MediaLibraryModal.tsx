import { useState, useMemo } from 'react';
import {
  Modal,
  Input,
  Select,
  Image,
  Card,
  Empty,
  Spin,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  FileImageOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  getMedia,
  type MediaDto,
  ApiError,
} from '../lib/api';

type FileType = 'all' | 'image' | 'other';

interface MediaLibraryModalProps {
  open: boolean;
  onCancel: () => void;
  onSelect: (media: MediaDto) => void;
  multiple?: boolean;
  fileType?: FileType;
  selectedMediaIds?: string[];
}

export default function MediaLibraryModal({
  open,
  onCancel,
  onSelect,
  multiple = false,
  fileType = 'all',
  selectedMediaIds = [],
}: MediaLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<FileType>(fileType);

  const { data: mediaList, isLoading } = useQuery<MediaDto[], ApiError>({
    queryKey: ['media'],
    queryFn: getMedia,
    enabled: open,
  });

  const filteredMedia = useMemo(() => {
    if (!mediaList) return [];

    let filtered = mediaList;

    // Filter by file type
    if (fileTypeFilter === 'image') {
      filtered = filtered.filter((media) => media.mimeType?.startsWith('image/'));
    } else if (fileTypeFilter === 'other') {
      filtered = filtered.filter((media) => !media.mimeType?.startsWith('image/'));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (media) =>
          media.filename.toLowerCase().includes(query) ||
          media.alt_uz?.toLowerCase().includes(query) ||
          media.alt_ru?.toLowerCase().includes(query)
      );
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [mediaList, searchQuery, fileTypeFilter]);

  const isSelected = (mediaId: string) => selectedMediaIds.includes(mediaId);

  const isImage = (mimeType: string) => mimeType?.startsWith('image/');

  // Helper function to normalize image URLs
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

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Media kutubxonasi"
      width={900}
      footer={null}
      style={{ top: 20 }}
    >
      {/* Filters */}
      <div style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Input
              placeholder="Qidirish..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={12}>
            <Select
              style={{ width: '100%' }}
              value={fileTypeFilter}
              onChange={setFileTypeFilter}
              options={[
                { label: 'Barchasi', value: 'all' },
                { label: 'Rasmlar', value: 'image' },
                { label: 'Boshqa', value: 'other' },
              ]}
            />
          </Col>
        </Row>
      </div>

      {/* Media Grid */}
      <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '8px 0' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : filteredMedia.length === 0 ? (
          <Empty description="Media topilmadi" />
        ) : (
          <Row gutter={[12, 12]}>
            {filteredMedia.map((media) => {
              const selected = isSelected(media.id);
              return (
                <Col xs={8} sm={6} md={4} key={media.id}>
                  <Card
                    hoverable
                    style={{
                      position: 'relative',
                      border: selected ? '2px solid #F07E22' : '1px solid #f0f0f0',
                      cursor: 'pointer',
                    }}
                    onClick={() => onSelect(media)}
                    cover={
                      isImage(media.mimeType) ? (
                        <div style={{ position: 'relative', paddingTop: '100%', backgroundColor: '#f5f5f5' }}>
                          <img
                            src={normalizeImageUrl(media.url)}
                            alt={media.alt_uz || media.filename}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          {selected && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: '#F07E22',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                              }}
                            >
                              <CheckOutlined />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ padding: '30px 10px', textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                          <FileImageOutlined style={{ fontSize: 32, color: '#999' }} />
                        </div>
                      )
                    }
                  >
                    <div style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {media.filename}
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </Modal>
  );
}

