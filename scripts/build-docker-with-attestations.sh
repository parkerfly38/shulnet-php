#!/bin/bash

###############################################################################
# Build Docker Image with Supply Chain Attestations
# 
# This script builds your Docker image locally with provenance and SBOM
# attestations using Docker Buildx.
#
# Requirements:
#   - Docker Desktop 4.25+ or Docker Engine 24.0+ with Buildx
#   - Buildx configured (usually automatic)
#
# Usage:
#   ./scripts/build-docker-with-attestations.sh [tag] [options]
#
# Options:
#   --image NAME        Image name (default: parkerfly38/shulnet-php)
#   --push              Push to registry after building
#   --multi-platform    Build for both amd64 and arm64
#
# Examples:
#   ./scripts/build-docker-with-attestations.sh latest
#   ./scripts/build-docker-with-attestations.sh v1.2.3 --push
#   ./scripts/build-docker-with-attestations.sh latest --multi-platform
#   ./scripts/build-docker-with-attestations.sh latest --multi-platform --push
#   ./scripts/build-docker-with-attestations.sh v1.0.0 --image myuser/myapp --push
#
# NOTES:
#   - Single platform builds use --load (image available in local Docker)
#   - Multi-platform builds without --push stay in buildx cache only
#   - Multi-platform builds with --push are sent to the registry
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="parkerfly38/shulnet-php"
TAG="${1:-local}"
PUSH=false
MULTI_PLATFORM=false

# Parse arguments
shift || true  # Remove first argument (tag)
while [[ $# -gt 0 ]]; do
  case $1 in
    --image)
      if [[ -z "$2" || "$2" == --* ]]; then
        echo -e "${RED}Error: --image requires a value${NC}"
        exit 1
      fi
      IMAGE_NAME="$2"
      shift 2
      ;;
    --push)
      PUSH=true
      shift
      ;;
    --multi-platform)
      MULTI_PLATFORM=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Set platform based on mode
if [ "$MULTI_PLATFORM" = true ]; then
  PLATFORMS="linux/amd64,linux/arm64"
else
  PLATFORMS="linux/amd64"
fi

FULL_IMAGE="${IMAGE_NAME}:${TAG}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Building Docker Image with Supply Chain Attestations  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if buildx is available
if ! docker buildx version &> /dev/null; then
    echo -e "${RED}Error: Docker Buildx is not available.${NC}"
    echo "Please install Docker Desktop 4.25+ or Docker Engine 24.0+"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker Buildx is available"

# Create a builder instance if it doesn't exist
BUILDER_NAME="shulnet-builder"
if ! docker buildx inspect ${BUILDER_NAME} &> /dev/null; then
    echo -e "${YELLOW}Creating new buildx builder: ${BUILDER_NAME}${NC}"
    docker buildx create --name ${BUILDER_NAME} --driver docker-container --bootstrap
fi

# Use the builder
docker buildx use ${BUILDER_NAME}

echo -e "${GREEN}✓${NC} Using builder: ${BUILDER_NAME}"
echo ""

# Build information
echo -e "${BLUE}Build Information:${NC}"
echo -e "  Image:     ${FULL_IMAGE}"
echo -e "  Target:    app"
echo -e "  Platform:  ${PLATFORMS}"
echo -e "  Mode:      $([ "$PUSH" = true ] && echo "Push to registry" || echo "Load locally")"
echo -e "  Context:   $(pwd)"
echo ""

# Build the image with attestations
echo -e "${YELLOW}Building image with attestations...${NC}"

# Inform user where the image will end up
if [ "$PUSH" = true ]; then
    echo -e "${BLUE}→ Image will be pushed to registry${NC}"
elif [ "$MULTI_PLATFORM" = true ]; then
    echo -e "${YELLOW}→ Multi-platform build will be cached in buildx (not loaded to local Docker)${NC}"
    echo -e "${YELLOW}  To push to registry, add --push flag${NC}"
else
    echo -e "${BLUE}→ Image will be loaded to local Docker${NC}"
fi
echo ""

# Build command with conditional push/load
BUILD_CMD="docker buildx build \
    --builder ${BUILDER_NAME} \
    --target app \
    --tag ${FULL_IMAGE} \
    --platform ${PLATFORMS} \
    --provenance=true \
    --sbom=true \
    --metadata-file /tmp/build-metadata.json"

