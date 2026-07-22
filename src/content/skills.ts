import type { SkillId } from "./types";

export type SkillGroup = "core" | "elective";

/** Single source for JD-aligned skill map shown on /skills and chapter badges. */
export interface SkillDefinition {
  id: SkillId;
  title: string;
  /** What the learner must be able to demonstrate. */
  proof: string;
  group: SkillGroup;
}

export const skillMap: SkillDefinition[] = [
  {
    id: "S1",
    title: "LLM 控制面",
    proof: "结构化输出、Prompt 版本化、边界不进业务代码",
    group: "core",
  },
  {
    id: "S2",
    title: "Tool 契约",
    proof: "Schema、权限、超时、幂等、Dry Run",
    group: "core",
  },
  {
    id: "S3",
    title: "ReAct / 状态图",
    proof: "能画清循环与终止条件，能用 LangGraph 表达",
    group: "core",
  },
  {
    id: "S4",
    title: "流式与 Agent UI",
    proof: "事件协议、可取消、确认面板，不只吐 token",
    group: "core",
  },
  {
    id: "S5",
    title: "RAG 工程化",
    proof: "切块、权限过滤、Recall@K、引用与拒答",
    group: "core",
  },
  {
    id: "S6",
    title: "记忆与隔离",
    proof: "thread/checkpoint、跨会话事实、租户隔离意识",
    group: "core",
  },
  {
    id: "S7",
    title: "HITL",
    proof: "interrupt/resume、审计、幂等副作用",
    group: "core",
  },
  {
    id: "S8",
    title: "多 Agent",
    proof: "Supervisor/路由，知道何时不该拆",
    group: "core",
  },
  {
    id: "S9",
    title: "MCP",
    proof: "接入、白名单、远程鉴权基线",
    group: "core",
  },
  {
    id: "S10",
    title: "评估与安全",
    proof: "轨迹断言、注入红队、失败分类",
    group: "core",
  },
  {
    id: "S11",
    title: "上线与成本",
    proof: "鉴权/限流/追踪/预算/降级",
    group: "core",
  },
  {
    id: "E1",
    title: "Agent 网关与策略",
    proof: "allow/deny/审批策略面",
    group: "elective",
  },
  {
    id: "E2",
    title: "多租户与数据面隔离",
    proof: "租户边界与数据隔离设计",
    group: "elective",
  },
  {
    id: "E3",
    title: "长任务队列 / Worker",
    proof: "可恢复运行时与队列边界",
    group: "elective",
  },
  {
    id: "E4",
    title: "评估平台与回归门禁",
    proof: "数据集治理与回归门禁",
    group: "elective",
  },
  {
    id: "E5",
    title: "A2A / 多运行时协作",
    proof: "跨运行时协作边界",
    group: "elective",
  },
];

export const coreSkillIds: SkillId[] = skillMap
  .filter((skill) => skill.group === "core")
  .map((skill) => skill.id);

export const electiveSkillIds: SkillId[] = skillMap
  .filter((skill) => skill.group === "elective")
  .map((skill) => skill.id);

export function getSkill(id: SkillId): SkillDefinition | undefined {
  return skillMap.find((skill) => skill.id === id);
}
