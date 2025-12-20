module.exports = {
  apps: [
    {
      name: 'maya-next',
      script: './scripts/start-dev-pm2.sh',
      interpreter: '/bin/bash',
      cwd: '/workspaces/mayaallan-site',
      max_memory_restart: '700M',
      autorestart: true,
      restart_delay: 2000,
      watch: false,
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};
