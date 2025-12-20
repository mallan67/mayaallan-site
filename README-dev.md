## Local dev (persistent)

Start local dev server (managed by PM2 so it survives terminal disconnects):

```bash
# start
pm2 start ./ecosystem.config.js
pm2 save

# check status, logs
pm2 status
pm2 show maya-next
pm2 logs maya-next --lines 200

# stop / restart
pm2 restart maya-next
pm2 stop maya-next
pm2 delete maya-next


