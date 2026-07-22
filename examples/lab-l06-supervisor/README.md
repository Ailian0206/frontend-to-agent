# Lab L06 — Supervisor 双 Worker 最小权限

**能力：** S8（多 Agent / Supervisor 编排）  
**关联课：** `multi-agent`（站点章节）

## 目标

用**纯 TypeScript** 实现一个最小 Supervisor：按意图把请求路由到 Worker A 或 Worker B，并在调用前校验 **Tool 白名单**。越权 Tool、无法识别的意图必须在进入 Worker 之前失败。练习「编排层负责路由与权限，Worker 只暴露有限能力」——不依赖 LangChain、不调用付费模型 API。

## 本地运行

```bash
cd examples/lab-l06-supervisor
npm install
npm test
```

可选类型检查：

```bash
npm run build
```

**CI：** 根仓库 `test:examples` 会串联本子包；全部为内存 mock 数据，**不调用任何付费模型或外部 HTTP API**。

## 包结构

| 文件 | 说明 |
|------|------|
| `src/types.ts` | `Intent`、`RouteResult`、`RunResult`、错误码 |
| `src/workers.ts` | WorkerA（`orders:read`）、WorkerB（`docs:search`）及 `allowedTools` |
| `src/supervisor.ts` | `route(intent)`、`run(intent, toolName, args)` |
| `src/supervisor.test.ts` | 路由表、白名单、拒答单测 |

## 路由表

| 意图 `intent` | 目标 Worker | 典型 Tool |
|---------------|-------------|-----------|
| `order_status` | A | `orders:read` |
| `policy_question` | B | `docs:search` |
| `unknown` | — | 拒答（`REJECTED`） |

## 权限要点

- Supervisor 先 `route`，再检查 `allowedTools`；不在白名单 → `FORBIDDEN`。
- `unknown` 意图直接 `REJECTED`，不调用任何 Tool。
- Worker 内部仅为教学用 mock；真实系统应在网关 / MCP 层复用同一白名单思路。

## 验收清单（≥5）

完成本 Lab 后，你应能勾选以下项（与 `npm test` 对齐）：

1. [ ] `order_status` 路由到 Worker A
2. [ ] `policy_question` 路由到 Worker B
3. [ ] `unknown` 返回 `reject` / `REJECTED`，且不执行 Tool
4. [ ] `order_status` + `orders:read` 返回 mock 订单状态
5. [ ] `policy_question` + `docs:search` 返回 mock 文档命中
6. [ ] 意图与 Tool 不匹配（如 A 路径调用 `docs:search`）→ `FORBIDDEN`

## 与 S8 课的对应

- Supervisor 负责终止协议与路由，避免 Worker 互相直连  
- 最小权限 Tool 列表应对齐岗位上的「能力边界」与审计  
- 单测覆盖路由表与越权，避免把策略只写在 Prompt 里
