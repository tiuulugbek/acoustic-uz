module.exports = {
  apps: [
    {
      name: 'acoustic-backend',
      script: 'apps/backend/dist/main.js',
      cwd: '/var/www/acoustic.uz',
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
      script: 'apps/frontend/.next/standalone/apps/frontend/server.js',
      cwd: '/var/www/acoustic.uz',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
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

