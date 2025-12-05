#!/bin/bash
# =============================================================================
# Push Docker Images to Registry
# =============================================================================

set -e

# Configuration
PROJECT_NAME="${PROJECT_NAME:-budgetcar}"
VERSION="${VERSION:-$(git describe --tags --always --dirty 2>/dev/null || echo 'dev')}"
REGISTRY="${REGISTRY:-}"  # e.g., "ghcr.io/couragous77" or "docker.io/username"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Pushing Docker Images to Registry${NC}"
echo -e "${BLUE}============================================${NC}"

# Check if registry is set
if [ -z "$REGISTRY" ]; then
    echo -e "${RED}Error: REGISTRY environment variable not set${NC}"
    echo ""
    echo "Usage:"
    echo "  REGISTRY=ghcr.io/username ./scripts/push-images.sh"
    echo "  REGISTRY=docker.io/username ./scripts/push-images.sh"
    echo ""
    echo "For GitHub Container Registry:"
    echo "  1. Create a Personal Access Token with 'write:packages' scope"
    echo "  2. Run: echo \$GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin"
    echo "  3. Then run this script with REGISTRY=ghcr.io/username"
    exit 1
fi

echo -e "Project: ${PROJECT_NAME}"
echo -e "Version: ${VERSION}"
echo -e "Registry: ${REGISTRY}"
echo ""

# Tag and push backend
echo -e "${YELLOW}Tagging and pushing backend image...${NC}"

# Tag for registry
docker tag "${PROJECT_NAME}-backend:${VERSION}" "${REGISTRY}/${PROJECT_NAME}-backend:${VERSION}"
docker tag "${PROJECT_NAME}-backend:latest" "${REGISTRY}/${PROJECT_NAME}-backend:latest"

# Push
docker push "${REGISTRY}/${PROJECT_NAME}-backend:${VERSION}"
docker push "${REGISTRY}/${PROJECT_NAME}-backend:latest"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend image pushed successfully${NC}"
else
    echo -e "${RED}✗ Backend image push failed${NC}"
    exit 1
fi

# Tag and push frontend
echo -e "${YELLOW}Tagging and pushing frontend image...${NC}"

# Tag for registry
docker tag "${PROJECT_NAME}-frontend:${VERSION}" "${REGISTRY}/${PROJECT_NAME}-frontend:${VERSION}"
docker tag "${PROJECT_NAME}-frontend:latest" "${REGISTRY}/${PROJECT_NAME}-frontend:latest"

# Push
docker push "${REGISTRY}/${PROJECT_NAME}-frontend:${VERSION}"
docker push "${REGISTRY}/${PROJECT_NAME}-frontend:latest"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend image pushed successfully${NC}"
else
    echo -e "${RED}✗ Frontend image push failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Push Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Images pushed:"
echo "  - ${REGISTRY}/${PROJECT_NAME}-backend:${VERSION}"
echo "  - ${REGISTRY}/${PROJECT_NAME}-backend:latest"
echo "  - ${REGISTRY}/${PROJECT_NAME}-frontend:${VERSION}"
echo "  - ${REGISTRY}/${PROJECT_NAME}-frontend:latest"
echo ""
echo "To pull these images on another machine:"
echo "  docker pull ${REGISTRY}/${PROJECT_NAME}-backend:${VERSION}"
echo "  docker pull ${REGISTRY}/${PROJECT_NAME}-frontend:${VERSION}"
