# Java runtime base (MVP，占位镜像)
FROM eclipse-temurin:17-jre-alpine
RUN adduser -D app && \
    apk add --no-cache ca-certificates tzdata curl jq && \
    mkdir -p /app && chown app:app /app
USER app
WORKDIR /app
# 保持轻量，按需再添加依赖

