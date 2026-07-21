# GitHub 审核流程设计

## 目标

为教程站建立可执行、可验证的轻量 GitHub 审核流程：里程碑改动通过功能分支、PR CI 与独立 Claude 审核进入 `main`；小型维护仍可在完成本地验证后直接推送 `main`。

## 参考与取舍

方案参考同级仓库 `ai-photo-studio-cn`、`evidence-graph`、`mcp-guardian` 与 `yiju` 的现有实践，但只采用适合本项目的部分：

- 复用 Node.js 22、锁文件安装、lint、typecheck、unit、build 与 Playwright E2E 门禁。
- 不复制数据库、Provider 边界、Supabase 或 PostgreSQL 等项目特有检查。
- 不启用 `main` 分支保护，保留小型维护直推能力。
- 独立审核采用同级仓库的成本约束：每个 PR 只成功调用 Claude 一次；Claude 只评论，修复后的正确性由本地完整门禁和最终 CI 保证。

## 工作流设计

### PR CI

新增 `.github/workflows/ci.yml`，仅由指向 `main` 的 `pull_request` 和手动调度触发。工作流只授予 `contents: read`，并按以下顺序执行：

1. Checkout。
2. 使用 Node.js 22 和 npm 缓存。
3. `npm ci`。
4. 安装 Playwright Chromium 及系统依赖。
5. `GITHUB_PAGES=true npm run test:ci`，覆盖 lint、类型检查、单元测试与静态导出构建。
6. `npm run test:e2e`，覆盖桌面端和移动端关键路径。

同一 PR 的旧运行会被取消，减少无效资源占用。

### `main` 发布

保留现有 `.github/workflows/deploy-pages.yml`。它只在 `main` 推送或手动调度时运行，先执行完整质量门禁，再发布 `out/` 到 GitHub Pages。因此小型维护直推 `main` 后仍会经过完整检查，且不会在 `main` 上重复触发独立 CI。

### PR 审核

新增 PR 模板，要求说明变更摘要、影响范围、验证证据、风险和审核状态。里程碑 PR 的固定闭环为：

1. 本地完整门禁通过后推送功能分支并创建 PR。
2. 运行 `claude --permission-mode auto --model sonnet -p "/codex-independent-pr-review <PR编号>"`。
3. Codex 技术核验评论；成立的问题在原 PR 分支修复、测试、提交并推送，不再次调用 Claude。
4. Claude 的一次审核已完成、有效 finding 已处理且最终 GitHub CI 通过后，使用 `gh pr merge <PR编号> --merge --delete-branch` 合并。

禁止 squash、rebase 和 force push。Claude 只审核和评论，不修改代码、不提交、不推送、不合并。

## 仓库设置

GitHub 仓库继续保持无分支保护的轻量模式，但关闭 squash merge 与 rebase merge，只保留 merge commit，并启用合并后自动删除分支。这样既保留小型维护直推能力，也让所有 PR 的合并方式与仓库文档一致。

## 验收标准

- PR CI 文件可被 YAML 解析，权限为只读，触发范围符合设计。
- PR 模板和仓库协作说明能完整描述轻量模式与独立审核闭环。
- `npm run test:ci` 和 `npm run test:e2e` 本地通过。
- 本次变更通过功能分支创建 PR，完成一次独立 Claude 审核并处理有效 finding，GitHub CI 通过。
- PR 使用 merge commit 合并，远端功能分支被删除，Pages 发布成功。

## 不做项

- 不启用 branch protection 或 repository ruleset。
- 不新增需要 Token 或付费服务的自动审核 Action。
- 不复制同级仓库与数据库、Provider 或产品状态相关的门禁脚本。
- 不改变教程站功能、课程内容或视觉样式。
