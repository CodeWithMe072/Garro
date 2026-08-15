module.exports = {
  apps: [
    {
      name: 'garro-backend',
      script: 'server.js',
      instances: 'max', // Scale across all available CPU cores on VPS
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G', // Automatically restart if memory leaks exceed 1GB
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      autorestart: true,
      restart_delay: 4000
    }
  ]
};
