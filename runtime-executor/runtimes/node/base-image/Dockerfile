# Node.js runtime base (MVP，占位镜像)
FROM node:18-alpine
RUN adduser -D app && \
    apk add --no-cache ca-certificates tzdata && \
    mkdir -p /app && chown app:app /app
USER app
WORKDIR /app
# 预装常用库可在后续按需添加（保持轻量）

