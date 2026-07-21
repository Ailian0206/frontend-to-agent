# GitHub Review Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为教程站增加轻量、可执行的 GitHub PR CI 与独立 Claude 审核闭环。

**Architecture:** PR 使用独立的只读 CI 执行现有质量门禁；`main` 继续由 Pages 工作流在部署前执行同一门禁。仓库文档和 PR 模板规定里程碑 PR、每个 PR 一次独立审核、merge commit 合并，小型维护仍可直推 `main`。

**Tech Stack:** GitHub Actions、Node.js 22、npm、Vitest、Next.js static export、Playwright、GitHub CLI、Claude Code CLI。

---

### Task 1: 增加 PR 质量门禁

**Files:**
- Create: `.github/workflows/ci.yml`

- [x] **Step 1: 建立只读 PR 工作流**

写入指向 `main` 的 `pull_request` 与 `workflow_dispatch` 触发器，设置 `contents: read`、PR 级并发取消，并使用 Node.js 22 依次运行 `npm ci`、Playwright Chromium 安装、`GITHUB_PAGES=true npm run test:ci` 与 `npm run test:e2e`。

- [x] **Step 2: 静态检查工作流内容**

Run: `git diff --check && sed -n '1,240p' .github/workflows/ci.yml`

Expected: 无空白错误；触发器、权限、Node.js 版本与两组门禁命令均清晰可见。

### Task 2: 固化审核约定

**Files:**
- Create: `.github/pull_request_template.md`
- Create: `docs/github-review-workflow.md`
- Modify: `AGENTS.md`
- Modify: `README.md`

- [x] **Step 1: 增加 PR 模板**

模板包含变更摘要、影响范围、验证证据、风险、一次独立审核与 CI 状态，不预先勾选尚未发生的检查。

- [x] **Step 2: 增加 GitHub 审核说明**

文档明确小型维护与里程碑的边界、分支和提交规范、独立审核命令、修复后禁止复审、CI 门禁和 merge commit 合并命令。

- [x] **Step 3: 接入仓库入口文档**

`AGENTS.md` 要求后续 Agent 遵守审核说明；`README.md` 在质量检查和项目结构中提供审核说明入口。

- [x] **Step 4: 检查文档一致性**

Run: `rg -n "独立审核|pull_request|test:ci|test:e2e|merge --delete-branch" .github AGENTS.md README.md docs/github-review-workflow.md`

Expected: 规则只描述轻量模式，不出现 branch protection、squash/rebase 合并或要求 Claude 复审的矛盾表述。

### Task 3: 验证并提交实现

**Files:**
- Modify: only files from Tasks 1-2

- [x] **Step 1: 运行完整本地门禁**

Run: `GITHUB_PAGES=true npm run test:ci`

Expected: lint、typecheck、Vitest 和 GitHub Pages 静态构建全部通过。

- [x] **Step 2: 运行桌面与移动 E2E**

Run: `npm run test:e2e`

Expected: desktop 与 mobile 项目全部通过。

- [x] **Step 3: 检查并提交差异**

Run: `git status --short && git diff --stat && git diff --check`

Expected: 只有本计划列出的文件发生变化且无 diff 格式错误。

Commit: `ci: 建立 GitHub PR 审核门禁`

### Task 4: 用真实 PR 验证流程

**Files:**
- External: GitHub repository settings and PR state

- [ ] **Step 1: 设置仓库合并策略**

Run: `gh repo edit Ailian0206/frontend-to-agent --enable-merge-commit --enable-squash-merge=false --enable-rebase-merge=false --delete-branch-on-merge`

Expected: 仓库只保留 merge commit，并在合并后自动删除分支；不启用分支保护。

- [ ] **Step 2: 推送分支并创建 PR**

Run: `git push -u origin ci/github-review-workflow`，然后用 `gh pr create` 创建包含摘要、验证和风险的 PR。

Expected: PR 指向 `main`，新 CI 自动启动。

- [ ] **Step 3: 运行独立 Claude 审核**

Run: `claude --permission-mode auto --model sonnet -p "/codex-independent-pr-review <PR编号>"`

Expected: Claude 针对审核时的 head SHA 发布本 PR 唯一一次审核结论，且没有修改仓库。

- [ ] **Step 4: 处理审核并确认 CI**

若存在有效 finding，在原分支修复并重新执行 Task 3，但不再次调用 Claude。运行 `gh pr checks <PR编号> --watch --fail-fast`，直到一次审核的有效 finding 已处理且最终 CI 通过。

- [ ] **Step 5: 合并并验证发布**

Run: `gh pr merge <PR编号> --merge --delete-branch`

Expected: PR 使用 merge commit 合并，分支删除，`main` 的 Pages 工作流成功，网站继续可访问。
