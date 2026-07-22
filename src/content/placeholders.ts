import type { Chapter, CourseTrack, SkillId } from "./types";

type PlaceholderDraft = Omit<Chapter, "number">;

/** Shared stub body for navigation-only Lab / elective entries until M2+. */
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
          text: "M1 只保证结构可导航：能力 ID、章节分组与学习路径清晰。真正的验收清单与示例代码会在对应 Lab / 选修里程碑落地。",
        },
      ],
    },
  ];
}

function lab(
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
    goal: `${title}（M2+ 实现，当前为导航占位）`,
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

/** Lab and elective stubs so the four-layer IA is navigable before deep content ships. */
export const labPlaceholders: PlaceholderDraft[] = [
  lab("lab-l01", "L01 结构化输出", "Lab L01：结构化输出与 Prompt 版本回归", ["S1"], "模型与提示"),
  lab("lab-l02", "L02 Tool 契约", "Lab L02：订单只读 Tool 契约与非法参数", ["S2"], "工具与协议"),
  lab("lab-l03", "L03 ReAct + 流式 UI", "Lab L03：ReAct Agent 与流式事件 UI 契约", ["S3", "S4"], "状态编排"),
  lab("lab-l04", "L04 RAG 评估", "Lab L04：RAG 入库与检索评估（Recall@K）", ["S5"], "知识检索"),
  lab("lab-l05", "L05 Checkpoint + HITL", "Lab L05：Checkpoint 与 HITL 邮件确认", ["S6", "S7"], "状态编排"),
  lab("lab-l06", "L06 Supervisor", "Lab L06：Supervisor 双 Worker 最小权限", ["S8"], "状态编排"),
  lab("lab-l07", "L07 只读 MCP", "Lab L07：只读 MCP Server 与白名单 Agent", ["S9"], "工具与协议"),
  lab("lab-l08", "L08 评估与门禁", "Lab L08：轨迹评估、输出护栏与 API 门禁", ["S10", "S11"], "工程上线"),
];

export const electivePlaceholders: PlaceholderDraft[] = [
  elective("elective-e1", "E1 网关策略", "选修：Agent 网关与策略（allow/deny/审批）", ["E1"]),
  elective("elective-e2", "E2 多租户隔离", "选修：多租户与数据面隔离", ["E2"]),
  elective("elective-e3", "E3 长任务运行时", "选修：长任务队列 / Worker / 可恢复运行时", ["E3"]),
  elective("elective-e4", "E4 评估平台", "选修：评估平台与回归门禁", ["E4"]),
  elective("elective-e5", "E5 A2A 协作", "选修：A2A / 多运行时协作边界", ["E5"]),
];
