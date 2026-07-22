import type { Chapter } from "../types";

/** Nav landing stub until the production-ops curriculum is authored. */
export const productionOpsIntroChapter: Omit<Chapter, "number"> = {
  slug: "production-ops-intro",
  kind: "lesson",
  curriculum: "production-ops",
  skills: [],
  comingSoon: true,
  title: "生产部署与运维入门（即将上线）",
  shortTitle: "专题预告",
  phase: "生产入门",
  track: "工程上线",
  tags: ["Vercel", "Supabase", "Inngest", "Sentry"],
  duration: "待定",
  level: "工程化",
  goal: "先熟悉侧栏双课程切换；完整 14 课生产专题将在后续里程碑交付。",
  terms: ["Preview", "Production", "巡检", "可观测性"],
  sections: [
    {
      id: "preview",
      title: "本专题即将上线",
      blocks: [
        {
          type: "callout",
          tone: "note",
          title: "占位说明",
          text: "「生产部署与运维入门」将覆盖 Vercel、Supabase、Inngest、Sentry 的上线与日常巡检。当前仅提供侧栏课程槽位与本页预告，正文与截图在后续里程碑补齐。",
        },
        {
          type: "paragraph",
          text: "你可以通过左侧顶部的课程切换，在「AI Agent」与「生产运维」两套独立目录之间跳转。Agent 课程的课 / 实验 / 选修 / 作品集不受影响。",
        },
        {
          type: "checkpoint",
          title: "切换自检",
          criteria: [
            "能在侧栏顶部切到「生产运维」并回到「AI Agent」",
            "能在 Agent 课程下收起 / 展开「课程」「实验」等大类",
            "理解两门课目录相互独立，进度按当前课程统计",
          ],
        },
      ],
    },
  ],
};
