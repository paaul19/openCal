#!/bin/sh
set -e

echo "Applying database migrations..."
npx prisma migrate deploy

echo "Seeding food reference data..."
npx tsx prisma/seed.ts || true

echo "Starting openCal..."
exec npm run start
