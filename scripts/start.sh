#!/bin/sh
set -e

echo "📦 Starting container..."

echo "📝 Creating temporary .env for Prisma..."
echo "DATABASE_URL=$DATABASE_URL" > .env

echo "🗄️ Running Prisma migrations..."
npx prisma migrate deploy

echo "🚀 Starting server..."
node dist/server.js

