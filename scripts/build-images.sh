#!/bin/bash
# =============================================================================
# Build Docker Production Images
# =============================================================================

set -e

# Configuration
PROJECT_NAME="${PROJECT_NAME:-budgetcar}"
VERSION="${VERSION:-$(git describe --tags --always --dirty 2>/dev/null || echo 'dev')}"
REGISTRY="${REGISTRY:-}"  # e.g., "ghcr.io/couragous77" or "docker.io/username"
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Building Production Docker Images${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "Project: ${PROJECT_NAME}"
echo -e "Version: ${VERSION}"
echo -e "Registry: ${REGISTRY:-<local only>}"
echo -e "Build Date: ${BUILD_DATE}"
echo ""

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Build backend image
echo -e "${YELLOW}Building backend image...${NC}"
docker build \
    --file backend/Dockerfile.prod \
    --tag "${PROJECT_NAME}-backend:${VERSION}" \
    --tag "${PROJECT_NAME}-backend:latest" \
    --label "org.opencontainers.image.created=${BUILD_DATE}" \
    --label "org.opencontainers.image.version=${VERSION}" \
    --label "org.opencontainers.image.title=Budget CAR Backend" \
    --label "org.opencontainers.image.description=FastAPI backend for Budget CAR" \
    ./backend

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend image built successfully${NC}"
else
    echo -e "${RED}✗ Backend image build failed${NC}"
    exit 1
fi

# Build frontend image
echo -e "${YELLOW}Building frontend image...${NC}"
docker build \
    --file frontend/Dockerfile.prod \
    --tag "${PROJECT_NAME}-frontend:${VERSION}" \
    --tag "${PROJECT_NAME}-frontend:latest" \
    --build-arg VITE_API_URL="${VITE_API_URL:-http://localhost:8000}" \
    --label "org.opencontainers.image.created=${BUILD_DATE}" \
    --label "org.opencontainers.image.version=${VERSION}" \
    --label "org.opencontainers.image.title=Budget CAR Frontend" \
    --label "org.opencontainers.image.description=React frontend for Budget CAR" \
    ./frontend

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend image built successfully${NC}"
else
    echo -e "${RED}✗ Frontend image build failed${NC}"
    exit 1
fi

# Display image sizes
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Image Sizes${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep "${PROJECT_NAME}"

# Show layer info for optimization verification
echo ""
echo -e "${BLUE}Backend image layers:${NC}"
docker history "${PROJECT_NAME}-backend:${VERSION}" --format "table {{.CreatedBy}}\t{{.Size}}" | head -10

echo ""
echo -e "${BLUE}Frontend image layers:${NC}"
docker history "${PROJECT_NAME}-frontend:${VERSION}" --format "table {{.CreatedBy}}\t{{.Size}}" | head -10

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Build Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Images created:"
echo "  - ${PROJECT_NAME}-backend:${VERSION}"
echo "  - ${PROJECT_NAME}-backend:latest"
echo "  - ${PROJECT_NAME}-frontend:${VERSION}"
echo "  - ${PROJECT_NAME}-frontend:latest"
echo ""
echo "Next steps:"
echo "  1. Run smoke test: ./scripts/smoke-test.sh"
echo "  2. Push to registry: ./scripts/push-images.sh"
