# Lab L02 — 订单只读 Tool 契约

**能力：** S2（Tool 调用与契约）  
**关联课：** `tool-calling`（站点章节）

## 目标

实现一个**只读**的 `orderStatus` Tool：用 Zod 约束入参、区分合法调用与非法参数、在 Agent 角色下强制 `dryRun`，并返回可机器处理的错误码。练习「契约先于实现」——模型或编排层应先过 Schema 与权限，再触达（本 Lab 为 mock）上游。

## 本地运行

```bash
cd examples/lab-l02-tool-contract
npm install
npm test
```

可选类型检查：

```bash
npm run build
```

**CI：** 根仓库 `test:ci` 会串联本子包；全部用内存 fake 上游，**不调用任何付费模型或外部 HTTP API**。

## 包结构

| 文件 | 说明 |
|------|------|
| `src/errors.ts` | 错误码：`INVALID_ARGS` \| `FORBIDDEN` \| `TIMEOUT` \| `UPSTREAM` |
| `src/order-tool.ts` | `OrderStatusInput` Schema、`executeOrderStatus` |
| `src/order-tool.test.ts` | Vitest 用例 |

## 契约要点

- **入参：** `orderId` 必须为 `ORD-######`（6 位数字）；`dryRun` 默认 `true`。
- **只读：** 无写操作；`dryRun: false` 表示「非演练读」仍仅为查询语义。
- **权限：** `role: 'agent'` 且 `dryRun: false` → `FORBIDDEN`；`admin` 可 `dryRun: false`。
- **非法参数：** Schema 失败 → `INVALID_ARGS`。
- **取消：** `AbortSignal` 已中止 → `TIMEOUT`。
- **上游：** `ORD-999999` 在 mock 中触发 `UPSTREAM`，便于单测失败路径。

## 验收清单（≥5）

完成本 Lab 后，你应能勾选以下项（与 `npm test` 对齐）：

1. [ ] 合法 `ORD-000002` + Agent 默认 `dryRun` 返回 `shipped` / `dryRun: true`
2. [ ] Admin + `dryRun: false` 可成功返回订单状态
3. [ ] 缺字段、错误 `orderId` 格式、错误类型 → `INVALID_ARGS`
4. [ ] Agent + `dryRun: false` → `FORBIDDEN`
5. [ ] 已中止的 `AbortSignal` → `TIMEOUT`
6. [ ] 保留单号 `ORD-999999` → `UPSTREAM`（扩展：上游失败分类）

## 与 S2 课的对应

- Schema 与错误码对齐编排层重试 / 拒答策略  
- Dry Run 作为 Agent 默认安全边界  
- 单测覆盖非法参数与越权，避免把业务规则只写在 Prompt 里
