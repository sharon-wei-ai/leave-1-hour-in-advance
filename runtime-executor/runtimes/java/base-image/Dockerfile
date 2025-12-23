# Java runtime base image
FROM eclipse-temurin:17-jre-alpine

# 创建非 root 用户
RUN adduser -D -s /bin/sh app && \
    apk add --no-cache ca-certificates tzdata curl jq && \
    mkdir -p /app /tmp/runtime && \
    chown -R app:app /app /tmp/runtime

# 切换到非 root 用户
USER app
WORKDIR /app

# 设置时区
ENV TZ=Asia/Shanghai

# 健康检查脚本
COPY --chown=app:app healthcheck.sh /app/healthcheck.sh
RUN chmod +x /app/healthcheck.sh
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /app/healthcheck.sh

# 默认命令（保持容器运行）
CMD ["sh", "-c", "while true; do sleep 86400; done"]
