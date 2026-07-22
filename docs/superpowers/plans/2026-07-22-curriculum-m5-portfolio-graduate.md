# M5 作品集封顶与毕业验收 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 升级 `examples/knowledge-agent` 为可演示作品集；上线 `/graduate` 毕业验收清单；去掉站点「10 年以上」受众限定文案。

**Architecture:** 作品集在子包内补齐 HITL 确认副作用、离线评估集（≥30）、输出护栏与演示脚本；站点新增 `/graduate` 勾选 S1–S11 证据链接；根 `test:ci` 纳入 knowledge-agent 离线测试。文案同步改 README/layout。

**Spec:** `docs/superpowers/specs/2026-07-22-job-ready-curriculum-depth-design.md` §6、§8-M5、§10

**Out of scope:** 生产真实 SMTP/付费模型 CI；另开「生产部署运维课程」设计（其它分支）。

---

## File map

| Area | Files |
|---|---|
| Copy | `README.md`, `src/app/layout.tsx`（及其它命中「10 年以上」处） |
| Portfolio | `examples/knowledge-agent/**` |
| Site | `src/app/graduate/page.tsx`, `GraduatePage.tsx`, sitemap, CourseApp nav, capstone 章更新 |
| CI | `package.json` `test:examples` |

---

### Task 1: 文案

- [ ] 「面向 10 年以上前端工程师」→「面向前端工程师」（或等价，去掉资历限定）

### Task 2: knowledge-agent HITL + 护栏

- [ ] 副作用工具（如 `draft_notify`）须 `confirm` token 才执行（内存门，复用 L05 思路）
- [ ] `checkAnswer` 护栏：无引用则拒答标记；注入短语检测（复用 L08 思路，可本地拷贝精简）
- [ ] 单测覆盖；CI 不调 OpenAI

### Task 3: 评估集 ≥30 + 演示脚本

- [ ] `eval/cases.json`（≥30）：含成功/无证据/注入类
- [ ] `src/eval-run.ts` + test：轨迹规则 + 护栏对夹具输出断言（mock answers，不调模型）
- [ ] `scripts/demo-paths.md` 或 `scripts/demo.sh` 文档化四路径
- [ ] README：部署/观测/成本、能力 ID、验收清单

### Task 4: `/graduate` + capstone

- [ ] 毕业页：S1–S11 清单，链到课/Lab/作品集；localStorage 勾选
- [ ] 侧栏/导航入口「毕业验收」
- [ ] 更新 capstone 正文指向升级后的仓库能力
- [ ] e2e：打开 `/graduate/`；文案不含「10 年以上」

### Task 5: 门禁与 PR

```bash
GITHUB_PAGES=true npm run test:ci
CI=true npm run test:e2e
```

分支：`feat/curriculum-m5-portfolio-graduate`（基于 `main`）
