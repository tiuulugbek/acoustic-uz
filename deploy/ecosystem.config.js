module.exports = {
  apps: [
    {
      name: 'acoustic-backend',
      script: 'dist/apps/backend/src/main.js',
      cwd: '/var/www/news.acoustic.uz',
      instances: 2,
      exec_mode: 'cluster',
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
      script: 'apps/frontend/server.js',
      cwd: '/var/www/news.acoustic.uz',
      instances: 2,
      exec_mode: 'cluster',
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

