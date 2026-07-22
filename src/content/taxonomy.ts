import type { ChapterSeriesId, CourseTrack } from "./types";

export interface TrackMeta {
  id: CourseTrack;
  order: number;
  summary: string;
  focus: string[];
}

export interface ChapterSeriesMeta {
  id: ChapterSeriesId;
  label: string;
  prefix: string;
  summary: string;
}

export const chapterSeries: ChapterSeriesMeta[] = [
  {
    id: "production-ops",
    label: "生产部署与运维",
    prefix: "P",
    summary: "从生产系统地图到四平台日常运维与故障定位。",
  },
];

/** Stable track order for sidebar grouping and resources page. */
export const courseTracks: TrackMeta[] = [
  {
    id: "认知基础",
    order: 1,
    summary: "建立 Agent 工程认知，分清 Chatbot、Workflow 与 Agent 的边界。",
    focus: ["转型动机", "术语", "选型判断", "完成标准"],
  },
  {
    id: "模型与提示",
    order: 2,
    summary: "把自然语言变成可测试的控制面：消息、结构化输出、Prompt 边界。",
    focus: ["LLM API", "Structured Output", "Prompt 模板", "Zod"],
  },
  {
    id: "工具与协议",
    order: 3,
    summary: "用契约约束副作用：Tool Schema、权限、MCP 与可复用工具生态。",
    focus: ["Tool Calling", "Dry Run", "MCP", "权限最小化"],
  },
  {
    id: "知识检索",
    order: 4,
    summary: "让 Agent 拥有私有知识：切块、向量检索、评估与 Agentic RAG。",
    focus: ["Embedding", "Qdrant", "Recall@K", "引用约束"],
  },
  {
    id: "状态编排",
    order: 5,
    summary: "管理记忆、人机协作与多 Agent：状态图、中断恢复与路由。",
    focus: ["Memory", "HITL", "LangGraph", "Supervisor"],
  },
  {
    id: "工程上线",
    order: 6,
    summary: "把 Demo 变成产品：流式 UI、部署、评估、安全与可观测性。",
    focus: ["Streaming", "Tracing", "Guardrails", "成本控制"],
  },
  {
    id: "实战进阶",
    order: 7,
    summary: "用完整项目和长期计划把能力固化成作品集。",
    focus: ["Capstone", "评估集", "学习路线", "公开资源"],
  },
];

export function trackMeta(track: CourseTrack): TrackMeta {
  return courseTracks.find((item) => item.id === track) ?? courseTracks[0];
}
