# 项目结构（MVP 起步版）

- `frontend/`：前端占位（React + TS，后续初始化）
- `backend/`：主后端占位（Node + TS，后续初始化）
- `runtime-executor/`：执行调度与多运行时占位
  - `dispatcher/`：任务调度/队列消费者占位
  - `runtimes/`：多语言运行时基础镜像占位（python/node/java）
- `infra/compose/`：本地 PoC 的 docker-compose 占位
- `docs/`：文档占位（含安全基线）

原则：最低成本、MVP 优先，只放占位与基础镜像，后续按需扩展。

## 快速开始（本地 PoC 占位）
1) 安装 pnpm（或你选择的包管理器）。
2) 运行 compose（需 Docker）：`docker compose -f infra/compose/docker-compose.yml up -d`
3) 前端/后端尚未初始化，后续将分别用 Vite React-TS 与 Node-TS 脚手架创建。

> 提示：`.env` 请自行复制 `.env.example`（稍后补充）并填入本地配置，不要提交真实密钥。

