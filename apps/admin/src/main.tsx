import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error: any) => {
        // Handle 401 errors globally for mutations
        if (error?.status === 401) {
          try {
            localStorage.removeItem('admin_user');
          } catch (err) {
            // ignore
          }
          if (window.location.pathname !== '/login') {
            queryClient.clear();
            window.location.href = '/login';
          }
        }
      },
    },
  },
});

// Make queryClient available globally for API request handler
(window as any).__queryClient = queryClient;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#F07E22',
            colorSuccess: '#52c41a',
            colorWarning: '#faad14',
            colorError: '#ff4d4f',
            borderRadius: 8,
          },
        }}
      >
        <App />
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

