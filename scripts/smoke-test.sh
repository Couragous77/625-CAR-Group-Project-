#!/bin/bash
# =============================================================================
# Container Smoke Test
# Start the container, hit /health, confirm it returns 200
# =============================================================================

set -e

# Configuration
PROJECT_NAME="${PROJECT_NAME:-budgetcar}"
VERSION="${VERSION:-latest}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-80}"
TIMEOUT="${TIMEOUT:-30}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Cleaning up test containers...${NC}"
    docker rm -f smoke-test-backend smoke-test-frontend smoke-test-db 2>/dev/null || true
    docker network rm smoke-test-network 2>/dev/null || true
}

# Set trap for cleanup
trap cleanup EXIT

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Container Smoke Test${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "Project: ${PROJECT_NAME}"
echo -e "Version: ${VERSION}"
echo ""

# Check if images exist
echo -e "${YELLOW}Checking for images...${NC}"
if ! docker images "${PROJECT_NAME}-backend:${VERSION}" --format "{{.Repository}}" | grep -q "${PROJECT_NAME}"; then
    echo -e "${RED}Backend image not found: ${PROJECT_NAME}-backend:${VERSION}${NC}"
    echo "Run ./scripts/build-images.sh first"
    exit 1
fi

if ! docker images "${PROJECT_NAME}-frontend:${VERSION}" --format "{{.Repository}}" | grep -q "${PROJECT_NAME}"; then
    echo -e "${RED}Frontend image not found: ${PROJECT_NAME}-frontend:${VERSION}${NC}"
    echo "Run ./scripts/build-images.sh first"
    exit 1
fi

echo -e "${GREEN}✓ Images found${NC}"
echo ""

# Create network
echo -e "${YELLOW}Creating test network...${NC}"
docker network create smoke-test-network 2>/dev/null || true

# Start PostgreSQL for backend tests
echo -e "${YELLOW}Starting test database...${NC}"
docker run -d \
    --name smoke-test-db \
    --network smoke-test-network \
    -e POSTGRES_USER=budgetcar \
    -e POSTGRES_PASSWORD=testpassword \
    -e POSTGRES_DB=budgetcar_test \
    postgres:16-alpine

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
for i in $(seq 1 $TIMEOUT); do
    if docker exec smoke-test-db pg_isready -U budgetcar -d budgetcar_test > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database ready${NC}"
        break
    fi
    if [ $i -eq $TIMEOUT ]; then
        echo -e "${RED}✗ Database failed to start within ${TIMEOUT} seconds${NC}"
        exit 1
    fi
    sleep 1
done

# Start backend
echo -e "${YELLOW}Starting backend container...${NC}"
docker run -d \
    --name smoke-test-backend \
    --network smoke-test-network \
    -p ${BACKEND_PORT}:8000 \
    -e DATABASE_URL="postgresql://budgetcar:testpassword@smoke-test-db:5432/budgetcar_test" \
    -e SECRET_KEY="smoke-test-secret-key-for-testing-only" \
    -e DEBUG=false \
    -e ALLOWED_ORIGINS="http://localhost,http://localhost:${FRONTEND_PORT}" \
    "${PROJECT_NAME}-backend:${VERSION}"

# Wait for backend to be healthy
echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
BACKEND_URL="http://localhost:${BACKEND_PORT}"
for i in $(seq 1 $TIMEOUT); do
    if curl -s "${BACKEND_URL}/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend responding${NC}"
        break
    fi
    if [ $i -eq $TIMEOUT ]; then
        echo -e "${RED}✗ Backend failed to respond within ${TIMEOUT} seconds${NC}"
        echo "Backend logs:"
        docker logs smoke-test-backend
        exit 1
    fi
    sleep 1
done

# Test backend health endpoints
echo ""
echo -e "${BLUE}Testing backend health endpoints...${NC}"

# Test /health
echo -n "  /health: "
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" "${BACKEND_URL}/health")
HTTP_CODE="${HEALTH_RESPONSE: -3}"
BODY="${HEALTH_RESPONSE:0:-3}"
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ OK (${HTTP_CODE})${NC}"
else
    echo -e "${RED}✗ FAILED (${HTTP_CODE})${NC}"
    echo "Response: $BODY"
    exit 1
fi

# Test /health/live
echo -n "  /health/live: "
LIVE_RESPONSE=$(curl -s -w "%{http_code}" "${BACKEND_URL}/health/live")
HTTP_CODE="${LIVE_RESPONSE: -3}"
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ OK (${HTTP_CODE})${NC}"
else
    echo -e "${RED}✗ FAILED (${HTTP_CODE})${NC}"
    exit 1
fi

# Test /health/ready
echo -n "  /health/ready: "
READY_RESPONSE=$(curl -s -w "%{http_code}" "${BACKEND_URL}/health/ready")
HTTP_CODE="${READY_RESPONSE: -3}"
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ OK (${HTTP_CODE})${NC}"
else
    echo -e "${RED}✗ FAILED (${HTTP_CODE})${NC}"
    exit 1
fi

# Test API endpoint
echo -n "  /api/transactions: "
API_RESPONSE=$(curl -s -w "%{http_code}" "${BACKEND_URL}/api/transactions?start_date=2024-01-01&end_date=2024-12-31")
HTTP_CODE="${API_RESPONSE: -3}"
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ OK (${HTTP_CODE})${NC}"
else
    echo -e "${YELLOW}⚠ Response: ${HTTP_CODE} (may need auth or migrations)${NC}"
fi

# Start frontend
echo ""
echo -e "${YELLOW}Starting frontend container...${NC}"
docker run -d \
    --name smoke-test-frontend \
    --network smoke-test-network \
    -p ${FRONTEND_PORT}:80 \
    "${PROJECT_NAME}-frontend:${VERSION}"

# Wait for frontend to be ready
echo -e "${YELLOW}Waiting for frontend to be ready...${NC}"
FRONTEND_URL="http://localhost:${FRONTEND_PORT}"
for i in $(seq 1 $TIMEOUT); do
    if curl -s "${FRONTEND_URL}" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Frontend responding${NC}"
        break
    fi
    if [ $i -eq $TIMEOUT ]; then
        echo -e "${RED}✗ Frontend failed to respond within ${TIMEOUT} seconds${NC}"
        echo "Frontend logs:"
        docker logs smoke-test-frontend
        exit 1
    fi
    sleep 1
done

# Test frontend
echo ""
echo -e "${BLUE}Testing frontend...${NC}"

echo -n "  / (index.html): "
FRONTEND_RESPONSE=$(curl -s -w "%{http_code}" "${FRONTEND_URL}/")
HTTP_CODE="${FRONTEND_RESPONSE: -3}"
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ OK (${HTTP_CODE})${NC}"
else
    echo -e "${RED}✗ FAILED (${HTTP_CODE})${NC}"
    exit 1
fi

echo -n "  SPA routing (/dashboard): "
SPA_RESPONSE=$(curl -s -w "%{http_code}" "${FRONTEND_URL}/dashboard")
HTTP_CODE="${SPA_RESPONSE: -3}"
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ OK (${HTTP_CODE})${NC}"
else
    echo -e "${RED}✗ FAILED (${HTTP_CODE})${NC}"
    exit 1
fi

# Print container resource usage
echo ""
echo -e "${BLUE}Container Resource Usage:${NC}"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep smoke-test

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}All Smoke Tests Passed!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Summary:"
echo "  ✓ Backend health endpoints responding"
echo "  ✓ Frontend serving static files"
echo "  ✓ SPA routing working"
echo ""
echo "The production images are ready for deployment."
