#!/bin/bash
# 构建所有运行时基础镜像

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# 镜像标签前缀
IMAGE_PREFIX="${IMAGE_PREFIX:-leave1hourinadvance/runtime}"
VERSION="${VERSION:-latest}"

echo "=== Building Runtime Base Images ==="
echo "Image prefix: $IMAGE_PREFIX"
echo "Version: $VERSION"
echo ""

# 构建 Python 镜像
echo "Building Python runtime image..."
cd "$SCRIPT_DIR/python/base-image"
docker build -t "${IMAGE_PREFIX}-python:${VERSION}" .
docker tag "${IMAGE_PREFIX}-python:${VERSION}" "${IMAGE_PREFIX}-python:latest"
echo "✅ Python image built: ${IMAGE_PREFIX}-python:${VERSION}"
echo ""

# 构建 Node.js 镜像
echo "Building Node.js runtime image..."
cd "$SCRIPT_DIR/node/base-image"
docker build -t "${IMAGE_PREFIX}-node:${VERSION}" .
docker tag "${IMAGE_PREFIX}-node:${VERSION}" "${IMAGE_PREFIX}-node:latest"
echo "✅ Node.js image built: ${IMAGE_PREFIX}-node:${VERSION}"
echo ""

# 构建 Java 镜像
echo "Building Java runtime image..."
cd "$SCRIPT_DIR/java/base-image"
docker build -t "${IMAGE_PREFIX}-java:${VERSION}" .
docker tag "${IMAGE_PREFIX}-java:${VERSION}" "${IMAGE_PREFIX}-java:latest"
echo "✅ Java image built: ${IMAGE_PREFIX}-java:${VERSION}"
echo ""

# 显示镜像信息
echo "=== Image Summary ==="
docker images | grep "${IMAGE_PREFIX}" || true
echo ""

# 显示镜像大小
echo "=== Image Sizes ==="
for lang in python node java; do
    size=$(docker images "${IMAGE_PREFIX}-${lang}:${VERSION}" --format "{{.Size}}" | head -1)
    echo "${lang}: ${size}"
done

