import { Layout, Menu, Spin, message } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  TeamOutlined,
  SolutionOutlined,
  BookOutlined,
  FileTextOutlined,
  LogoutOutlined,
  CustomerServiceOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  PictureOutlined,
  OrderedListOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, logout, ApiError, UserDto } from '../lib/api';
import { useEffect } from 'react';

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps['items'] = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: 'Bosh sahifa',
  },
  {
    key: '/services',
    icon: <CustomerServiceOutlined />,
    label: 'Xizmatlar',
  },
  {
    key: '/catalog',
    icon: <AppstoreOutlined />,
    label: 'Katalog',
  },
  {
    key: '/brands',
    icon: <AppstoreOutlined />,
    label: 'Brendlar',
  },
  {
    key: '/doctors',
    icon: <TeamOutlined />,
    label: 'Mutaxassislar',
  },
  {
    key: '/patients',
    icon: <SolutionOutlined />,
    label: 'Bemorlar',
  },
  {
    key: '/children-hearing',
    icon: <BookOutlined />,
    label: 'Bolalar',
  },
  {
    key: '/about',
    icon: <InfoCircleOutlined />,
    label: 'Biz haqimizda',
  },
  {
    key: '/branches',
    icon: <EnvironmentOutlined />,
    label: 'Filiallar',
  },
  {
    type: 'divider',
    key: 'divider-1',
  },
  {
    key: '/posts',
    icon: <FileTextOutlined />,
    label: 'Yangiliklar',
  },
  {
    key: '/banners',
    icon: <PictureOutlined />,
    label: 'Slaydlar',
  },
  {
    key: '/menus',
    icon: <OrderedListOutlined />,
    label: 'Menyu',
  },
  {
    key: '/faq',
    icon: <QuestionCircleOutlined />,
    label: 'Savol-Javob',
  },
  {
    key: '/homepage',
    icon: <InfoCircleOutlined />,
    label: 'Bosh sahifa kontenti',
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const selectedKey = menuItems?.find((item) => item?.key === location.pathname)
    ? [location.pathname]
    : ['/'];

  const {
    data: currentUser,
    isLoading,
    isError,
    error,
  } = useQuery<UserDto, ApiError>({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      const err = error as ApiError;
      if (err.status === 401) {
        navigate('/login', { replace: true });
      } else {
        message.error(err.message || 'Auth xatoligi');
      }
    }
  }, [isError, error, navigate]);

  const { mutateAsync: logoutMutation, isPending: isLoggingOut } = useMutation<void, ApiError, void>({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      message.error(error.message || 'Chiqishda xatolik');
    },
  });

  if (isLoading || isLoggingOut) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const handleLogout = async () => {
    await logoutMutation();
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={220} breakpoint="lg" collapsedWidth={0}>
        <div style={{ padding: '16px', fontSize: '20px', fontWeight: 600, color: '#F07E22' }}>
          Acoustic.uz
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedKey}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#F07E22' }}>Admin panel</h1>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#6b7280',
                fontSize: '13px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <LogoutOutlined />
              Chiqish
            </button>
          </div>
        </Header>
        <Content style={{ margin: '24px', padding: '24px', background: '#fff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
