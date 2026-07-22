import type { Chapter } from "./types";

type PlaceholderDraft = Omit<Chapter, "number">;

/** M2 shipped labs — full entry pages pointing at examples/ packages. */
const labL01: PlaceholderDraft = {
  slug: "lab-l01",
  kind: "lab",
  skills: ["S1"],
  title: "Lab L01：结构化输出与 Prompt 版本回归",
  shortTitle: "L01 结构化输出",
  phase: "实验",
  track: "模型与提示",
  tags: ["Lab", "S1", "Zod", "回归"],
  duration: "45–60 分钟",
  level: "实战",
  goal: "用 Zod 校验模型 JSON，并把 Prompt 版本 hash 与夹具回归绑定，证明 S1 控制面可测。",
  terms: ["Structured Output", "Prompt Version", "Fixture"],
  sections: [
    {
      id: "goal",
      title: "实验目标与能力",
      blocks: [
        {
          type: "paragraph",
          text: "本 Lab 对应能力地图 S1（LLM 控制面）。你要交付的不是“能调一次模型”，而是：输出可解析、失败可分类、Prompt 一改就能触发回归失败。仓库路径：examples/lab-l01-structured-output。",
        },
        {
          type: "callout",
          tone: "note",
          title: "关联课程",
          text: "先读 /chapter/prompt-structured；本实验把课里的 Schema 与版本化要求落成可运行单测。",
        },
      ],
    },
    {
      id: "repo",
      title: "仓库与本地步骤",
      blocks: [
        {
          type: "steps",
          items: [
            {
              title: "安装",
              detail: "cd examples/lab-l01-structured-output && npm install",
            },
            {
              title: "跑 CI 同款单测",
              detail: "npm test —— 全程 mock/夹具，不调用付费模型。",
            },
            {
              title: "可选真跑",
              detail: "若自行接 OpenAI，请放在脚本外，切勿把 Key 写进测试；站点 CI 只认 npm test。",
            },
          ],
        },
        {
          type: "code",
          language: "typescript",
          filename: "examples/lab-l01-structured-output/src/order-schema.ts",
          code: `// 核心：IntentSchema + parseIntentJson —— 非法 JSON / schema 失败必须可区分
import { z } from "zod";

export const IntentSchema = z.object({
  intent: z.enum(["query_status", "cancel", "refund", "other"]),
  orderId: z.string().regex(/^ORD-\\d{6}$/).optional(),
  missingFields: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
});`,
          caption: "完整实现与回归夹具见仓库 README。",
        },
      ],
    },
    {
      id: "accept",
      title: "验收清单",
      blocks: [
        {
          type: "checkpoint",
          title: "Lab L01 验收",
          criteria: [
            "npm test 全绿且无网络/OpenAI 调用",
            "合法 JSON 能通过 IntentSchema",
            "非法 JSON 与 schema 违规返回不同错误类",
            "Prompt hash 变更会使回归夹具失败",
            "README 写清能力 ID S1 与 CI mock 说明",
            "能向面试官口述：为何业务规则不能只放 Prompt",
          ],
        },
      ],
    },
  ],
};

const labL02: PlaceholderDraft = {
  slug: "lab-l02",
  kind: "lab",
  skills: ["S2"],
  title: "Lab L02：订单只读 Tool 契约与非法参数",
  shortTitle: "L02 Tool 契约",
  phase: "实验",
  track: "工具与协议",
  tags: ["Lab", "S2", "Zod", "权限"],
  duration: "45–60 分钟",
  level: "实战",
  goal: "实现只读订单状态 Tool：Schema、角色权限、Dry Run、超时与非法参数错误码齐全。",
  terms: ["Tool Contract", "Dry Run", "Least Privilege"],
  sections: [
    {
      id: "goal",
      title: "实验目标与能力",
      blocks: [
        {
          type: "paragraph",
          text: "对应能力 S2（Tool 契约）。仓库：examples/lab-l02-tool-contract。重点不是“能查单”，而是非法参数、越权、超时各自可测。",
        },
        {
          type: "callout",
          tone: "note",
          title: "关联课程",
          text: "配合 /chapter/tool-calling；课里的坏设计表在本 Lab 变成错误码与单测。",
        },
      ],
    },
    {
      id: "repo",
      title: "仓库与本地步骤",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "安装", detail: "cd examples/lab-l02-tool-contract && npm install" },
            { title: "单测", detail: "npm test —— 纯内存 fake 上游，无 HTTP、无付费 API。" },
            {
              title: "关注点",
              detail: "Agent + dryRun:false → FORBIDDEN；AbortSignal → TIMEOUT；坏 orderId → INVALID_ARGS。",
            },
          ],
        },
        {
          type: "code",
          language: "typescript",
          filename: "examples/lab-l02-tool-contract/src/errors.ts",
          code: `export type ToolErrorCode = "INVALID_ARGS" | "FORBIDDEN" | "TIMEOUT" | "UPSTREAM";
// executeOrderStatus 按角色与 dryRun 分支返回上述错误码`,
          caption: "完整契约见 examples/lab-l02-tool-contract/README.md。",
        },
      ],
    },
    {
      id: "accept",
      title: "验收清单",
      blocks: [
        {
          type: "checkpoint",
          title: "Lab L02 验收",
          criteria: [
            "npm test 全绿",
            "orderId 格式校验失败 → INVALID_ARGS",
            "agent 禁止非 dryRun 写路径 → FORBIDDEN",
            "signal abort → TIMEOUT",
            "成功路径返回稳定 DTO（含 dryRun 标记）",
            "README 含能力 S2 与 ≥5 条验收项",
          ],
        },
      ],
    },
  ],
};

