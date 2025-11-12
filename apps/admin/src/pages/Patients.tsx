import { Card, Typography } from 'antd';

export default function PatientsPage() {
  return (
    <Card>
      <Typography.Title level={3}>Bemorlar uchun maʼlumot</Typography.Title>
      <Typography.Paragraph>
        Bemorlar bo‘limidagi kontentni boshqarish imkoniyatlari ustida ishlayapmiz.
      </Typography.Paragraph>
    </Card>
  );
}
