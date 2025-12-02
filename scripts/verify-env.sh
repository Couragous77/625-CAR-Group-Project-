#!/bin/bash
# =============================================================================
# Environment Variables & Secrets Verification
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT="${1:-dev}"
VERBOSE="${VERBOSE:-false}"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Environment Variables & Secrets Verification${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "Environment: ${CYAN}${ENVIRONMENT}${NC}"
echo ""

# Set env file based on environment
case $ENVIRONMENT in
    dev|development)
        ENV_FILE=".env"
        ;;
    stage|staging)
        ENV_FILE=".env.stage"
        ;;
    prod|production)
        ENV_FILE=".env.prod"
        ;;
    *)
        echo -e "${RED}Unknown environment: ${ENVIRONMENT}${NC}"
        echo "Usage: $0 [dev|stage|prod]"
        exit 1
        ;;
esac

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# ============================================================================
# Check env var values
# ============================================================================
echo -e "${YELLOW} Checking environment variables...${NC}"
echo ""

# Track results
ERRORS=0
WARNINGS=0

# Required variables for all environments
REQUIRED_VARS=(
    "DATABASE_URL"
    "SECRET_KEY"
    "DEBUG"
    "ALLOWED_ORIGINS"
)

# Production-specific required variables
PROD_REQUIRED_VARS=(
    "DATABASE_URL"
    "SECRET_KEY"
    "DEBUG"
    "ALLOWED_ORIGINS"
)

# Check if env file exists
if [ -f "$ENV_FILE" ]; then
    echo -e "  Loading from: ${GREEN}${ENV_FILE}${NC}"
    # shellcheck disable=SC2046
    export $(grep -v '^#' "$ENV_FILE" | xargs 2>/dev/null) || true
else
    echo -e "  ${YELLOW}Warning: ${ENV_FILE} not found${NC}"
    if [ "$ENVIRONMENT" == "prod" ]; then
        echo -e "  ${YELLOW}Checking system environment variables...${NC}"
    else
        echo -e "  ${RED}Please create ${ENV_FILE} from ${ENV_FILE}.example${NC}"
        ((WARNINGS++))
    fi
fi

echo ""
echo -e "${BLUE}Required Variables:${NC}"