const labL03: PlaceholderDraft = {
  slug: "lab-l03",
  kind: "lab",
  skills: ["S3", "S4"],
  title: "Lab L03：ReAct 与流式事件 UI 契约",
  shortTitle: "L03 ReAct + 流式 UI",
  phase: "实验",
  track: "状态编排",
  tags: ["Lab", "S3", "S4", "SSE", "Reducer"],
  duration: "60 分钟",
  level: "实战",
  goal: "用确定性 mock ReAct 循环产出结构化事件，并用 reducer 证明取消与确认面板顺序。",
  terms: ["ReAct", "AgentEvent", "AbortSignal", "Confirm"],
  sections: [
    {
      id: "goal",
      title: "实验目标与能力",
      blocks: [
        {
          type: "paragraph",
          text: "对应 S3（循环与终止）与 S4（事件协议 / 可取消 / 确认）。仓库：examples/lab-l03-react-stream。不调用真实 LLM，用 runMockReactLoop 固定轨迹。",
        },
        {
          type: "callout",
          tone: "note",
          title: "关联课程",
          text: "配合 /chapter/first-agent 与 /chapter/streaming-ui；把课里的状态图落成可测事件序列。",
        },
      ],
    },
    {
      id: "repo",
      title: "仓库与本地步骤",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "安装", detail: "cd examples/lab-l03-react-stream && npm install" },
            { title: "单测", detail: "npm test —— 覆盖 reducer、确认顺序、取消后不再吐 token。" },
            {
              title: "关注点",
              detail: "副作用工具步骤必须先 confirm_required；AbortSignal 中止后只追加 cancelled。",
            },
          ],
        },
        {
          type: "code",
          language: "typescript",
          filename: "examples/lab-l03-react-stream/src/events.ts",
          code: `export type AgentEvent =
  | { type: "status"; value: string }
  | { type: "tool_start"; name: string }
  | { type: "confirm_required"; action: string }
  | { type: "token"; text: string }
  | { type: "cancelled" }
  | { type: "done"; runId: string };
// 完整联合类型与 reducer 见仓库源码`,
          caption: "详见 examples/lab-l03-react-stream/README.md。",
        },
      ],
    },
    {
      id: "accept",
      title: "验收清单",
      blocks: [
        {
          type: "checkpoint",
          title: "Lab L03 验收",
          criteria: [
            "npm test 全绿且无付费模型",
            "reducer 能累积 token 与 tools 列表",
            "取消后事件流停止且出现 cancelled",
            "副作用步骤先确认再 tool_start",
            "能向面试官画出 ReAct 终止条件",
            "README 含 S3/S4 与 ≥5 条验收",
          ],
        },
      ],
    },
  ],
};

const labL04: PlaceholderDraft = {
  slug: "lab-l04",
  kind: "lab",
  skills: ["S5"],
  title: "Lab L04：RAG 入库与检索评估（Recall@K）",
  shortTitle: "L04 RAG 评估",
  phase: "实验",
  track: "知识检索",
  tags: ["Lab", "S5", "Recall@K", "Chunking"],
  duration: "45–60 分钟",
  level: "实战",
  goal: "用内存语料完成切块与检索，并用 Recall@K 证明检索质量可回归，对应能力 S5。",
  terms: ["Chunking", "Recall@K", "BM25"],
  sections: [
    {
      id: "goal",
      title: "实验目标与能力",
      blocks: [
        {
          type: "paragraph",
          text: "仓库：examples/lab-l04-rag-eval。不接向量云与付费模型；用 fixture + 词项重叠检索验证切块与 Recall@K。",
        },
        {
          type: "callout",
          tone: "note",
          title: "关联课程",
          text: "配合 /chapter/rag；把课里的评估表落成可跑单测。",
        },
      ],
    },
    {
      id: "repo",
      title: "仓库与本地步骤",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "安装", detail: "cd examples/lab-l04-rag-eval && npm install" },
            { title: "单测", detail: "npm test —— 切块边界、排序、recallAtK 数学与金标。" },
          ],
        },
        {
          type: "code",
          language: "typescript",
          filename: "examples/lab-l04-rag-eval/src/metrics.ts",
          code: `export function recallAtK(relevantIds: string[], retrievedIds: string[], k: number): number {
  // 金标为空时约定返回 1；否则 |relevant ∩ topK| / |relevant|
}`,
          caption: "完整实现见 examples/lab-l04-rag-eval。",
        },
      ],
    },
    {
      id: "accept",
      title: "验收清单",
      blocks: [
        {
          type: "checkpoint",
          title: "Lab L04 验收",
          criteria: [
            "npm test 全绿且无网络/OpenAI",
            "切块 id 稳定可复现",
            "金标查询 top-k 含关键 chunk",
            "recallAtK 边界用例正确",
            "README 含能力 S5 与 ≥5 条验收",
          ],
        },
      ],
    },
  ],
};

