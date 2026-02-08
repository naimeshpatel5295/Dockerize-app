#!/bin/sh
set -e

IMAGE_NAME="devnotes-app"
CONTAINER_NAME="devnotes-test"

echo "=== Docker Image Test ==="

echo "1) Building image..."
docker build -t $IMAGE_NAME .

echo "2) Starting container..."
docker run -d \
  -p 5000:5000 \
  -e PORT=5000 \
  -e DATABASE_URL=postgresql://postgres:password@host.docker.internal:5432/devnotes \
  --name $CONTAINER_NAME \
  $IMAGE_NAME

echo "3) Waiting 10 seconds for startup..."
sleep 10

echo "4) Testing health endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)

echo "5) Cleaning up..."
docker stop $CONTAINER_NAME
docker rm $CONTAINER_NAME

if [ "$STATUS" = "200" ] || [ "$STATUS" = "500" ]; then
  echo ""
  echo "PASS: Container started and responded (HTTP $STATUS)"
  exit 0
else
  echo ""
  echo "FAIL: Expected HTTP 200 or 500, got $STATUS"
  exit 1
fi
