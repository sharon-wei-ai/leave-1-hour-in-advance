# Node.js runtime base image
FROM node:18-alpine

# 创建非 root 用户
RUN adduser -D -s /bin/sh app && \
    apk add --no-cache ca-certificates tzdata curl && \
    mkdir -p /app /tmp/runtime && \
    chown -R app:app /app /tmp/runtime

# 切换到非 root 用户
USER app
WORKDIR /app

# 设置时区
ENV TZ=Asia/Shanghai

# 预装常用库（保持轻量，按需扩展）
# 注意：这里只预装最基础的库，其他依赖在功能代码中通过 package.json 安装
RUN npm config set cache /tmp/.npm && \
    npm install --global --no-audit --no-fund \
    axios@1.6.0 \
    lodash@4.17.21 \
    && npm cache clean --force

# 健康检查脚本
COPY --chown=app:app healthcheck.js /app/healthcheck.js
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node /app/healthcheck.js

# 默认命令（保持容器运行）
CMD ["node", "-e", "setInterval(() => {}, 86400000)"]