const labL05: PlaceholderDraft = {
  slug: "lab-l05",
  kind: "lab",
  skills: ["S6", "S7"],
  title: "Lab L05：Checkpoint 与 HITL 邮件确认",
  shortTitle: "L05 Checkpoint + HITL",
  phase: "实验",
  track: "状态编排",
  tags: ["Lab", "S6", "S7", "HITL"],
  duration: "45–60 分钟",
  level: "实战",
  goal: "内存 checkpoint 可恢复；邮件副作用必须经 confirm token，且二次确认幂等。",
  terms: ["Checkpoint", "HITL", "Idempotency"],
  sections: [
    {
      id: "goal",
      title: "实验目标与能力",
      blocks: [
        {
          type: "paragraph",
          text: "仓库：examples/lab-l05-checkpoint-hitl。覆盖 S6 会话恢复与 S7 人工确认；无真实 SMTP。",
        },
        {
          type: "callout",
          tone: "note",
          title: "关联课程",
          text: "配合 /chapter/memory 与 /chapter/human-in-the-loop。",
        },
      ],
    },
    {
      id: "repo",
      title: "仓库与本地步骤",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "安装", detail: "cd examples/lab-l05-checkpoint-hitl && npm install" },
            { title: "单测", detail: "npm test —— save/load、坏 token、reject、二次 confirm 幂等。" },
          ],
        },
        {
          type: "code",
          language: "typescript",
          filename: "examples/lab-l05-checkpoint-hitl/src/hitl.ts",
          code: `// proposeEmailSend → confirm_required + token
// confirm(proposalId, token) 执行一次；错误 token 失败；重复 confirm 幂等`,
          caption: "详见 examples/lab-l05-checkpoint-hitl/README.md。",
        },
      ],
    },
    {
      id: "accept",
      title: "验收清单",
      blocks: [
        {
          type: "checkpoint",
          title: "Lab L05 验收",
          criteria: [
            "npm test 全绿",
            "thread checkpoint 可 save/load",
            "无 token 无法发送",
            "错误 token 不触发副作用",
            "二次 confirm 不重复发送",
            "README 含 S6/S7 与 ≥5 条验收",
          ],
        },
      ],
    },
  ],
};

const labL06: PlaceholderDraft = {
  slug: "lab-l06",
  kind: "lab",
  skills: ["S8"],
  title: "Lab L06：Supervisor 双 Worker 最小权限",
  shortTitle: "L06 Supervisor",
  phase: "实验",
  track: "状态编排",
  tags: ["Lab", "S8", "Supervisor"],
  duration: "45 分钟",
  level: "实战",
  goal: "Supervisor 按意图路由到只读 Worker，白名单外工具一律 FORBIDDEN。",
  terms: ["Supervisor", "Least Privilege", "Routing"],
  sections: [
    {
      id: "goal",
      title: "实验目标与能力",
      blocks: [
        {
          type: "paragraph",
          text: "仓库：examples/lab-l06-supervisor。对应 S8：何时拆 Worker、如何最小权限。",
        },
        {
          type: "callout",
          tone: "note",
          title: "关联课程",
          text: "配合 /chapter/multi-agent。",
        },
      ],
    },
    {
      id: "repo",
      title: "仓库与本地步骤",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "安装", detail: "cd examples/lab-l06-supervisor && npm install" },
            { title: "单测", detail: "npm test —— 路由表、白名单、unknown 拒答。" },
          ],
        },
        {
          type: "code",
          language: "typescript",
          filename: "examples/lab-l06-supervisor/src/supervisor.ts",
          code: `// route(intent) → Worker A/B 或 reject
// run(...) 仅允许 worker.allowedTools 内的工具名`,
          caption: "详见 examples/lab-l06-supervisor/README.md。",
        },
      ],
    },
    {
      id: "accept",
      title: "验收清单",
      blocks: [
        {
          type: "checkpoint",
          title: "Lab L06 验收",
          criteria: [
            "npm test 全绿且无付费模型",
            "order_status 路由到订单 Worker",
            "policy_question 路由到文档 Worker",
            "越权工具 → FORBIDDEN",
            "unknown → reject",
            "README 含 S8 与 ≥5 条验收",
          ],
        },
      ],
    },
  ],
};

