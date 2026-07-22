# Lab L05 — Checkpoint 与人机确认（HITL）

**能力：** S6（线程 Checkpoint / 可恢复状态）、S7（人机确认门闩）  
**关联课：** `checkpoint-resume`、`human-in-the-loop`（站点章节）

## 目标

在内存中实现 **Checkpoint 存储**与 **邮件发送 HITL 门闩**：Agent 线程状态可版本化保存与恢复；有副作用的动作必须先 `propose`，经用户 `confirm` 后才执行一次 mock 发送；`reject` 取消提案。练习「状态可恢复」与「副作用不可绕过确认」两条安全基线。

## 本地运行

```bash
cd examples/lab-l05-checkpoint-hitl
npm install
npm test
```

可选类型检查：

```bash
npm run build
```

**CI：** 根仓库 `test:ci` 会串联本子包；全部为内存 mock，**不调用任何付费模型或外部 HTTP API**。

## 包结构

| 文件 | 说明 |
|------|------|
| `src/checkpoint.ts` | `MemoryCheckpointStore`：`save` / `load` / `listVersions` |
| `src/hitl.ts` | `HitlEmailGate`：`proposeEmailSend` → `confirm` \| `reject` |
| `src/checkpoint.test.ts` | Checkpoint 单测 |
| `src/hitl.test.ts` | HITL 单测 |

## 契约要点

### S6 — Checkpoint

- **`save(threadId, state)`**：追加新版本，返回 `version` 与 `savedAt`。
- **`load(threadId)`**：返回最新 `state`；指定 `version` 可加载历史快照。
- **`listVersions(threadId)`**：按版本升序列出元数据（可选能力，本 Lab 已实现）。

### S7 — HITL 邮件

- **`proposeEmailSend({ to, subject, body, idempotencyKey })`** → `{ status: 'confirm_required', proposalId, token }`。
- **`confirm(proposalId, token)`**：校验 token 后执行 **一次** mock 发送；错误 token → `INVALID_TOKEN`。
- **重复 `confirm`**：返回与首次相同的结果，**不重复发送**（幂等）。
- **`reject(proposalId, token)`** → `{ status: 'cancelled' }`；已拒绝的提案不可再 confirm。
- **无公开直发 API**：模块不导出 `sendEmail` / `execute` 类函数，副作用只能经 `confirm` 触发。

## 验收清单（≥5）

完成本 Lab 后，你应能勾选以下项（与 `npm test` 对齐）：

1. [ ] `save` / `load` 能恢复线程最新状态
2. [ ] 按 `version` 加载历史 Checkpoint
3. [ ] `propose` → `confirm` 成功发送且 `physicalSendCount === 1`
4. [ ] 错误 token 确认失败且不发送
5. [ ] `reject` 后提案取消且无法 confirm
6. [ ] 二次 `confirm` 幂等，不重复发送（扩展：`listVersions` 与公开 API 无直发）

## 与 S6 / S7 课的对应

- Checkpoint 支持长任务中断恢复，避免只靠内存里的 Agent 状态  
- HITL 将「模型想做的事」与「系统真正执行的事」拆开，token 绑定单次提案  
- 单测覆盖越权 token 与重复确认，避免副作用藏在 Prompt 里
