# M4 加厚 S9–S11、L07–L08 与选修成文 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 加厚 S9–S11 主线课；交付 L07–L08 可测 Lab；把 E1–E5 选修从占位写成可讲清楚的正文（§5.3），站点侧全部去 `comingSoon`（除作品集后续 M5）。

**Architecture:** 沿用 M2/M3——课/选修在 `src/content`；Lab 为 `examples/lab-l0x-*` + Vitest；`relatedLabs` 双向；`test:examples` 串联 L01–L08。

**Tech Stack:** 内容模型、Zod、Vitest、TypeScript NodeNext；MCP Lab 用内存假 server/白名单（不启真实远程 MCP）；评估 Lab 用轨迹夹具 + 护栏纯函数。

**Spec:** `docs/superpowers/specs/2026-07-22-job-ready-curriculum-depth-design.md` §4.2、§5、§8-M4

**Out of scope:** 作品集封顶 / knowledge-agent 升级（M5）。

---

## File map

| File | Responsibility |
|---|---|
| `src/content/chapters/mcp-protocol.ts` | S9 加厚 |
| `src/content/chapters/eval-security.ts` | S10 加厚 |
| `src/content/chapters.base.ts` (`deploy-observe`) | S11 加厚 |
| `src/content/placeholders.ts` | L07–L08 实章；E1–E5 成文 |
| `examples/lab-l07-mcp-whitelist/**` | 只读 MCP + 白名单 |
| `examples/lab-l08-eval-guardrail/**` | 轨迹断言 + 输出护栏 + API 门禁 |
| `package.json` | `test:examples` + L07/L08 |
| `chapters.test.ts` / README / e2e | M4 门禁 |

---

### Tasks

1. **门禁测试**：S9–S11 含何时用/失败/面试/`relatedLabs`；L07–L08 非占位；E1–E5 `comingSoon` falsy 且含面试/架构要点  
2. **加厚** `mcp-protocol` → lab-l07；`eval-security` → lab-l08；`deploy-observe` → lab-l08  
3. **L07**：内存 MCP 工具注册表 + agent 白名单调用；越权拒绝；无网络  
4. **L08**：`assertTrajectory`、`outputGuardrail`（注入/PII）、简易 `rateLimit`/`auth` 门禁纯函数  
5. **选修 E1–E5**：每章问题背景、与主线差异、diagram、最小示例或阅读路径、面试≥3、checkpoint（可无 Lab）  
6. **CI/README/e2e** + PR + Claude 一次审核  

分支：`feat/curriculum-m4-s9-s11-electives`