const labL07: PlaceholderDraft = {
  slug: "lab-l07",
  kind: "lab",
  skills: ["S9"],
  title: "Lab L07：只读 MCP Server 与白名单 Agent",
  shortTitle: "L07 只读 MCP",
  phase: "实验",
  track: "工具与协议",
  tags: ["Lab", "S9", "MCP", "Allowlist"],
  duration: "45–60 分钟",
  level: "实战",
  goal: "用内存 MCP Server 模拟工具目录，Agent 侧 allowlist + readOnly 双闸门，对应能力 S9。",
  terms: ["MCP", "Allowlist", "Read-only"],
  sections: [
    {
      id: "goal",
      title: "实验目标与能力",
      blocks: [
        {
          type: "paragraph",
          text: "仓库：examples/lab-l07-mcp-whitelist。不接官方 MCP 网络栈；用 InMemoryMcpServer + WhitelistAgent 证明「工具在 Server 注册」与「Agent 能调用」之间必须有一层策略。",
        },
        {
          type: "callout",
          tone: "note",
          title: "关联课程",
          text: "配合 /chapter/mcp-protocol；课里的协议边界在本 Lab 落成 FORBIDDEN / NOT_FOUND 可测错误码。",
        },
      ],
    },
    {
      id: "repo",
      title: "仓库与本地步骤",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "安装", detail: "cd examples/lab-l07-mcp-whitelist && npm install" },
            { title: "单测", detail: "npm test —— allow 只读工具、deny 非白名单与写工具、NOT_FOUND 路径。" },
          ],
        },
        {
          type: "code",
          language: "typescript",
          filename: "examples/lab-l07-mcp-whitelist/src/agent-client.ts",
          code: `// Agent 侧：白名单 + 仅 readOnly 工具可执行
if (!this.allowedToolNames.includes(name)) {
  throw new McpProtocolError(McpErrorCode.FORBIDDEN, \`Tool not on allowlist: \${name}\`);
}
if (!descriptor.readOnly) {
  throw new McpProtocolError(McpErrorCode.FORBIDDEN, \`Write-capable tool blocked\`);
}`,
          caption: "完整 Server / Agent / 夹具见 examples/lab-l07-mcp-whitelist。",
        },
      ],
    },
    {
      id: "accept",
      title: "验收清单",
      blocks: [
        {
          type: "checkpoint",
          title: "Lab L07 验收",
          criteria: [
            "npm test 全绿且无外部 MCP 进程",
            "白名单内只读工具可调用并返回 fixture 结果",
            "非白名单工具 → FORBIDDEN",
            "写工具即使入白名单仍 → FORBIDDEN",
            "Server 未注册工具 → NOT_FOUND",
            "README 含能力 S9 与 ≥5 条验收",
          ],
        },
      ],
    },
  ],
};

const labL08: PlaceholderDraft = {
  slug: "lab-l08",
  kind: "lab",
  skills: ["S10", "S11"],
  title: "Lab L08：轨迹评估、输出护栏与 API 门禁",
  shortTitle: "L08 评估与门禁",
  phase: "实验",
  track: "工程上线",
  tags: ["Lab", "S10", "S11", "Trajectory", "Guardrail"],
  duration: "45–60 分钟",
  level: "实战",
  goal: "离线轨迹断言 + 输出护栏规则 + 最小 API 门禁，证明 S10 可回归、S11 可拦截。",
  terms: ["Trajectory", "Guardrail", "API Gate"],
  sections: [
    {
      id: "goal",
      title: "实验目标与能力",
      blocks: [
        {
          type: "paragraph",
          text: "仓库：examples/lab-l08-eval-guardrail。不调用付费模型；用 AgentStep[] 夹具跑 assertTrajectory、护栏与门禁单测。",
        },
        {
          type: "callout",
          tone: "note",
          title: "关联课程",
          text: "配合 /chapter/eval-security；把课里的评估维度与 API 风险表落成 vitest。",
        },
      ],
    },
    {
      id: "repo",
      title: "仓库与本地步骤",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "安装", detail: "cd examples/lab-l08-eval-guardrail && npm install" },
            { title: "单测", detail: "npm test —— mustIncludeTool / mustNotIncludeTool / maxSteps、护栏与门禁用例。" },
          ],
        },
        {
          type: "code",
          language: "typescript",
          filename: "examples/lab-l08-eval-guardrail/src/trajectory.ts",
          code: `export function assertTrajectory(
  actual: readonly AgentStep[],
  expectedRules: readonly TrajectoryRule[],
): void {
  // 违反 mustIncludeTool / mustNotIncludeTool / maxSteps → TrajectoryAssertionError
}`,
          caption: "护栏与 API 门禁模块见同仓库 src/ 与 README。",
        },
      ],
    },
    {
      id: "accept",
      title: "验收清单",
      blocks: [
        {
          type: "checkpoint",
          title: "Lab L08 验收",
          criteria: [
            "npm test 全绿且无付费 Provider",
            "轨迹规则违规可抛出并列出 violations",
            "输出护栏拦截注入样例或敏感模式",
            "API 门禁拒绝未授权或超限请求",
            "README 含 S10/S11 与 ≥5 条验收",
            "能向面试官说明轨迹断言与端到端 eval 的分工",
          ],
        },
      ],
    },
  ],
};

