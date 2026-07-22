# M3 加厚 S5–S8 课与 L04–L06 Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 加厚 S5–S8 主线课至岗位深度标准，交付可安装、可单测（CI mock、无付费模型）的 L04–L06 Lab，站点对应 Lab 章去占位。

**Architecture:** 沿用 M2 模式——课在 `src/content` 扩写；Lab 为 `examples/lab-l0x-*` 独立 ESM 子包 + Vitest；`relatedLabs` 双向链接；根 `test:examples` 串联全部已交付 Lab。

**Tech Stack:** 站点内容模型、Zod、Vitest、TypeScript NodeNext；Lab 用纯函数/内存 fake（向量检索用简易词袋或固定 embedding 夹具，禁止 CI 调 OpenAI/Qdrant 云）。

**Spec:** `docs/superpowers/specs/2026-07-22-job-ready-curriculum-depth-design.md` §4、§5、§8-M3

**Out of scope:** S9–S11、L07–L08、选修成文、作品集（M4–M5）。

---

## File map

| File | Responsibility |
|---|---|
| `src/content/chapters.base.ts` (`rag`, `memory`, `multi-agent`) | S5 / S6 / S8 加厚 |
| `src/content/chapters/human-in-the-loop.ts` | S7 加厚 |
| `src/content/placeholders.ts` | L04–L06 实正文；L07–L08 仍 stub |
| `examples/lab-l04-rag-eval/**` | Recall@K / 切块评估 |
| `examples/lab-l05-checkpoint-hitl/**` | checkpoint + 确认副作用 |
| `examples/lab-l06-supervisor/**` | Supervisor 路由与最小权限 |
| `package.json` | `test:examples` 增加 L04–L06 |
| `src/content/chapters.test.ts` | M3 深度门禁 |
| `README.md` / e2e | Labs 表与 L04 冒烟 |

---

### Task 1: M3 深度门禁测试

- [ ] 对 `rag` / `memory` / `human-in-the-loop` / `multi-agent` 断言含 何时用|何时不用、失败|调试、面试、`relatedLabs`
- [ ] 对 `lab-l04`/`l05`/`l06` 断言非 `comingSoon`、含 `examples/lab-l0`、含 checkpoint
- [ ] Commit `test(content): 增加 M3 深度门禁用例`

### Task 2–5: 加厚四课

| 章 | skills | relatedLabs | 重点 |
|---|---|---|---|
| `rag` | S5 | lab-l04 | 切块、权限过滤、Recall@K、引用拒答 |
| `memory` | S6 | lab-l05 | thread/checkpoint、隔离 |
| `human-in-the-loop` | S7 | lab-l05 | interrupt/resume、审计、幂等 |
| `multi-agent` | S8 | lab-l06 | Supervisor、何时不该拆 |

每章：决策表、反例、失败分类、面试≥3、checkpoint、Lab callout。

### Task 6: L04 `examples/lab-l04-rag-eval`

- 内存语料 + 简易检索（token overlap / BM25-lite）
- `recallAtK(relevantIds, retrievedIds, k)` 纯函数
- 切块函数 + 单测；夹具文档；**无**向量云、**无** OpenAI
- README：S5、验收≥5、CI mock

### Task 7: L05 `examples/lab-l05-checkpoint-hitl`

- `CheckpointStore` 内存实现（save/load thread）
- `proposeSideEffect` → `confirm_required`；`resume` 需 token；未确认不可执行
- 幂等 key；Abort/拒绝路径
- README：S6/S7

### Task 8: L06 `examples/lab-l06-supervisor`

- `route(intent)` → worker A/B 或 reject
- Worker 能力白名单；越权调用失败
- 单测覆盖路由表与拒绝
- README：S8

### Task 9: 站点 Lab 章 + CI + UI/README/e2e

- placeholders 替换 L04–L06
- `test:examples` 追加三包 `ci && test`
- e2e：`/chapter/lab-l04/` 可见 examples 路径
- README Labs 表更新

### Task 10: 门禁与 PR

```bash
GITHUB_PAGES=true npm run test:ci
CI=true npm run test:e2e
```

分支 `feat/curriculum-m3-s5-s8-labs` → PR → Claude 审一次 → merge commit。

---

## Spec coverage

| Spec | Task |
|---|---|
| S5–S8 §5.1 | T2–T5 |
| L04–L06 §5.2 | T6–T9 |
| CI 无付费模型 | T6–T8 |
| M4+ | 不做 |
