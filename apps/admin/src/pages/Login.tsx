import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { login, getCurrentUser, ApiError } from '../lib/api';
import { useEffect } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Check if user is already logged in
  const { data: currentUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 0,
  });

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const { mutateAsync, isPending } = useMutation<{ user: unknown }, ApiError, { email: string; password: string }>({
    mutationFn: login,
    onSuccess: async (data) => {
      message.success('Kirish muvaffaqiyatli');
      
      // Set user data in cache AND localStorage immediately if available
      if (data && typeof data === 'object' && 'user' in data && data.user) {
        queryClient.setQueryData(['auth', 'me'], data.user);
        // Also save to localStorage
        try {
          localStorage.setItem('admin_user', JSON.stringify(data.user));
          console.log('[Login] ✅ User saved to localStorage');
        } catch (err) {
          console.error('[Login] ❌ Failed to save to localStorage:', err);
        }
      }
      
      // Wait a bit for cookie to be set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to dashboard IMMEDIATELY
      navigate('/', { replace: true });
      
      // Refetch user data in background after navigation (optional)
      setTimeout(async () => {
        try {
          await queryClient.refetchQueries({ queryKey: ['auth', 'me'] });
        } catch (err) {
          // If refetch fails, keep the cached user from login response
          if (data && typeof data === 'object' && 'user' in data && data.user) {
            queryClient.setQueryData(['auth', 'me'], data.user);
            try {
              localStorage.setItem('admin_user', JSON.stringify(data.user));
            } catch (e) {
              // ignore
            }
          }
        }
      }, 500);
    },
    onError: (error: unknown) => {
      const err = error as ApiError;
      if (err.status === 401) {
        message.error('Email yoki parol noto‘g‘ri');
      } else {
        message.error(err.message || 'Kirishda xatolik');
      }
    },
  });

  const onFinish = async (values: { email: string; password: string }) => {
    await mutateAsync(values);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
      }}
    >
      <Card title="Admin Panel - Kirish" style={{ width: 400 }}>
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Email kiriting!' }]}
          >
            <Input type="email" placeholder="admin@acoustic.uz" />
          </Form.Item>

          <Form.Item
            label="Parol"
            name="password"
            rules={[{ required: true, message: 'Parol kiriting!' }]}
          >
            <Input.Password placeholder="Parol" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isPending}>
              Kirish
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