const electiveE1: PlaceholderDraft = {
  slug: "elective-e1",
  kind: "elective",
  skills: ["E1"],
  title: "选修：Agent 网关与策略（allow/deny/审批）",
  shortTitle: "E1 网关策略",
  phase: "选修",
  track: "工程上线",
  tags: ["选修", "E1", "Gateway", "Policy"],
  duration: "约 40 分钟",
  level: "工程化",
  goal: "在模型与工具之间落地统一网关：allow/deny、审批与审计，而不是把策略散落在各 Tool 里。",
  terms: ["Gateway", "Allow/Deny", "Approval"],
  sections: [
    {
      id: "background",
      title: "问题背景",
      blocks: [
        {
          type: "paragraph",
          text: "主线 S2/S9 教的是单进程内的 Tool 契约与 MCP 白名单；上线后往往有数十个 Agent、多个 MCP Server 与内部 API。若没有统一网关，每个团队各自做 allowlist，就会出现「同一写操作有的路径要审批、有的不要」的灰区。Agent 网关把「谁能调什么、何时必须人工批、如何记审计」收成一条策略链，是 E1 能力地图的核心。",
        },
      ],
    },
    {
      id: "diff",
      title: "与主线差异",
      blocks: [
        {
          type: "table",
          headers: ["维度", "主线（S2/S9/L07）", "选修 E1"],
          rows: [
            ["策略位置", "Agent 进程内 WhitelistAgent", "独立网关 / sidecar，多租户策略源"],
            ["审批", "HITL 中断（S7）针对单次副作用", "网关级 approval workflow，可跨服务"],
            ["审计", "单应用日志", "统一 requestId、策略版本、决策原因码"],
            ["失败语义", "FORBIDDEN / NOT_FOUND", "再加 RATE_LIMIT、PENDING_APPROVAL"],
          ],
        },
      ],
    },
    {
      id: "architecture",
      title: "参考架构",
      blocks: [
        {
          type: "diagram",
          title: "Agent 网关策略链",
          chart: `flowchart LR
  A[Agent Runtime] --> G[Policy Gateway]
  G -->|allow| T[Tool / MCP]
  G -->|deny| X[403 + reason]
  G -->|needs approval| H[HITL Queue]
  H -->|approved| T
  G --> L[(Audit Log)]`,
        },
      ],
    },
    {
      id: "when",
      title: "何时用 / 何时不用",
      blocks: [
        {
          type: "bullets",
          items: [
            "何时用：多团队共用工具目录、写操作必须可审计、策略要独立于模型 Prompt 发版。",
            "何时不用：单体 demo、工具 <5 且全只读——先完成 L07 白名单即可，不必上独立网关集群。",
          ],
        },
      ],
    },
    {
      id: "example",
      title: "最小示例",
      blocks: [
        {
          type: "code",
          language: "typescript",
          filename: "policy-gateway-sketch.ts",
          code: `type Decision = "allow" | "deny" | "approval_required";

function evaluate(tool: string, tenant: string, risk: "read" | "write"): Decision {
  if (!tenantPolicy[tenant]?.allowedTools.includes(tool)) return "deny";
  if (risk === "write") return "approval_required";
  return "allow";
}`,
          caption: "生产应外置策略存储（OPA / 自建表）并版本化；此处仅说明决策三分支。",
        },
      ],
    },
    {
      id: "interview",
      title: "面试追问",
      blocks: [
        {
          type: "table",
          headers: ["追问", "答纲"],
          rows: [
            ["网关和 API Gateway 有何不同？", "Agent 网关理解 tool 名、风险标签、会话 thread；HTTP 网关只看 path/method。"],
            ["审批超时怎么处理？", "PENDING_APPROVAL 状态 + TTL；超时 deny 或降级只读，并写审计。"],
            ["策略变更如何不影响在途请求？", "绑定 policyVersion；在途用旧版，新会话拉新版。"],
          ],
        },
        {
          type: "paragraph",
          text: "面试常把 E1 与 S7 HITL 连着问：网关负责「默认拒绝 + 路由到审批」，图内 interrupt 负责「展示载荷与 resume」。",
        },
      ],
    },
    {
      id: "accept",
      title: "验收",
      blocks: [
        {
          type: "checkpoint",
          title: "E1 选修验收",
          criteria: [
            "能画出 Agent → 网关 → Tool 三层并标出审计落点",
            "能说明 allow / deny / approval_required 各自 HTTP/错误码约定",
            "能对比 L07 进程内白名单与网关化的边界",
            "能根据面试表讲清策略版本与在途请求",
            "能举一例「写工具必须审批」的端到端故事（含 runId）",
          ],
        },
      ],
    },
  ],
};

