module.exports = {
  apps: [
    {
      name: 'nettoria-app',
      script: 'server/src/app.js', // Corrected: use app.js instead of server.js
      cwd: '/var/www/nettoria',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000 // Corrected: use port 5000 as defined in app.js
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/var/log/nettoria/err.log',
      out_file: '/var/log/nettoria/out.log',
      log_file: '/var/log/nettoria/combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
      ignore_watch: ['node_modules', 'logs', '*.log'],
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
}; 