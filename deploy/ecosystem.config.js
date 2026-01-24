module.exports = {
  apps: [
    {
      name: 'acoustic-backend',
      script: 'apps/backend/dist/main.js',
      cwd: '/root/acoustic.uz',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/acoustic-backend-error.log',
      out_file: '/var/log/pm2/acoustic-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false
    },
    {
      name: 'acoustic-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/root/acoustic.uz/apps/frontend',
      instances: 1,
      exec_mode: 'fork',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        NEXT_PUBLIC_API_URL: 'https://a.acoustic.uz/api',
        NEXT_PUBLIC_SITE_URL: 'https://acoustic.uz'
      },
      error_file: '/var/log/pm2/acoustic-frontend-error.log',
      out_file: '/var/log/pm2/acoustic-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false
    }
  ]
};

