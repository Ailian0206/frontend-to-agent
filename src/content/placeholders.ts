import type { Chapter, CourseTrack, SkillId } from "./types";

type PlaceholderDraft = Omit<Chapter, "number">;

/** Shared stub body for navigation-only Lab / elective entries until later milestones. */
function comingSoonSections(label: string) {
  return [
    {
      id: "coming-soon",
      title: "后续里程碑交付",
      blocks: [
        {
          type: "callout" as const,
          tone: "note" as const,
          title: "当前为导航占位",
          text: `${label}将在后续里程碑提供可运行仓库与完整正文；当前可先学习侧栏中关联的课程，并通过能力地图核对目标技能。`,
        },
        {
          type: "paragraph" as const,
          text: "站点已保证结构可导航：能力 ID、章节分组与学习路径清晰。真正的验收清单与示例代码会在对应 Lab / 选修里程碑落地。",
        },
      ],
    },
  ];
}

function labStub(
  slug: string,
  shortTitle: string,
  title: string,
  skills: SkillId[],
  track: CourseTrack,
): PlaceholderDraft {
  return {
    slug,
    kind: "lab",
    skills,
    comingSoon: true,
    title,
    shortTitle,
    phase: "实验占位",
    track,
    tags: ["Lab", "即将上线", ...skills],
    duration: "待定",
    level: "实战",
    goal: `${title}（后续里程碑实现，当前为导航占位）`,
    terms: skills,
    sections: comingSoonSections(title),
  };
}

function elective(
  slug: string,
  shortTitle: string,
  title: string,
  skills: SkillId[],
): PlaceholderDraft {
  return {
    slug,
    kind: "elective",
    skills,
    comingSoon: true,
    title,
    shortTitle,
    phase: "选修占位",
    track: "工程上线",
    tags: ["选修", "即将上线", ...skills],
    duration: "待定",
    level: "工程化",
    goal: `${title}（后续里程碑成文，当前为导航占位）`,
    terms: skills,
    sections: comingSoonSections(title),
  };
}

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

/** Lab entries: L01–L03 shipped in M2; L04–L08 remain stubs. */
export const labPlaceholders: PlaceholderDraft[] = [
  labL01,
  labL02,
  labL03,
  labStub("lab-l04", "L04 RAG 评估", "Lab L04：RAG 入库与检索评估（Recall@K）", ["S5"], "知识检索"),
  labStub("lab-l05", "L05 Checkpoint + HITL", "Lab L05：Checkpoint 与 HITL 邮件确认", ["S6", "S7"], "状态编排"),
  labStub("lab-l06", "L06 Supervisor", "Lab L06：Supervisor 双 Worker 最小权限", ["S8"], "状态编排"),
  labStub("lab-l07", "L07 只读 MCP", "Lab L07：只读 MCP Server 与白名单 Agent", ["S9"], "工具与协议"),
  labStub("lab-l08", "L08 评估与门禁", "Lab L08：轨迹评估、输出护栏与 API 门禁", ["S10", "S11"], "工程上线"),
];

export const electivePlaceholders: PlaceholderDraft[] = [
  elective("elective-e1", "E1 网关策略", "选修：Agent 网关与策略（allow/deny/审批）", ["E1"]),
  elective("elective-e2", "E2 多租户隔离", "选修：多租户与数据面隔离", ["E2"]),
  elective("elective-e3", "E3 长任务运行时", "选修：长任务队列 / Worker / 可恢复运行时", ["E3"]),
  elective("elective-e4", "E4 评估平台", "选修：评估平台与回归门禁", ["E4"]),
  elective("elective-e5", "E5 A2A 协作", "选修：A2A / 多运行时协作边界", ["E5"]),
];
