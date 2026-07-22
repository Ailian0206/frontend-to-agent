# Lab L07 — 只读 MCP 与白名单 Agent

**能力：** S9（MCP 协议与工具边界）  
**关联课：** `mcp-protocol`（站点章节）

## 目标

用 **ESM + TypeScript `NodeNext` + Vitest** 搭建一套**无网络、无官方 MCP SDK** 的内存协议模拟：Server 注册 Tool、Agent 侧白名单放行。练习「先列工具、再限名单、再拒写」——与真实 MCP 部署时 `tools/list` + 编排层策略一致，本 Lab 全部在进程内完成。

## 本地运行

```bash
cd examples/lab-l07-mcp-whitelist
npm install
npm test
```

可选类型检查：

```bash
npm run build
```

**CI：** 根仓库 `test:ci` 会串联本子包；`fixtures` 为内存 mock，**不发起网络请求、不连接真实 MCP 进程**。

## 包结构

| 文件 | 说明 |
|------|------|
| `src/errors.ts` | 错误码：`FORBIDDEN` \| `NOT_FOUND` |
| `src/mcp-server.ts` | `InMemoryMcpServer`：`registerTool` / `listTools` / `callTool` |
| `src/agent-client.ts` | `WhitelistAgent`：白名单 + 只读约束 |
| `src/fixtures.ts` | 演示用 `docs.search`、`orders.get`（只读）与 `orders.cancel`（写） |
| `src/mcp-whitelist.test.ts` | Vitest 用例 |

## 行为要点

- **Server：** `callTool` 对未注册工具抛 `NOT_FOUND`。
- **Agent：** 仅当工具名在 `allowedToolNames` 且 Server 已注册时才继续；否则 `FORBIDDEN` 或 `NOT_FOUND`。
- **只读优先：** `readOnly: false` 的工具即使进白名单，Agent 也一律 `FORBIDDEN`（写操作不应由自主 Agent 直调）。

## 验收清单（≥5）

完成本 Lab 后，你应能勾选以下项（与 `npm test` 对齐）：

1. [ ] `listTools` 返回已注册工具及 `readOnly` 标记
2. [ ] Server 对未知工具名 `callTool` → `NOT_FOUND`
3. [ ] 白名单内的 `docs.search` / `orders.get` 可成功返回 mock 结果
4. [ ] 未入白名单的 `docs.search` → `FORBIDDEN`
5. [ ] 白名单包含 `orders.cancel` 时仍因写工具 → `FORBIDDEN`
6. [ ] 白名单含 Server 未注册的 `inventory.sync` → `NOT_FOUND`（扩展：幽灵工具名）

## 与 S9 课的对应

- 工具发现（list）与调用（call）分离，便于审计与缓存 allowlist  
- Agent 默认只读；变更类 Tool 由人审或专用服务承担  
- 单测覆盖拒绝路径，避免把安全策略只写在 System Prompt 里
