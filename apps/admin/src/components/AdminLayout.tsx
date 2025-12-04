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

const { Header, Sider, Content, Footer } = Layout;

// Version state - will be loaded dynamically to avoid cache issues
const getInitialVersion = (): { version: string; buildTime: string } => {
  // Try to get from window object first (injected by plugin)
  if (typeof window !== 'undefined') {
    if ((window as any).__APP_VERSION__ && (window as any).__BUILD_TIME__) {
      return {
        version: (window as any).__APP_VERSION__,
        buildTime: (window as any).__BUILD_TIME__,
      };
    }
  }
  // Fallback
  return {
    version: '1.0.0',
    buildTime: new Date().toISOString(),
  };
};

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
  const [versionInfo, setVersionInfo] = useState<{ version: string; buildTime: string }>(getInitialVersion);

  const selectedKey = menuItems?.find((item) => item?.key === location.pathname)
    ? [location.pathname]
    : ['/'];

  // Load version from version.json file (with cache busting) on mount
  useEffect(() => {
    // Log initial version
    console.log('[AdminLayout] Initial version from window:', (window as any).__APP_VERSION__);
    console.log('[AdminLayout] Initial versionInfo state:', versionInfo);
    
    // Try to fetch version.json with cache busting
    const fetchVersion = async () => {
      try {
        const response = await fetch(`/version.json?t=${Date.now()}`, {
          cache: 'no-store', // Disable cache completely
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch version.json: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('[AdminLayout] Fetched version.json:', data);
        
        if (data.version && data.buildTime) {
          const newVersionInfo = {
            version: data.version,
            buildTime: data.buildTime,
          };
          setVersionInfo(newVersionInfo);
          // Update window object for other components
          (window as any).__APP_VERSION__ = data.version;
          (window as any).__BUILD_TIME__ = data.buildTime;
          console.log('[AdminLayout] ✅ Version updated to:', data.version);
        } else {
          console.warn('[AdminLayout] ⚠️ version.json missing version or buildTime:', data);
        }
      } catch (error) {
        console.error('[AdminLayout] ❌ Failed to load version.json:', error);
        console.log('[AdminLayout] Using initial version from window:', (window as any).__APP_VERSION__);
        // Keep initial version from window object
      }
    };
    
    fetchVersion();
  }, []);

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
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes to check session validity
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

  // Handle session expiration - redirect to login if 401 error
  useEffect(() => {
    if (isError) {
      const err = error as ApiError;
      if (err.status === 401) {
        // Session expired - clear all data and redirect to login
        queryClient.clear();
        try {
          localStorage.removeItem('admin_user');
        } catch (err) {
          // ignore
        }
        setUserState(null);
        navigate('/login', { replace: true });
        message.warning('Sessiya tugadi. Iltimos, qayta kiring.');
      } else if (err.status !== 401) {
        message.error(err.message || 'Auth xatoligi');
      }
    }
  }, [isError, error, navigate, queryClient]);

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

  // Note: Footer is rendered at the bottom of the Layout
  // Version is also shown in the header for easy visibility

  if (isLoading || isLoggingOut) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Redirect to login if no user and not loading
  if (!userToDisplay && !isLoading) {
    navigate('/login', { replace: true });
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
      <Layout style={{ marginLeft: 220, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#F07E22', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                Admin panel
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 600,
                  color: '#F07E22', 
                  backgroundColor: '#fff3e0',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  border: '1px solid #ffcc80'
                }}>
                  v{versionInfo.version}
                </span>
              </h1>
            </div>
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Content style={{ 
            margin: '24px', 
            padding: '24px', 
            background: '#fff', 
            flex: 1, 
            overflow: 'auto',
            paddingBottom: '24px'
          }}>
            <Outlet />
          </Content>
          <Footer 
            id="admin-footer"
            style={{ 
              textAlign: 'center', 
              background: '#fafafa', 
              borderTop: '2px solid #e8e8e8',
              padding: '16px 24px',
              fontSize: '13px',
              color: '#595959',
              flexShrink: 0,
              width: '100%',
              boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 500, color: '#262626' }}>Admin Panel</span>
            <span style={{ color: '#d9d9d9', fontSize: '16px' }}>•</span>
            <span 
              style={{ fontWeight: 600, color: '#F07E22', fontSize: '14px' }}
              title={`Version: ${versionInfo.version}\nBuild time: ${versionInfo.buildTime}\nWindow version: ${(window as any).__APP_VERSION__ || 'N/A'}`}
            >
              v{versionInfo.version}
            </span>
            <span style={{ color: '#d9d9d9', fontSize: '16px' }}>•</span>
            <span 
              title={`Build time: ${versionInfo.buildTime}`} 
              style={{ 
                fontFamily: 'monospace', 
                fontSize: '12px',
                color: '#8c8c8c',
                backgroundColor: '#f5f5f5',
                padding: '2px 6px',
                borderRadius: '4px'
              }}
            >
              {new Date(versionInfo.buildTime).toLocaleDateString('uz-UZ', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </Footer>
        </div>
      </Layout>
    </Layout>
  );
}