const electiveE2: PlaceholderDraft = {
  slug: "elective-e2",
  kind: "elective",
  skills: ["E2"],
  title: "选修：多租户与数据面隔离",
  shortTitle: "E2 多租户隔离",
  phase: "选修",
  track: "工程上线",
  tags: ["选修", "E2", "Multi-tenant", "Isolation"],
  duration: "约 40 分钟",
  level: "工程化",
  goal: "讲清控制面租户身份如何贯穿 RAG、记忆与 Tool，避免数据面串租。",
  terms: ["Tenant ID", "Row-level security", "Data plane"],
  sections: [
    {
      id: "background",
      title: "问题背景",
      blocks: [
        {
          type: "paragraph",
          text: "主线 S5/S6 在单租户假设下讲 RAG 与 Checkpoint。SaaS 或企业内部平台一旦多客户共用向量库、文档桶与订单 API，任何「忘记带 tenant_id 的 filter」都是 P0 事故。E2 要求你能设计：身份从网关进、存储层强制隔离、Agent 工具参数不可被模型篡改租户字段。",
        },
      ],
    },
    {
      id: "diff",
      title: "与主线差异",
      blocks: [
        {
          type: "table",
          headers: ["维度", "主线", "选修 E2"],
          rows: [
            ["检索", "单 corpus Recall@K（L04）", "每租户 collection + 强制 filter"],
            ["记忆", "thread_id 会话（S6）", "thread 绑定 tenant + user，Store 分区"],
            ["工具", "Zod 校验参数形状（S2）", "宿主注入 tenant，模型不可提交 tenantId"],
            ["观测", "单应用 trace", "租户维度配额、成本与异常告警"],
          ],
        },
      ],
    },
    {
      id: "architecture",
      title: "参考架构",
      blocks: [
        {
          type: "diagram",
          title: "租户上下文贯穿",
          chart: `flowchart TB
  subgraph control [Control Plane]
    Auth[JWT / API Key]
    Ctx[tenant_id + user_id]
  end
  subgraph data [Data Plane]
    V[(Vector per tenant)]
    D[(Docs bucket prefix)]
    API[Internal APIs]
  end
  Auth --> Ctx
  Ctx --> Agent
  Agent --> V
  Agent --> D
  Agent --> API`,
        },
      ],
    },
    {
      id: "when",
      title: "何时用 / 何时不用",
      blocks: [
        {
          type: "bullets",
          items: [
            "何时用：B2B 多客户、同一集群托管多家业务线、合规要求数据不可混放。",
            "何时不用：个人学习项目、单企业单实例且无外售——thread 级隔离足够，勿过早拆库。",
          ],
        },
      ],
    },
    {
      id: "example",
      title: "阅读路径",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "对照 L04", detail: "在检索函数签名增加 tenantId，单测证明跨租户 query 拿不到他人 chunk。" },
            { title: "对照 S6", detail: "checkpoint key = tenant:thread，恢复时校验 JWT tenant 一致。" },
            { title: "对照 L02", detail: "订单 Tool 由服务端从 ctx 取 tenant，Zod schema 不接受 tenantId 字段。" },
          ],
        },
      ],
    },
    {
      id: "interview",
      title: "面试追问",
      blocks: [
        {
          type: "table",
          headers: ["追问", "答纲"],
          rows: [
            ["向量库如何防串租？", "collection 隔离或 metadata filter 强制；查询构造在可信层，不信模型拼 filter。"],
            ["Agent 被注入「忽略租户」怎么办？", "系统 prompt 不足；依赖宿主注入 + DB RLS + 出站 API 二次校验。"],
            ["共享文档与私有文档如何共存？", "标签 + ACL；检索前 resolve 可见集，结果带 source 供审计。"],
          ],
        },
      ],
    },
    {
      id: "accept",
      title: "验收",
      blocks: [
        {
          type: "checkpoint",
          title: "E2 选修验收",
          criteria: [
            "能画出 tenant 从认证到存储的三跳路径",
            "能举一例「模型篡改 tenant 字段」的防御",
            "能说明向量与对象存储两种隔离策略取舍",
            "能根据面试表讲清 RLS 与 Agent 层分工",
            "能指出主线哪两章最易漏 tenant（RAG / 记忆）",
          ],
        },
      ],
    },
  ],
};

const electiveE3: PlaceholderDraft = {
  slug: "elective-e3",
  kind: "elective",
  skills: ["E3"],
  title: "选修：长任务队列 / Worker / 可恢复运行时",
  shortTitle: "E3 长任务运行时",
  phase: "选修",
  track: "工程上线",
  tags: ["选修", "E3", "Queue", "Worker"],
  duration: "约 40 分钟",
  level: "工程化",
  goal: "把超过 HTTP 超时的 Agent 运行迁到队列 + Worker，并支持崩溃恢复与幂等重试。",
  terms: ["Job Queue", "Worker", "Checkpoint"],
  sections: [
    {
      id: "background",
      title: "问题背景",
      blocks: [
        {
          type: "paragraph",
          text: "主线 S4 流式 UI 与 S6 Checkpoint 假设运行多半在单进程、用户仍在线。真实场景里：批量评测、长文档入库、多步研究任务会跑数分钟；进程会被 deploy 打断，用户会关浏览器。E3 要求你把「一次 Agent 运行」建模为可入队、可观测、可从中断点继续的 Job，而不是无限拉长 HTTP SSE。",
        },
      ],
    },
    {
      id: "diff",
      title: "与主线差异",
      blocks: [
        {
          type: "bullets",
          items: [
            "S6：内存/图内 checkpoint，偏会话恢复；E3：跨进程持久化 job state + lease。",
            "S4：前端订阅事件；E3：Worker 写进度表，前端轮询或 Webhook。",
            "L05：HITL 邮件确认；E3：审批也可异步，Job 状态机进入 awaiting_human。",
          ],
        },
      ],
    },
    {
      id: "architecture",
      title: "参考架构",
      blocks: [
        {
          type: "diagram",
          title: "Job 状态机",
          chart: `stateDiagram-v2
  [*] --> queued
  queued --> running: worker lease
  running --> paused: checkpoint
  paused --> running: resume
  running --> awaiting_human: HITL
  awaiting_human --> running: approved
  running --> succeeded
  running --> failed: retryable
  failed --> queued: backoff
  succeeded --> [*]`,
        },
      ],
    },
    {
      id: "when",
      title: "何时用 / 何时不用",
      blocks: [
        {
          type: "bullets",
          items: [
            "何时用：运行 >60s、需水平扩展 Worker、部署不能杀光在途任务。",
            "何时不用：交互式客服一轮 <30s——同步流式 + 轻量 checkpoint 更简单。",
          ],
        },
      ],
    },
    {
      id: "example",
      title: "最小示例",
      blocks: [
        {
          type: "code",
          language: "typescript",
          filename: "job-worker-sketch.ts",
          code: `type JobRecord = { id: string; state: string; checkpoint: unknown; leaseUntil: number };

async function workerLoop(pick: () => Promise<JobRecord | null>) {
  const job = await pick();
  if (!job) return;
  // 续 lease → 执行一步 Agent → 写 checkpoint → 更新 state
}`,
          caption: "生产需 idempotencyKey、死信队列与 metrics；此处强调 lease + checkpoint 循环。",
        },
      ],
    },
    {
      id: "interview",
      title: "面试追问",
      blocks: [
        {
          type: "table",
          headers: ["追问", "答纲"],
          rows: [
            ["Worker 重复消费同一 Job 怎么办？", "lease + 幂等副作用键；工具写操作带 idempotencyKey。"],
            ["checkpoint 存什么粒度？", "图节点 + channel 值 + 外部副作用 proposal 状态，不存整段聊天冗余。"],
            ["用户取消如何传播？", "cancel flag 写 Job；Worker 在 tool 边界检查并转 cancelled。"],
          ],
        },
      ],
    },
    {
      id: "accept",
      title: "验收",
      blocks: [
        {
          type: "checkpoint",
          title: "E3 选修验收",
          criteria: [
            "能画出 queued → running → succeeded 与失败重试",
            "能说明 lease 与 at-least-once 语义",
            "能对比 S6 thread checkpoint 与 Job checkpoint",
            "能根据面试表讲清取消与 HITL 挂起",
            "能举部署滚动时如何不丢在途任务",
          ],
        },
      ],
    },
  ],
};

