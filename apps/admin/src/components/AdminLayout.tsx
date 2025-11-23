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
import { useEffect, useState } from 'react';

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
    label: 'Maqolalar',
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
    type: 'divider',
    key: 'divider-2',
  },
  {
    key: '/media',
    icon: <PictureOutlined />,
    label: 'Media kutubxonasi',
  },
  {
    type: 'divider',
    key: 'divider-3',
  },
  {
    key: '/settings',
    icon: <InfoCircleOutlined />,
    label: 'Sozlamalar',
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const selectedKey = menuItems?.find((item) => item?.key === location.pathname)
    ? [location.pathname]
    : ['/'];

  // Use useState to manage user - initialize from localStorage immediately
  const [userState, setUserState] = useState<UserDto | null>(() => {
    try {
      const stored = localStorage.getItem('admin_user');
      if (stored) {
        const user = JSON.parse(stored) as UserDto;
        queryClient.setQueryData(['auth', 'me'], user);
        return user;
      }
    } catch (err) {
      // ignore
    }
    return null;
  });

  const {
    data: currentUser,
    isLoading,
    isError,
    error,
  } = useQuery<UserDto, ApiError>({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
    retry: false,
    enabled: !userState,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Update state when API returns user
  useEffect(() => {
    if (currentUser && (!userState || currentUser.id !== userState.id)) {
      setUserState(currentUser);
      try {
        localStorage.setItem('admin_user', JSON.stringify(currentUser));
      } catch (err) {
        // ignore
      }
    }
  }, [currentUser, userState]);

  // Watch for cache updates (e.g., after login)
  useEffect(() => {
    const cachedUser = queryClient.getQueryData<UserDto>(['auth', 'me']);
    if (cachedUser && (!userState || cachedUser.id !== userState.id)) {
      setUserState(cachedUser);
      try {
        localStorage.setItem('admin_user', JSON.stringify(cachedUser));
      } catch (err) {
        // ignore
      }
    }
  }, [queryClient, userState]);

  const userToDisplay = userState;

  useEffect(() => {
    if (isError) {
      const err = error as ApiError;
      if (err.status === 401 && !userState) {
        navigate('/login', { replace: true });
      } else if (err.status !== 401) {
        message.error(err.message || 'Auth xatoligi');
      }
    }
  }, [isError, error, navigate, userState]);

  const { mutateAsync: logoutMutation, isPending: isLoggingOut } = useMutation<void, ApiError, void>({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      try {
        localStorage.removeItem('admin_user');
      } catch (err) {
        // ignore
      }
      setUserState(null);
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      message.error(error.message || 'Chiqishda xatolik');
    },
  });

  const handleLogout = async () => {
    await logoutMutation();
  };

  if (isLoading || isLoggingOut) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!userToDisplay) {
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        theme="light" 
        width={220} 
        breakpoint="lg" 
        collapsedWidth={0}
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '16px', fontSize: '20px', fontWeight: 600, color: '#F07E22', flexShrink: 0 }}>
          Acoustic.uz
        </div>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <Menu
            mode="inline"
            selectedKeys={selectedKey}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 0, height: '100%' }}
          />
        </div>
      </Sider>
      <Layout style={{ marginLeft: 220 }}>
        <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#F07E22', margin: 0 }}>Admin panel</h1>
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
        <Content style={{ margin: '24px', padding: '24px', background: '#fff', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
