
#!/bin/bash

echo "=== Docker Compose Test ==="

echo "1) Building images..."
docker-compose build

echo "2) Starting services (app + database)..."
docker-compose down -v >/dev/null 2>&1 || true
docker-compose up -d

echo "3) Waiting for services to be healthy..."
echo "   - Waiting for database..."
timeout=30
elapsed=0
while [ $elapsed -lt $timeout ]; do
  if docker-compose exec -T db pg_isready -U postgres -d devnotes >/dev/null 2>&1; then
    echo "   ✓ Database is ready"
    break
  fi
  sleep 2
  elapsed=$((elapsed + 2))
done

echo "   - Waiting for application (15 seconds)..."
sleep 15

echo "4) Testing health endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:5000/health || echo "000")

if [ "$RESPONSE" = "200" ]; then
  echo "✓ PASS: Application is healthy (HTTP $RESPONSE)"
  echo ""
  echo "5) Application logs:"
  docker-compose logs app | tail -20
  echo ""
  echo "6) Cleaning up..."
  docker-compose down -v >/dev/null 2>&1
  exit 0
elif [ "$RESPONSE" = "500" ]; then
  echo "⚠ PARTIAL: Application responded but database may be disconnected (HTTP $RESPONSE)"
  echo ""
  echo "5) Application logs:"
  docker-compose logs app
  echo ""
  echo "6) Cleaning up..."
  docker-compose down -v >/dev/null 2>&1
  exit 1
else
  echo "✗ FAIL: Application did not respond (HTTP $RESPONSE)"
  echo ""
  echo "5) Application logs:"
  docker-compose logs app
  echo ""
  echo "6) Database logs:"
  docker-compose logs db | tail -10
  echo ""
  echo "7) Cleaning up..."
  docker-compose down -v >/dev/null 2>&1
  exit 1
fi