const electiveE4: PlaceholderDraft = {
  slug: "elective-e4",
  kind: "elective",
  skills: ["E4"],
  title: "选修：评估平台与回归门禁",
  shortTitle: "E4 评估平台",
  phase: "选修",
  track: "工程上线",
  tags: ["选修", "E4", "Eval", "CI Gate"],
  duration: "约 40 分钟",
  level: "工程化",
  goal: "把 L08 单仓库断言扩展为可版本化的评估集、报告与合并前门禁。",
  terms: ["Eval Set", "Regression Gate", "Trajectory"],
  sections: [
    {
      id: "background",
      title: "问题背景",
      blocks: [
        {
          type: "paragraph",
          text: "主线 S10 与 L08 教的是「单测级」轨迹与护栏。团队一旦多人改 Prompt、换模型、加 Tool，需要平台化：黄金集版本、历史分数曲线、PR 上自动跑 eval 并阻断回退。E4 不是再写一个 assert，而是数据集、运行器、报告与门禁策略的产品化。",
        },
      ],
    },
    {
      id: "diff",
      title: "与主线差异",
      blocks: [
        {
          type: "table",
          headers: ["维度", "L08 / S10", "选修 E4"],
          rows: [
            ["范围", "单包 vitest", "多场景数据集 + 环境矩阵"],
            ["触发", "本地 npm test", "PR / nightly / 发版前全量"],
            ["输出", "pass/fail", "分数、diff、样例链接、负责人通知"],
            ["成本", "零模型费夹具", "抽样真模型 + 离线为主的分层策略"],
          ],
        },
      ],
    },
    {
      id: "architecture",
      title: "参考架构",
      blocks: [
        {
          type: "diagram",
          title: "评估流水线",
          chart: `flowchart LR
  DS[(Eval Set v3)] --> R[Runner]
  R --> T[Trajectory / Output checks]
  T --> REP[Report + scores]
  REP --> G{Gate}
  G -->|pass| MERGE[Allow merge]
  G -->|fail| BLOCK[Block + notify]`,
        },
      ],
    },
    {
      id: "when",
      title: "何时用 / 何时不用",
      blocks: [
        {
          type: "bullets",
          items: [
            "何时用：Prompt/模型周更、需证明「比上周更好」、合规要留评估记录。",
            "何时不用：个人练手、尚无稳定黄金集——先把 L08 夹具写满再谈平台。",
          ],
        },
      ],
    },
    {
      id: "example",
      title: "阅读路径",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "从 L08 出发", detail: "把 TrajectoryRule 抽成数据集 YAML，一条 case 一个 expectedRules。" },
            { title: "门禁策略", detail: "定义 hard fail（mustNotIncludeTool）与 soft warn（分数降 2%）。" },
            { title: "CI 集成", detail: "PR 跑子集、main 跑全量；报告 artifact 上传供复盘。" },
          ],
        },
      ],
    },
    {
      id: "interview",
      title: "面试追问",
      blocks: [
        {
          type: "table",
          headers: ["追问", "答纲"],
          rows: [
            ["如何避免 eval 过拟合？", "hold-out 集、定期人工抽检、变体 paraphrase。"],
            ["真模型 eval 太贵怎么办？", "分层：夹具全跑 + 抽样 smoke；缓存相同输入。"],
            ["轨迹断言和最终答案分哪个优先？", "高风险动作用轨迹 hard gate；开放式问答用 rubric + 人工复核。"],
          ],
        },
      ],
    },
    {
      id: "accept",
      title: "验收",
      blocks: [
        {
          type: "checkpoint",
          title: "E4 选修验收",
          criteria: [
            "能说明数据集版本与代码版本如何绑定报告",
            "能设计 PR 门禁 hard/soft 两类规则",
            "能对比 L08 单测与平台 runner 的职责",
            "能根据面试表讲清成本与分层评估",
            "能举一次「Prompt 改坏被门禁拦住」的复盘结构",
          ],
        },
      ],
    },
  ],
};

