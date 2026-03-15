#!/bin/sh
set -eu

# Dev mode: use read-only host mount for source, but put Vite config in tmpfs
# so it can write its timestamp files.
if [ "${DEV_MODE:-}" = "1" ]; then
  if [ ! -d /tmp/work ]; then
    mkdir -p /tmp/work
    cp -R /work/. /tmp/work/
    rm -rf /tmp/work/node_modules
    ln -s /opt/app/node_modules /tmp/work/node_modules
    cp /work/vite.config.js /tmp/work/vite.config.js
  fi
  exec node /opt/app/node_modules/vite/bin/vite.js \
    /tmp/work \
    --config /tmp/work/vite.config.js \
    --host 0.0.0.0 \
    --port 3000 \
    --strictPort
fi

# Secure mode: copy the built app into tmpfs and run from there.
if [ ! -d /tmp/app ]; then
  mkdir -p /tmp/app
  cp -R /opt/app/. /tmp/app/
fi

cd /tmp/app
exec npm run dev
