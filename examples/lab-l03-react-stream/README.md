# Lab L03：ReAct 与流式事件 UI 契约

独立 npm 子包，对应课程能力 **S3（ReAct / 状态图）** 与 **S4（流式交互与 Agent 前端状态）**。不依赖 LangChain，不调用任何付费模型 API，适合 CI 与本地离线练习。

## 目标

- 用 **结构化 `AgentEvent`** 描述一次 Agent 运行的可见轨迹（规划、工具、确认、token、结束、取消、错误）。
- 用 **`reduceAgentView`** 把事件流折叠成可渲染的 UI 状态（`status`、`answer`、`tools[]`、`pendingConfirm?`）。
- 用 **`runMockReactLoop`** 在测试中模拟确定性 ReAct 步进，验证取消与确认顺序等产品规则。

## 目录

| 文件 | 说明 |
|------|------|
| `src/events.ts` | `AgentEvent` 联合类型 |
| `src/reducer.ts` | `reduceAgentView(state, event)` |
| `src/mock-loop.ts` | `runMockReactLoop({ steps, signal? })` |

## 本地运行

```bash
cd examples/lab-l03-react-stream
npm install
npm test
```

可选类型检查：`npm run build`

## CI / Mock 说明

- `npm test` 仅运行 Vitest，**不访问网络、不使用 API Key**。
- `runMockReactLoop` 按 `steps` 逐步产出事件；传入已 `abort` 的 `AbortSignal` 时只追加 `cancelled` 并停止，**不再产出后续 token**。
- 副作用类工具使用 `tool_side_effect` 步骤：先 `confirm_required`，再 `tool_start` / `tool_end`。

## 与课内契约的关系

- 事件形态与站点课「流式 UI」中的 reducer 示例一致，并扩展 `confirm_required`、`cancelled`。
- 前端应把 `AbortController.signal` 传到真实 SSE 请求；本 Lab 用 mock 循环演练同一契约。

## 验收清单（≥5）

1. 能说出 `AgentEvent` 至少 5 种 `type` 及各自用途。
2. 能画出 `idle → planning → tool → streaming → idle` 的主路径（含 `awaiting_confirm` 分支）。
3. `reduceAgentView` 在 `confirm_required` 后进入 `awaiting_confirm`，且 `tool_start` 会清空 `pendingConfirm`。
4. `runMockReactLoop` 对 `tool_side_effect` 保证 **`confirm_required` 紧挨在 `tool_start` 之前**。
5. 取消运行后事件流以 `cancelled` 结束，且 **cancel 之后不再出现 `token` 或 `done`**。
6. 本目录 `npm test` 全部通过（可作为 CI `test:examples` 的一环）。

## 关联课程

- 站点章节：`react-agent`（S3）、`streaming-ui`（S4）
- 仓库路径：`examples/lab-l03-react-stream/`
