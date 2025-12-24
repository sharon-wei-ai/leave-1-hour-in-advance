# Python runtime base image
FROM python:3.11-alpine

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
# 注意：这里只预装最基础的库，其他依赖在功能代码中通过 requirements.txt 安装
RUN pip install --no-cache-dir --user \
    requests==2.31.0 \
    && pip cache purge

# 健康检查脚本
COPY --chown=app:app healthcheck.py /app/healthcheck.py
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python /app/healthcheck.py

# 默认命令（保持容器运行）
CMD ["python", "-c", "import time; time.sleep(86400)"]
