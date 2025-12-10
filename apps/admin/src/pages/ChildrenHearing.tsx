import { Tabs } from 'antd';
import PageEditor from '../components/PageEditor';
import SectionPostsPage from './SectionPosts';

export default function ChildrenHearingPage() {
  const tabItems = [
    {
      key: 'content',
      label: 'Kontent',
      children: <PageEditor slug="children-hearing" defaultTitleUz="Bolalar va eshitish" defaultTitleRu="Дети и слух" />,
    },
    {
      key: 'posts',
      label: 'Maqolalar',
      children: <SectionPostsPage section="children" sectionName={{ uz: 'Bolalar', ru: 'Дети' }} />,
    },
  ];

  return <Tabs items={tabItems} defaultActiveKey="posts" />;
}