const electiveE5: PlaceholderDraft = {
  slug: "elective-e5",
  kind: "elective",
  skills: ["E5"],
  title: "选修：A2A / 多运行时协作边界",
  shortTitle: "E5 A2A 协作",
  phase: "选修",
  track: "工程上线",
  tags: ["选修", "E5", "A2A", "Multi-runtime"],
  duration: "约 40 分钟",
  level: "工程化",
  goal: "界定 Agent-to-Agent 与跨运行时调用的信任边界，避免多 Agent 变成分布式泥球。",
  terms: ["A2A", "Trust boundary", "Capability token"],
  sections: [
    {
      id: "background",
      title: "问题背景",
      blocks: [
        {
          type: "paragraph",
          text: "主线 S8/L06 在同一进程内用 Supervisor 路由 Worker。当「财务 Agent」跑在 Python、「客服 Agent」跑在 Node、外部伙伴提供标准化 A2A 端点时，问题变成：谁证明身份、能力如何委托、消息是否可重放、失败如何部分补偿。E5 面向这种跨边界协作，而不是再叠一层 prompt 角色扮演。",
        },
      ],
    },
    {
      id: "diff",
      title: "与主线差异",
      blocks: [
        {
          type: "table",
          headers: ["维度", "S8 Supervisor", "选修 E5"],
          rows: [
            ["通信", "函数调用 / 共享内存", "HTTP/gRPC/A2A 消息，序列化契约"],
            ["权限", "白名单工具名", "能力令牌、scope、时效、可撤销"],
            ["状态", "单图 checkpoint", "跨运行时 correlation id + 幂等 inbox"],
            ["观测", "单 trace", "分布式 trace + 跨方审计对齐"],
          ],
        },
      ],
    },
    {
      id: "architecture",
      title: "参考架构",
      blocks: [
        {
          type: "diagram",
          title: "跨运行时委托",
          chart: `flowchart LR
  A[Runtime A Supervisor] -->|A2A + capability token| B[Runtime B Specialist]
  B --> T[B-local Tools]
  A --> L[(Correlation / Audit)]
  B --> L`,
        },
      ],
    },
    {
      id: "when",
      title: "何时用 / 何时不用",
      blocks: [
        {
          type: "bullets",
          items: [
            "何时用：异构栈、组织边界清晰、专家 Agent 由别团队运维。",
            "何时不用：全在同一 LangGraph 进程——L06 路由更简单、可测性更高。",
          ],
        },
      ],
    },
    {
      id: "example",
      title: "最小示例",
      blocks: [
        {
          type: "code",
          language: "typescript",
          filename: "a2a-delegate-sketch.ts",
          code: `type A2ARequest = {
  correlationId: string;
  capability: "orders.read";
  payload: unknown;
  proof: string; // 短期 capability token
};

// 接收方：验 token → 映射本地 tool → 返回结构化结果 + 同一 correlationId`,
          caption: "协议细节随 A2A/ACP 等标准演进；重点是 trust boundary 与幂等。",
        },
      ],
    },
    {
      id: "interview",
      title: "面试追问",
      blocks: [
        {
          type: "table",
          headers: ["追问", "答纲"],
          rows: [
            ["A2A 和多 Agent prompt 分工有何不同？", "A2A 是机器契约 + 权限；prompt 分工无法审计与限权。"],
            ["如何防止 Agent 链式越权？", "能力令牌 scope 最小化、不可转发、短 TTL。"],
            ["一方超时另一方怎么办？", "correlationId 标记 partial；补偿或 saga 由编排层负责。"],
          ],
        },
      ],
    },
    {
      id: "accept",
      title: "验收",
      blocks: [
        {
          type: "checkpoint",
          title: "E5 选修验收",
          criteria: [
            "能对比 L06 进程内路由与 A2A 的适用场景",
            "能画出 capability token 生命周期",
            "能说明 correlationId 在分布式 trace 中的作用",
            "能根据面试表讲清越权与超时",
            "能举一例「不应 A2A、应合并图」的反例",
          ],
        },
      ],
    },
  ],
};

/** Lab entries: L01–L08 shipped; electives E1–E5 are full chapters (M4). */
export const labPlaceholders: PlaceholderDraft[] = [
  labL01,
  labL02,
  labL03,
  labL04,
  labL05,
  labL06,
  labL07,
  labL08,
];

export const electivePlaceholders: PlaceholderDraft[] = [
  electiveE1,
  electiveE2,
  electiveE3,
  electiveE4,
  electiveE5,
];
