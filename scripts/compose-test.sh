#!/bin/sh
set -e

BASE_URL="http://localhost:5000"
PASS=0
FAIL=0

echo "=== Docker Compose Integration Test ==="

echo "1) Starting stack..."
docker compose up -d --build

echo "2) Waiting for app to be healthy..."
RETRIES=30
until curl -sf $BASE_URL/health > /dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -le 0 ]; then
    echo "FAIL: App did not become healthy in time"
    docker compose logs app
    docker compose down -v
    exit 1
  fi
  echo "   Waiting... ($RETRIES retries left)"
  sleep 3
done
echo "   App is healthy!"

echo ""
echo "3) Running API tests..."

# Test: Create note
echo -n "   POST /notes ... "
CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Integration Test","content":"Created by compose-test.sh"}')
CREATE_STATUS=$(echo "$CREATE_RESPONSE" | tail -1)
CREATE_BODY=$(echo "$CREATE_RESPONSE" | sed '$d')
if [ "$CREATE_STATUS" = "201" ]; then
  echo "PASS (201)"
  PASS=$((PASS + 1))
else
  echo "FAIL ($CREATE_STATUS)"
  FAIL=$((FAIL + 1))
fi

# Extract note ID
NOTE_ID=$(echo "$CREATE_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Test: Get all notes
echo -n "   GET /notes ... "
GET_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/notes)
if [ "$GET_STATUS" = "200" ]; then
  echo "PASS (200)"
  PASS=$((PASS + 1))
else
  echo "FAIL ($GET_STATUS)"
  FAIL=$((FAIL + 1))
fi

# Test: Get note by ID
echo -n "   GET /notes/$NOTE_ID ... "
GET_ONE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/notes/$NOTE_ID")
if [ "$GET_ONE_STATUS" = "200" ]; then
  echo "PASS (200)"
  PASS=$((PASS + 1))
else
  echo "FAIL ($GET_ONE_STATUS)"
  FAIL=$((FAIL + 1))
fi

# Test: Toggle favorite
echo -n "   PATCH /notes/$NOTE_ID/favorite ... "
FAV_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/notes/$NOTE_ID/favorite")
if [ "$FAV_STATUS" = "200" ]; then
  echo "PASS (200)"
  PASS=$((PASS + 1))
else
  echo "FAIL ($FAV_STATUS)"
  FAIL=$((FAIL + 1))
fi

# Test: Add tag
echo -n "   POST /notes/$NOTE_ID/tags ... "
TAG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/notes/$NOTE_ID/tags" \
  -H "Content-Type: application/json" \
  -d '{"name":"test-tag"}')
if [ "$TAG_STATUS" = "200" ]; then
  echo "PASS (200)"
  PASS=$((PASS + 1))
else
  echo "FAIL ($TAG_STATUS)"
  FAIL=$((FAIL + 1))
fi

# Test: Filter by tag
echo -n "   GET /notes?tag=test-tag ... "
FILTER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/notes?tag=test-tag")
if [ "$FILTER_STATUS" = "200" ]; then
  echo "PASS (200)"
  PASS=$((PASS + 1))
else
  echo "FAIL ($FILTER_STATUS)"
  FAIL=$((FAIL + 1))
fi

# Test: Search
echo -n "   GET /notes?search=Integration ... "
SEARCH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/notes?search=Integration")
if [ "$SEARCH_STATUS" = "200" ]; then
  echo "PASS (200)"
  PASS=$((PASS + 1))
else
  echo "FAIL ($SEARCH_STATUS)"
  FAIL=$((FAIL + 1))
fi

# Test: Delete note
echo -n "   DELETE /notes/$NOTE_ID ... "
DEL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/notes/$NOTE_ID")
if [ "$DEL_STATUS" = "204" ]; then
  echo "PASS (204)"
  PASS=$((PASS + 1))
else
  echo "FAIL ($DEL_STATUS)"
  FAIL=$((FAIL + 1))
fi

echo ""
echo "4) Tearing down..."
docker compose down -v

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="

if [ $FAIL -gt 0 ]; then
  exit 1
fi
