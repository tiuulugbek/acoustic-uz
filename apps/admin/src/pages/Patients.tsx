import { Tabs } from 'antd';
import PageEditor from '../components/*Editor';
import SectionPostsPage from './SectionPosts';

export default function PatientsPage() {
  const tabItems = [
    {
      key: 'content',
      label: 'Kontent',
      children: <PageEditor slug="patients" defaultTitleUz="Bemorlar" defaultTitleRu="Пациентам" />,
    },
    {
      key: 'posts',
      label: 'Maqolalar',
      children: <SectionPostsPage section="patients" sectionName={{ uz: 'Bemorlar', ru: 'Пациентам' }} />,
    },
  ];

  return <Tabs items={tabItems} defaultActiveKey="posts" />;
}