for var in "${REQUIRED_VARS[@]}"; do
    value="${!var}"
    if [ -z "$value" ]; then
        echo -e "  ${RED}✗ ${var}: NOT SET${NC}"
        ((ERRORS++))
    else
        # Mask sensitive values
        if [[ "$var" == *"SECRET"* ]] || [[ "$var" == *"PASSWORD"* ]] || [[ "$var" == *"KEY"* ]]; then
            echo -e "  ${GREEN}✓ ${var}: ****${NC}"
        else
            if [ "$VERBOSE" == "true" ]; then
                echo -e "  ${GREEN}✓ ${var}: ${value}${NC}"
            else
                # Show truncated value
                if [ ${#value} -gt 50 ]; then
                    echo -e "  ${GREEN}✓ ${var}: ${value:0:50}...${NC}"
                else
                    echo -e "  ${GREEN}✓ ${var}: ${value}${NC}"
                fi
            fi
        fi
    fi
done

# ============================================================================
# Check secrets exist in secrets store
# ============================================================================
echo ""
echo -e "${YELLOW} Checking secrets...${NC}"
echo ""

SECRETS=(
    "SECRET_KEY"
    "DATABASE_URL"
)

echo -e "${BLUE}Secrets (sensitive values):${NC}"

for secret in "${SECRETS[@]}"; do
    value="${!secret}"
    if [ -z "$value" ]; then
        echo -e "  ${RED}✗ ${secret}: NOT SET${NC}"
        ((ERRORS++))
    else
        # Check secret strength for production
        if [ "$ENVIRONMENT" == "prod" ] || [ "$ENVIRONMENT" == "production" ]; then
            if [ "$secret" == "SECRET_KEY" ]; then
                if [ ${#value} -lt 32 ]; then
                    echo -e "  ${YELLOW}⚠ ${secret}: Set but too short (<32 chars)${NC}"
                    ((WARNINGS++))
                elif [[ "$value" == *"changeme"* ]] || [[ "$value" == *"secret"* ]] || [[ "$value" == *"test"* ]]; then
                    echo -e "  ${YELLOW}⚠ ${secret}: Appears to be a placeholder value${NC}"
                    ((WARNINGS++))
                else
                    echo -e "  ${GREEN}✓ ${secret}: Set (${#value} chars)${NC}"
                fi
            else
                echo -e "  ${GREEN}✓ ${secret}: ****${NC}"
            fi
        else
            echo -e "  ${GREEN}✓ ${secret}: ****${NC}"
        fi
    fi
done

# ============================================================================
# Run config check command
# ============================================================================
echo ""
echo -e "${YELLOW} Running configuration checks...${NC}"
echo ""

echo -e "${BLUE}Database Configuration:${NC}"
if [ -n "$DATABASE_URL" ]; then
    # Parse DATABASE_URL
    if [[ "$DATABASE_URL" == postgres* ]]; then
        echo -e "  ${GREEN}✓ Database type: PostgreSQL${NC}"

        # Extract host from URL (basic parsing)
        DB_HOST=$(echo "$DATABASE_URL" | sed -E 's/.*@([^:/]+).*/\1/')
        echo -e "  ${GREEN}✓ Database host: ${DB_HOST}${NC}"

        # Check if it's a production-appropriate URL
        if [ "$ENVIRONMENT" == "prod" ] || [ "$ENVIRONMENT" == "production" ]; then
            if [[ "$DATABASE_URL" == *"localhost"* ]] || [[ "$DATABASE_URL" == *"127.0.0.1"* ]]; then
                echo -e "  ${YELLOW}⚠ Production using localhost database${NC}"
                ((WARNINGS++))
            fi
        fi
    else
        echo -e "  ${YELLOW}⚠ Non-PostgreSQL database URL detected${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "  ${RED}✗ DATABASE_URL not configured${NC}"
    ((ERRORS++))
fi

echo ""
echo -e "${BLUE}Debug Configuration:${NC}"
if [ -n "$DEBUG" ]; then
    if [ "$ENVIRONMENT" == "prod" ] || [ "$ENVIRONMENT" == "production" ]; then
        if [ "$DEBUG" == "true" ] || [ "$DEBUG" == "True" ] || [ "$DEBUG" == "1" ]; then
            echo -e "  ${RED}✗ DEBUG is enabled in production!${NC}"
            ((ERRORS++))
        else
            echo -e "  ${GREEN}✓ DEBUG is disabled (correct for production)${NC}"
        fi
    else
        echo -e "  ${GREEN}✓ DEBUG: ${DEBUG}${NC}"
    fi
else
    if [ "$ENVIRONMENT" == "prod" ] || [ "$ENVIRONMENT" == "production" ]; then
        echo -e "  ${GREEN}✓ DEBUG not set (defaults to false)${NC}"
    else
        echo -e "  ${YELLOW}⚠ DEBUG not set${NC}"
    fi
fi

echo ""
echo -e "${BLUE}CORS Configuration:${NC}"
if [ -n "$ALLOWED_ORIGINS" ]; then
    echo -e "  ${GREEN}✓ ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}${NC}"

    if [ "$ENVIRONMENT" == "prod" ] || [ "$ENVIRONMENT" == "production" ]; then
        if [[ "$ALLOWED_ORIGINS" == *"*"* ]]; then
            echo -e "  ${YELLOW}⚠ Wildcard origins in production${NC}"
            ((WARNINGS++))
        fi
        if [[ "$ALLOWED_ORIGINS" == *"localhost"* ]]; then
            echo -e "  ${YELLOW}⚠ localhost in production origins${NC}"
            ((WARNINGS++))
        fi
    fi
else
    echo -e "  ${YELLOW}⚠ ALLOWED_ORIGINS not set${NC}"
    ((WARNINGS++))
fi

# ============================================================================
# Summary
# ============================================================================
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Verification Summary${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo -e "  Environment: ${ENVIRONMENT}"
    echo -e "  Status: Ready for deployment"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Checks completed with warnings${NC}"
    echo -e "  Errors: 0"
    echo -e "  Warnings: ${WARNINGS}"
    echo ""
    echo "Review warnings above before deploying."
    exit 0
else
    echo -e "${RED}✗ Verification failed${NC}"
    echo -e "  Errors: ${ERRORS}"
    echo -e "  Warnings: ${WARNINGS}"
    echo ""
    echo "Fix the errors above before deploying."
    exit 1
fi
