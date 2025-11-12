import { Card, Typography } from 'antd';

export default function AboutPage() {
  return (
    <Card>
      <Typography.Title level={3}>Biz haqimizda</Typography.Title>
      <Typography.Paragraph>
        Markaz haqida maʼlumot va kontentni boshqarish imkoniyatlari tez orada qo‘shiladi.
      </Typography.Paragraph>
    </Card>
  );
}
