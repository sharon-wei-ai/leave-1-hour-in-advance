# AI辅助办公软件 - 高数据保护要求下的零原文件存储方案

## 项目概述

本项目是一个面向高数据保护要求的AI辅助办公软件，核心特点：
- **零原文件存储**：所有上传的文档和数据不存储原文件
- **Skill提取**：从文档中提取知识和规则，形成可复用的技能（Skill）
- **功能化封装**：将Skill封装成独立的小功能模块
- **团队共享**：功能可在团队内共享使用
- **多运行时支持**：支持Python、Node.js、Java等多种编程语言的功能执行

## 项目结构（MVP 起步版）

- `frontend/`：前端占位（React + TS，后续初始化）
- `backend/`：主后端占位（Node + TS，后续初始化）
- `runtime-executor/`：执行调度与多运行时占位
  - `dispatcher/`：任务调度/队列消费者占位
  - `runtimes/`：多语言运行时基础镜像占位（python/node/java）
- `infra/compose/`：本地 PoC 的 docker-compose 占位
- `infra/k8s/`：Kubernetes 部署配置（后续补充）
- `docs/`：文档占位（含安全基线）
- `.github/workflows/`：CI/CD 工作流

原则：最低成本、MVP 优先，只放占位与基础镜像，后续按需扩展。

## 快速开始（本地 PoC 占位）

1. 安装依赖：
   - 安装 pnpm（或你选择的包管理器）
   - 安装 Docker（用于本地开发环境）

2. 配置环境变量：
   ```bash
   cp env.example .env
   # 编辑 .env 文件，填入本地配置（不要提交真实密钥）
   ```

3. 运行本地环境：
   ```bash
   docker compose -f infra/compose/docker-compose.yml up -d
   ```

4. 前端/后端尚未初始化，后续将分别用 Vite React-TS 与 Node-TS 脚手架创建。

## 开发规范

### 分支保护规则

`main` 分支已启用保护规则：
- ✅ **禁止直接推送**：所有更改必须通过 Pull Request
- ✅ **必须通过 CI 检查**：`docker-build` 必须通过才能合并
- ✅ **需要 PR 审核**：至少需要 1 个审批才能合并
- ✅ **管理员也需遵守**：包括管理员在内的所有用户都必须遵守规则

### 提交流程

1. **创建功能分支**：
   ```bash
   git checkout main
   git pull
   git checkout -b feature/your-feature-name
   ```

2. **开发并提交**：
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push -u origin feature/your-feature-name
   ```

3. **创建 Pull Request**：
   - 使用 GitHub CLI：`gh pr create`
   - 或通过 GitHub 网页界面创建 PR

4. **等待 CI 检查和审核**：
   - CI 会自动运行 `lint-test-build` 和 `docker-build`
   - 需要至少 1 个团队成员审批
   - 所有检查通过后才能合并

5. **合并 PR**：
   - 在 GitHub 网页界面点击 "Merge pull request"
   - 或使用 CLI：`gh pr merge --merge`

### CI/CD 流程

当前 CI 工作流（`.github/workflows/ci.yml`）包含：
- **lint-test-build**：代码检查、测试、构建
- **docker-build**：Docker 镜像构建（当前为占位）

> 注意：当前 CI 为占位实现，实际功能待后续补充。

### 提交规范

请遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：
- `feat:` 新功能
- `fix:` 修复问题
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具相关

## 相关文档

- [需求文档](./需求文档.md)：完整的产品需求说明
- [开发计划](./开发计划.md)：开发流程与日程计划
- [原型说明](./原型说明.md)：UI/UX 原型设计说明
- [贡献指南](./CONTRIBUTING.md)：代码贡献规范
- [安全基线](./docs/SECURITY.md)：安全策略与零原文件存储要求

## 技术栈

- **前端**：React + TypeScript
- **后端**：Node.js + TypeScript（主中台）
- **多运行时**：Python 3.11 / Node.js 18 / Java 17（容器化）
- **容器编排**：Docker + Kubernetes（本地开发用 Docker Compose）
- **消息队列**：Kafka（默认）或 RabbitMQ
- **数据库**：PostgreSQL + Redis
- **CI/CD**：GitHub Actions

## 状态

⚠️ **当前状态**：项目处于初始化阶段，大部分功能为占位实现。

- ✅ 仓库结构已搭建
- ✅ 分支保护规则已配置
- ✅ CI/CD 工作流占位已创建
- ✅ 多运行时基础镜像 Dockerfile 已准备
- ⏳ 前端/后端代码待初始化
- ⏳ 功能执行引擎待实现

## 许可证

（待补充）

## 联系方式

（待补充）

