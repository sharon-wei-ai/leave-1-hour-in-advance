#!/bin/bash
# 运行时容器预热脚本
# 功能：按语言预热 2-3 个容器，执行健康检查

set -e

IMAGE_PREFIX="${IMAGE_PREFIX:-leave1hourinadvance/runtime}"
VERSION="${VERSION:-latest}"
PREWARM_COUNT="${PREWARM_COUNT:-2}"

echo "=== Runtime Container Prewarming ==="
echo "Image prefix: $IMAGE_PREFIX"
echo "Version: $VERSION"
echo "Prewarm count per language: $PREWARM_COUNT"
echo ""

# 预热函数
prewarm_language() {
    local lang=$1
    local image="${IMAGE_PREFIX}-${lang}:${VERSION}"
    
    echo "Prewarming ${lang} runtime containers..."
    
    # 检查镜像是否存在
    if ! docker image inspect "$image" >/dev/null 2>&1; then
        echo "⚠️  Image $image not found, skipping..."
        return 1
    fi
    
    # 启动容器
    for i in $(seq 1 $PREWARM_COUNT); do
        container_name="runtime-${lang}-prewarm-${i}"
        
        # 如果容器已存在，先删除
        if docker ps -a --format '{{.Names}}' | grep -q "^${container_name}$"; then
            docker rm -f "$container_name" >/dev/null 2>&1 || true
        fi
        
        # 启动容器
        echo "  Starting container ${container_name}..."
        docker run -d \
            --name "$container_name" \
            --network compose_default \
            --memory="512m" \
            --cpus="1" \
            --read-only \
            --tmpfs /tmp:rw,noexec,nosuid,size=100m \
            "$image" >/dev/null 2>&1
        
        # 等待容器启动
        sleep 2
        
        # 健康检查
        if docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null | grep -q "healthy"; then
            echo "  ✅ ${container_name} is healthy"
        else
            echo "  ⚠️  ${container_name} health check pending"
        fi
    done
    
    echo "✅ ${lang} runtime prewarmed"
    echo ""
}

# 预热各语言运行时
for lang in python node java; do
    prewarm_language "$lang" || true
done

echo "=== Prewarming Complete ==="
echo ""
echo "Active prewarm containers:"
docker ps --filter "name=runtime-.*-prewarm" --format "table {{.Names}}\t{{.Status}}\t{{.Image}}" || true
