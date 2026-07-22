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
  relatedLabs: ["lab-l03"],
  sections: [
    {
      id: "why-stream",
      title: "用户感知的不是 token，是可控性",
      blocks: [
        {
          type: "paragraph",
          text: "聊天 Demo 喜欢直接把模型 token 往屏幕上泼。产品级 Agent UI 要回答四个问题：现在在干什么？已经做了什么？还要等多久？我能否取消或确认？资深前端的优势正在这里——你熟悉加载态、乐观更新、错误边界与焦点管理。流式传输只是降低等待焦虑的手段，不是产品本身。把“字蹦出来”当成完成度，会掩盖工具链失败、确认框缺失和取消无效等致命问题。",
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
      id: "when-stream",
      title: "何时用流式 UI，何时不用",
      blocks: [
        {
          type: "paragraph",
          text: "「何时用」流式，看的是用户等待时长与过程是否值得被看见。长回答、多步 Agent、需要中途取消的场景，应流式 + 结构化事件；极短确认（例如“已保存”）、后台批处理、或结果一次性 JSON 弹窗，用非流式反而更简单。「何时不用」还包括：事件协议尚未定稿时——先别接 token 流，否则每个后端改动都会打碎 reducer。",
        },
        {
          type: "table",
          headers: ["场景", "何时用", "何时不用", "风险"],
          rows: [
            ["长文本问答", "首 token 要快，边生成边读", "固定模板两句回复", "仅流式无状态会乱序"],
            ["多工具 Agent", "展示 tool_start/end 与确认", "单步只读查询", "用户不知道机器在干嘛会焦虑"],
            ["可取消任务", "AbortSignal 贯穿 fetch", "提交后不可撤销的支付", "取消后 UI 与后端状态不一致"],
            ["移动端弱网", "断线重连 + runId 重放", "强依赖顺序的音频流", "半包 JSON 需缓冲解析"],
            ["内嵌表格/组件", "事件驱动局部更新", "整页 SSR 静态报告", "把 Markdown 当唯一协议会难测"],
          ],
        },
      ],
    },
    {
      id: "anti-stream",
      title: "反例：只有一个会变长的气泡",
      blocks: [
        {
          type: "callout",
          tone: "warning",
          title: "反例（不要模仿）",
          text: "前端把 SSE 当纯字符串拼接：没有 status、没有 tool 轨迹、取消按钮只 abort 了 fetch 但 UI 仍追加缓存 token；刷新页面后对话上下文丢失；错误时清空用户输入。演示像 ChatGPT 壳，一接真实工具就出现“卡住不动”或“重复提交两次取消”。",
        },
        {
          type: "paragraph",
          text: "反例的根因是把流式当成字符串处理，而不是事件溯源。产品级做法是用纯 reducer 把 AgentEvent 折叠成 AgentViewState，同一 runId 可重放、可测试。Lab L03 故意不连真模型，用 mock 事件序列测 reducer，让你先稳住状态机再接网络。",
        },
      ],
    },
    {
      id: "sse-contract",
      title: "事件协议：比“纯文本流”更重要",
      blocks: [
        {
          type: "paragraph",
          text: "建议后端推送结构化事件（SSE 或 NDJSON），而不是只有 token 字符串。前端用 reducer 消费事件，保证刷新、重连与多标签页行为可预测。取消时必须把 AbortSignal 传到服务端，并停止后续模型与工具调用。协议字段宁少勿乱：每增加一种 ad-hoc 字符串格式，都会在 reducer 里留下永久分支。",
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
          filename: "examples/lab-l03-react-stream/src/reducer.ts",
          code: `/** Pure reducer: one structured event → next UI snapshot. */
export function reduceAgentView(state: AgentViewState, event: AgentEvent): AgentViewState {
  switch (event.type) {
    case "confirm_required":
      return { ...state, status: "awaiting_confirm", pendingConfirm: event.payload };
    case "tool_end":
      return { ...state, status: event.ok ? "planning" : "failed" };
    // ...
  }
}`,
          caption: "Lab 扩展了 awaiting_confirm 与 tool 失败分支，与本章状态图一致。",
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
      id: "stream-failures",
      title: "流式链路失败分类与调试",
      blocks: [
        {
          type: "paragraph",
          text: "Agent 前端的「失败」往往跨网络、解析与状态机三层叠在一起。调试时先区分：是 HTTP 断了、半行 JSON 解析挂了、还是 reducer 把非法事件序列吃进去了。切忌在 catch 里一律 setAnswer('出错了') 并清空输入——那是反模式。应保留用户消息、展示 failure_class、提供重试或编辑后重发。",
        },
        {
          type: "table",
          headers: ["failure_class", "用户可见现象", "调试与修复"],
          rows: [
            ["transport", "一直 planning、无 token", "查 SSE 头、代理缓冲、HTTP/2 中断；确认 signal 已传递"],
            ["parse", "闪一下 failed、控制台 JSON 错", "半包缓冲；非法行跳过+计数；协议版本协商"],
            ["ordering", "工具名出现在答案后面", "事件带序号或阶段锁；token 仅在 streaming 阶段追加"],
            ["cancel_race", "取消后仍追加字", "abort 后忽略后续 onEvent；runId 不匹配丢弃"],
            ["state", "确认框重复弹出", "reducer 幂等；awaiting_confirm 仅由 confirm_required 进入"],
            ["a11y", "读屏未播报完成", "aria-live=polite；状态变化与答案分区播报"],
          ],
        },
        {
          type: "callout",
          tone: "note",
          title: "调试习惯",
          text: "在 dev 环境录制 AgentEvent[] 重放 reducer，比盯着 Network 面板猜顺序快一个数量级。面试提到“如何定位流式 UI bug”时，说出录制重放 + failure_class 表，比只说“看 Chrome DevTools”更有工程感。",
        },
      ],
    },
    {
      id: "interview-stream",
      title: "面试常问：流式与前端状态",
      blocks: [
        {
          type: "table",
          headers: ["追问", "答纲要点"],
          rows: [
            ["为什么不用 WebSocket 而用 SSE？", "单向推送足够；HTTP 基础设施成熟；与 fetch 取消模型一致；双向再升级 WS。"],
            ["AbortSignal 如何贯穿前后端？", "fetch 传 signal；服务端监听断开停止模型；前端 abort 后 reducer 不再消费。"],
            ["刷新后如何恢复？", "runId + 事件检查点或最后快照；勿只靠内存里的 answer 字符串。"],
            ["乐观 UI 在 Agent 里怎么用？", "仅对可撤销操作；工具副作用必须 awaiting_confirm；失败回滚状态。"],
            ["如何测流式 UI？", "mock 事件序列单测 reducer；e2e 测取消与重试；不依赖付费模型。"],
          ],
        },
        {
          type: "paragraph",
          text: "面试追问常落在「可控性」：用户能否理解机器在做什么、能否安全停止、失败后是否还能继续任务。把本章状态图背成自己的话，再结合一个你修过的 parse 或 cancel bug，就是完整回答。",
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
      ],
    },
    {
      id: "lab-stream",
      title: "动手验证",
      blocks: [
        {
          type: "callout",
          tone: "success",
          title: "配套 Lab L03",
          text: "仓库路径 examples/lab-l03-react-stream：用 mock 事件驱动 reduceAgentView，覆盖 tool、确认与失败分支。站点章节 /chapter/lab-l03 与本课状态图对照完成 vitest，再把 readAgentStream 接到你的 Next.js Route Handler。",
        },
        {
          type: "checkpoint",
          title: "上岗自检（流式 UI）",
          criteria: [
            "能说明「何时用 / 何时不用」流式，并指出反例气泡的问题",
            "定义了不少于 5 个 UI 状态，并画过状态图",
            "实现了可取消的流式读取（AbortSignal）",
            "失败能归类 transport / parse / state，并会用事件重放调试",
            "能根据面试表讲清 SSE、取消与刷新恢复",
          ],
        },
      ],
    },
  ],
};