# Add push or load flag based on mode
if [ "$PUSH" = true ]; then
    BUILD_CMD="$BUILD_CMD --push"
elif [ "$MULTI_PLATFORM" = false ]; then
    # Only use --load for single platform builds
    BUILD_CMD="$BUILD_CMD --load"
fi
# Multi-platform without push: neither --load nor --push (stays in buildx cache)

BUILD_CMD="$BUILD_CMD ."

# Execute build
eval $BUILD_CMD

echo ""
echo -e "${GREEN}✓${NC} Build completed successfully!"
echo ""

# Extract digest from metadata
if [ -f /tmp/build-metadata.json ]; then
    DIGEST=$(cat /tmp/build-metadata.json | grep -o '"containerimage.digest":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$DIGEST" ]; then
        echo -e "${BLUE}Image Digest:${NC} ${DIGEST}"
    fi
fi

# Display attestation information
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Attestations Generated                                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓${NC} ${YELLOW}Provenance Attestation${NC}"
echo "  Contains information about how the image was built:"
echo "  - Build timestamp"
echo "  - Builder information"
echo "  - Source code location"
echo "  - Build parameters"
echo ""
echo -e "${GREEN}✓${NC} ${YELLOW}SBOM (Software Bill of Materials)${NC}"
echo "  Contains a complete list of software components:"
echo "  - Operating system packages"
echo "  - Application dependencies"
echo "  - PHP extensions"
echo "  - Composer packages"
echo ""

# Instructions for viewing attestations
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  How to View Attestations                               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "To view the provenance attestation:"
echo -e "  ${YELLOW}docker buildx imagetools inspect ${FULL_IMAGE} --format '{{ json .Provenance }}'${NC}"
echo ""
echo "To view the SBOM:"
echo -e "  ${YELLOW}docker buildx imagetools inspect ${FULL_IMAGE} --format '{{ json .SBOM }}'${NC}"
echo ""
echo "To save SBOM to a file:"
echo -e "  ${YELLOW}docker buildx imagetools inspect ${FULL_IMAGE} --format '{{ json .SBOM }}' > sbom.json${NC}"
echo ""

# Instructions for pushing or next steps
if [ "$PUSH" = false ] && [ "$MULTI_PLATFORM" = false ]; then
    # Single platform, not pushed
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Next Steps                                            ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "To build for multiple platforms:"
    echo -e "  ${YELLOW}./scripts/build-docker-with-attestations.sh ${TAG} --multi-platform${NC}"
    echo ""
    echo "To push to registry:"
    echo -e "  ${YELLOW}./scripts/build-docker-with-attestations.sh ${TAG} --push${NC}"
    echo ""
elif [ "$PUSH" = false ] && [ "$MULTI_PLATFORM" = true ]; then
    # Multi-platform, not pushed (in buildx cache only)
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Image Built (Buildx Cache Only)                      ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Image is stored in buildx cache, not in local Docker${NC}"
    echo ""
    echo "To push to registry:"
    echo -e "  ${YELLOW}./scripts/build-docker-with-attestations.sh ${TAG} --multi-platform --push${NC}"
    echo ""
    echo "To build and load a single platform to local Docker:"
    echo -e "  ${YELLOW}./scripts/build-docker-with-attestations.sh ${TAG}${NC}"
    echo ""
else
    # Pushed to registry
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Image Pushed to Registry                              ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}✓${NC} Image successfully pushed to registry"
    if [ "$MULTI_PLATFORM" = true ]; then
        echo -e "${GREEN}✓${NC} Built for multiple platforms: amd64, arm64"
    fi
    echo ""
fi

# Verify image was created
if [ "$PUSH" = false ] && [ "$MULTI_PLATFORM" = false ]; then
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Local Image Information                                ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    docker images ${IMAGE_NAME} --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    
    echo ""
    echo -e "${GREEN}✓${NC} ${GREEN}Build complete! Image loaded: ${FULL_IMAGE}${NC}"
    echo ""
elif [ "$PUSH" = false ] && [ "$MULTI_PLATFORM" = true ]; then
    echo -e "${GREEN}✓${NC} ${GREEN}Multi-platform build complete! Image cached in buildx${NC}"
    echo ""
else
    echo -e "${GREEN}✓${NC} ${GREEN}Build and push complete! Image available: ${FULL_IMAGE}${NC}"
    echo ""
fi

# Cleanup
rm -f /tmp/build-metadata.json
