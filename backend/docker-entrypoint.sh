#!/bin/sh
set -e

# Ensure volume subdirectories exist
mkdir -p /app/storage/data
mkdir -p /app/storage/logs
mkdir -p /app/storage/config

# Run Sequelize migrations
DB_PATH=/app/storage/data/bookmarks.db \
  node_modules/.bin/sequelize-cli db:migrate \
  --config src/config/database.js \
  --migrations-path src/migrations \
  --env production

# Start the app
exec node dist/main.js
