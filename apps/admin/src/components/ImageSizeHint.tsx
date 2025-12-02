import { Alert, Tag } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

export type ImageSizeType = 
  | 'banner' 
  | 'product' 
  | 'product-gallery' 
  | 'service' 
  | 'catalog' 
  | 'doctor' 
  | 'branch'
  | 'post'
  | 'logo';

interface ImageSizeHintProps {
  type: ImageSizeType;
  showAsAlert?: boolean;
}

const imageSizeConfig: Record<ImageSizeType, { size: string; aspectRatio: string; description: string }> = {
  banner: {
    size: '1920x800px',
    aspectRatio: '12:5 (2.4:1)',
    description: 'Hero slider uchun katta banner rasm. Keng format, yuqori sifatli.',
  },
  product: {
    size: '800x800px',
    aspectRatio: '1:1 (kvadrat)',
    description: 'Mahsulot asosiy rasmi. Kvadrat format, yuqori aniqlik.',
  },
  'product-gallery': {
    size: '1200x1200px',
    aspectRatio: '1:1 (kvadrat)',
    description: 'Mahsulot galereyasi rasmlari. Kvadrat format, yuqori aniqlik.',
  },
  service: {
    size: '800x600px',
    aspectRatio: '4:3',
    description: 'Xizmat kartasi rasmi. Standart format.',
  },
  catalog: {
    size: '256x256px',
    aspectRatio: '1:1 (kvadrat)',
    description: 'Katalog rasmi. Kvadrat format, katalog kartochkalarida ko\'rsatiladi (128x128px ko\'rinishda).',
  },
  doctor: {
    size: '400x400px',
    aspectRatio: '1:1 (kvadrat)',
    description: 'Shifokor rasmi. Kvadrat format, portret.',
  },
  branch: {
    size: '1200x800px',
    aspectRatio: '3:2',
    description: 'Filial rasmi. Keng format.',
  },
  post: {
    size: '1200x630px',
    aspectRatio: '1.91:1',
    description: 'Maqola rasmi. Keng format, social media uchun mos.',
  },
  logo: {
    size: '400x200px',
    aspectRatio: '2:1',
    description: 'Logo rasm. Keng format, shaffof fon bilan.',
  },
};

export default function ImageSizeHint({ type, showAsAlert = true }: ImageSizeHintProps) {
  const config = imageSizeConfig[type];
  
  if (!config) {
    return null;
  }

  const content = (
    <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
      <div style={{ marginBottom: '4px' }}>
        <strong>Rasm o'lchami:</strong>{' '}
        <Tag color="blue" style={{ margin: '0 4px' }}>
          {config.size}
        </Tag>
        <Tag color="green" style={{ margin: '0 4px' }}>
          {config.aspectRatio}
        </Tag>
      </div>
      <div style={{ color: '#666', fontSize: '11px' }}>
        {config.description}
      </div>
    </div>
  );

  if (showAsAlert) {
    return (
      <Alert
        message={content}
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        style={{ marginBottom: 16 }}
        closable={false}
      />
    );
  }

  return (
    <div style={{ 
      padding: '8px 12px', 
      background: '#f0f2f5', 
      borderRadius: '4px', 
      marginBottom: '16px',
      border: '1px solid #d9d9d9'
    }}>
      {content}
    </div>
  );
}

