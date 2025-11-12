import { Card, Typography } from 'antd';

export default function DoctorsPage() {
  return (
    <Card>
      <Typography.Title level={3}>Shifokorlar bo‘limi</Typography.Title>
      <Typography.Paragraph>
        Klinik mutaxassislar haqidagi maʼlumotlarni boshqarish uchun interfeys tez orada tayyor bo‘ladi.
      </Typography.Paragraph>
    </Card>
  );
}
