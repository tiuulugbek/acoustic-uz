import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login, ApiError } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<{ user: unknown }, ApiError, { email: string; password: string }>({
    mutationFn: login,
    onSuccess: async () => {
      message.success('Kirish muvaffaqiyatli');
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      navigate('/', { replace: true });
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

