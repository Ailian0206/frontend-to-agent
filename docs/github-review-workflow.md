# GitHub 开发与审核流程

本文档定义 `frontend-to-agent` 的分支、PR、CI、独立审核与合并规则。  
对齐同级仓库（尤其 `mcp-guardian` / `evidence-graph`）的成本优先约定：少开 PR、Claude 每 PR 只审一次、小改可直推 `main`。

## 0. 成本红线（与同级仓一致）

1. **没事禁止开 PR**；只有里程碑（或用户明确要求）才开。  
2. **开放 PR ≤ 1**；当前 PR 未合并前不开始下一个里程碑 PR。  
3. **Claude 每个 PR 只审一次**；修完不复审。  
4. **禁止**为烧额度并行多路审核或再跑 Bugbot 当门禁。  
5. 里程碑分支内可小步 commit 并可 `push` 远端分支，**默认仍不开 PR**，验收绿后再开。  
6. Cursor Bugbot 或其他自动评论只能作附加反馈，不能替代独立 Claude 审核。

独立审核命令（与同级仓相同的全局 skill）：

```bash
claude --permission-mode auto --model sonnet -p "/codex-independent-pr-review <PR编号>"
```

## 1. 变更分级

### 小型维护

以下改动可以在干净、已同步的 `main` 上完成，本地验证后直接提交并推送：

- 局部 bug、样式、交互或文案修复。
- 聚焦的测试修复或少量文档维护。
- 不新增独立能力，不改变依赖、部署、安全边界或跨模块契约。

推送后必须检查 `Deploy tutorial to GitHub Pages`。该工作流会在发布前执行 lint、类型检查、单元测试、静态构建和桌面/移动 E2E。

### 里程碑变更

以下改动使用功能分支；**验收通过后再开唯一 PR**：

- 新增完整课程能力、页面流程或示例工程模块。
- 依赖升级、部署与 CI 变更。
- 安全边界、跨模块契约或大范围重构。
- 无法明确归为小型维护的改动。

推荐分支名：`feat/<topic>`、`fix/<topic>`、`docs/<topic>`、`ci/<topic>`。

日常闭环：

```text
main → 里程碑分支（小步 commit，可 push，默认不开 PR）
  → Superpowers：brainstorm → spec → plan → worktree 实现
  → GITHUB_PAGES=true npm run test:ci && npm run test:e2e
  → 开唯一 PR（开放 PR 必须为 0）
  → 独立 Claude 审核恰好一次
  → 有问题：最小修复 → 本地+CI 绿 → merge（禁止复审）
  → 没问题：CI 绿 → merge commit 并删除远端分支
```

## 2. 本地门禁

项目要求 Node.js 22。创建里程碑 PR 前运行：

```bash
GITHUB_PAGES=true npm run test:ci
npm run test:e2e
git diff --check
```

`test:ci` 覆盖 lint、typecheck、Vitest 和 GitHub Pages 静态导出；Playwright 覆盖桌面端和移动端关键路径。自动化测试不得调用付费模型 Provider。

## 3. PR CI

`.github/workflows/ci.yml` 在指向 `main` 的 PR 上运行，只授予 `contents: read` 权限。它使用 Node.js 22 和锁文件安装，并执行与本地相同的完整门禁。同一 PR 推送新提交时，旧的未完成运行会被取消。

PR 描述使用仓库模板，必须包含：

- 变更摘要与影响范围。
- 本地验证命令和结果。
- UI 改动的桌面端与移动端检查。
- 风险、后续事项和审核状态。

## 4. 独立 Claude 审核

每个里程碑 PR 只允许一次成功的独立 Claude 审核。

审核边界：

1. Claude 只审核并在 PR 发布评论，不修改代码、不提交、不推送、不合并。  
2. 实现侧必须读取完整评论并技术核验，不盲目接受 finding。  
3. 成立的问题在原 PR 分支最小修复，重新运行聚焦测试和完整门禁后提交、推送。  
4. Claude 成功发布审核后禁止再次调用；修复正确性由复现、本地门禁和最终 CI 保证。  
5. 首次命令失败或没有发布评论时最多重试一次；一旦产生有效审核评论，该 PR 的审核额度即已使用。

## 5. 合并与收口

同时满足以下条件后合并：

- Claude 已完成本 PR 唯一一次审核。  
- 有效 blocking finding 已修复，其他 finding 有明确技术结论。  
- 最终 GitHub Actions CI 通过。  
- PR 不包含密钥、`.env`、付费 Provider 响应或无关改动。

固定使用 merge commit，并删除远端功能分支：

```bash
gh pr merge <PR编号> --merge --delete-branch
```

禁止 squash、rebase、amend、force push。

本仓库采用轻量模式，不启用 `main` 分支保护。GitHub 仓库只开放 merge commit，并启用合并后自动删除分支；小型维护仍可按第 1 节直接进入 `main`。

## 6. 与同级仓差异（刻意保留）

| 项 | `frontend-to-agent` | `mcp-guardian` 等 |
|---|---|---|
| 审核 skill | 全局 `/codex-independent-pr-review` | 仓内 `/pr-review` + `pr-gate.sh` |
| 栈门禁 | `npm run test:ci` + Playwright | 多为 `pnpm` 门禁 |
| 部署 | GitHub Pages | 各仓自有 |

语义对齐：成本红线、开放 PR ≤ 1、Claude 单次审核、merge commit、小改直推 `main`。脚本级 `pr-gate.sh` 不强制复制；需要时再补齐。
