import type { Chapter } from "../types";

/** Streaming UX and frontend state for agent products. */
export const streamingUiChapter: Omit<Chapter, "number"> = {
  slug: "streaming-ui",
  kind: "lesson",
  skills: ["S4"],
  title: "流式交互与 Agent 前端状态",
  shortTitle: "流式 UI 与前端状态",
  phase: "把过程变成体验",
  track: "工程上线",
  tags: ["SSE", "Streaming", "UX", "AbortSignal"],
  duration: "75 分钟",
  level: "进阶",
  goal: "把 Agent 的规划、工具调用与部分结果映射为稳定的前端状态机，而不是一个无限变长的气泡。",
  dependencies: ["Next.js App Router", "fetch + ReadableStream", "AbortController"],
  terms: ["SSE", "NDJSON", "Optimistic UI", "Run State", "Cancellation"],
  relatedResources: ["hi-agent", "awesome-agentic-engineering", "langchain-js-docs"],
  sections: [
    {
      id: "why-stream",
      title: "用户感知的不是 token，是可控性",
      blocks: [
        {
          type: "paragraph",
          text: "聊天 Demo 喜欢直接把模型 token 往屏幕上泼。产品级 Agent UI 要回答四个问题：现在在干什么？已经做了什么？还要等多久？我能否取消或确认？资深前端的优势正在这里——你熟悉加载态、乐观更新、错误边界与焦点管理。流式传输只是降低等待焦虑的手段，不是产品本身。",
        },
        {
          type: "table",
          headers: ["状态", "用户看到什么", "前端职责"],
          rows: [
            ["idle", "可输入", "清空临时错误，启用发送"],
            ["planning", "正在理解目标", "显示简短状态，不可重复提交"],
            ["tool", "正在调用某工具", "展示工具名与安全摘要，隐藏密钥"],
            ["awaiting_confirm", "需要确认副作用", "结构化确认面板，明确影响范围"],
            ["streaming", "部分回答出现", "追加文本，保持可滚动与可中断"],
            ["failed", "可重试错误", "保留输入，给出下一步建议"],
          ],
        },
        {
          type: "diagram",
          title: "Agent UI 状态流",
          chart: `stateDiagram-v2
  [*] --> idle
  idle --> planning: send
  planning --> tool: tool_call
  tool --> planning: tool_result
  planning --> awaiting_confirm: needs_approval
  awaiting_confirm --> tool: approved
  awaiting_confirm --> idle: rejected
  planning --> streaming: final_tokens
  streaming --> idle: done
  planning --> failed: error
  tool --> failed: error
  failed --> idle: retry_or_edit`,
        },
      ],
    },
    {
      id: "sse-contract",
      title: "事件协议：比“纯文本流”更重要",
      blocks: [
        {
          type: "paragraph",
          text: "建议后端推送结构化事件（SSE 或 NDJSON），而不是只有 token 字符串。前端用 reducer 消费事件，保证刷新、重连与多标签页行为可预测。取消时必须把 AbortSignal 传到服务端，并停止后续模型与工具调用。",
        },
        {
          type: "code",
          language: "typescript",
          filename: "src/agent-events.ts",
          code: `export type AgentEvent =
  | { type: "status"; value: "planning" | "tool" | "streaming" }
  | { type: "tool_start"; name: string; argsSummary: string }
  | { type: "tool_end"; name: string; ok: boolean }
  | { type: "token"; text: string }
  | { type: "error"; message: string }
  | { type: "done"; runId: string };

export function reduceAgentView(
  state: { status: string; answer: string; tools: string[] },
  event: AgentEvent,
) {
  switch (event.type) {
    case "status":
      return { ...state, status: event.value };
    case "tool_start":
      return { ...state, status: "tool", tools: [...state.tools, event.name] };
    case "token":
      return { ...state, status: "streaming", answer: state.answer + event.text };
    case "error":
      return { ...state, status: "failed" };
    case "done":
      return { ...state, status: "idle" };
    default:
      return state;
  }
}`,
        },
        {
          type: "code",
          language: "typescript",
          filename: "app/chat/useAgentStream.ts",
          code: `export async function readAgentStream(
  response: Response,
  onEvent: (event: AgentEvent) => void,
  signal: AbortSignal,
) {
  if (!response.body) throw new Error("Missing response body");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (!signal.aborted) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\\n");
    buffer = chunks.pop() ?? "";
    for (const line of chunks) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      onEvent(JSON.parse(payload) as AgentEvent);
    }
  }
}`,
          output: `验证：发送后应先看到 status=planning，再可能出现 tool_start，最后 token 追加。
点击取消后网络请求中断，且不再追加 token。`,
        },
      ],
    },
    {
      id: "product-rules",
      title: "产品规则清单",
      blocks: [
        {
          type: "bullets",
          items: [
            "禁止用假进度条伪装模型思考；只展示真实事件。",
            "高风险工具必须走确认面板，确认内容来自服务端结构化提案。",
            "同一 runId 的事件可重放；刷新后能恢复到最近检查点。",
            "移动端优先保证输入框不被键盘遮挡，长轨迹可折叠。",
            "无障碍：状态变化用 aria-live，确认对话框可键盘操作。",
          ],
        },
        {
          type: "checkpoint",
          title: "本章自检",
          criteria: [
            "定义了不少于 5 个 UI 状态，并画过状态图",
            "实现了可取消的流式读取（AbortSignal）",
            "工具调用在 UI 上可解释，且不泄露密钥/PII",
            "失败后用户输入仍在，可一键重试",
          ],
        },
      ],
    },
  ],
};
