import type { Chapter } from "../types";

/** Human-in-the-loop patterns as a first-class chapter. */
export const hitlChapter: Omit<Chapter, "number"> = {
  slug: "human-in-the-loop",
  title: "Human-in-the-Loop：中断、确认与恢复",
  shortTitle: "人机协作 HITL",
  phase: "把人留在关键回路",
  track: "状态编排",
  tags: ["HITL", "Interrupt", "Approval", "Checkpoint"],
  duration: "65 分钟",
  level: "进阶",
  goal: "在副作用发生前插入可恢复的人机确认，而不是事后道歉。",
  dependencies: ["@langchain/langgraph", "持久化 checkpointer"],
  terms: ["Interrupt", "Resume", "Approval Gate", "Idempotency Key"],
  relatedResources: ["agents-from-scratch-ts", "langgraph-101-ts", "langgraph-js-docs"],
  sections: [
    {
      id: "when",
      title: "什么时候必须让人介入",
      blocks: [
        {
          type: "paragraph",
          text: "公开教程里的 HITL 常被简化成“弹个确认框”。工程上它是工作流状态：Agent 运行到安全边界时写入检查点并暂停，等待外部决策，再带着决策恢复。前端工程师应把确认面板当成一等表单——有 schema、有校验、有审计，而不是聊天里回一句“好的”。",
        },
        {
          type: "table",
          headers: ["场景", "是否 HITL", "原因"],
          rows: [
            ["查询天气、检索文档", "否", "只读且可重试"],
            ["发送邮件、创建工单", "是", "外部副作用"],
            ["退款、改权限、删数据", "强确认", "不可逆或高成本"],
            ["批量改写生产配置", "双人复核", "需要职责分离"],
          ],
        },
      ],
    },
    {
      id: "pattern",
      title: "Interrupt / Resume 模式",
      blocks: [
        {
          type: "diagram",
          title: "HITL 检查点循环",
          chart: `flowchart TD
  A[Agent 规划] --> B{需要副作用?}
  B -->|否| C[继续推理/回答]
  B -->|是| D[写入 checkpoint]
  D --> E[返回 pending_approval]
  E --> F[人工确认面板]
  F -->|批准| G[携带决策 resume]
  F -->|拒绝/修改| H[更新约束后 resume]
  G --> I[执行工具]
  H --> A
  I --> C`,
        },
        {
          type: "code",
          language: "typescript",
          filename: "src/hitl-mail.ts",
          code: `import { interrupt } from "@langchain/langgraph";
import { z } from "zod";

const ApprovalSchema = z.object({
  approved: z.boolean(),
  editedSubject: z.string().max(120).optional(),
  editedBody: z.string().max(5_000).optional(),
});

export async function sendMailNode(state: {
  to: string;
  subject: string;
  body: string;
}) {
  // Pause before side effect; UI collects structured approval.
  const decision = interrupt({
    type: "approve_email",
    payload: state,
  });
  const approval = ApprovalSchema.parse(decision);
  if (!approval.approved) {
    return { status: "cancelled" as const };
  }
  const subject = approval.editedSubject ?? state.subject;
  const body = approval.editedBody ?? state.body;
  // Real send happens only after resume with validated payload.
  await deliverEmail({ to: state.to, subject, body, idempotencyKey: state.to + subject });
  return { status: "sent" as const, subject };
}`,
          caption: "概念示例：真实 API 以 LangGraph.js interrupt 文档为准。",
          output: `验证：第一次 invoke 应停在 pending；提交 approved=true 后 resume 才真正发送。
重复 resume 同一 idempotencyKey 不应产生第二封邮件。`,
        },
      ],
    },
    {
      id: "frontend-contract",
      title: "前后端确认契约",
      blocks: [
        {
          type: "bullets",
          items: [
            "服务端返回 runId + 待确认 payload（结构化），前端不得自行发明可执行参数。",
            "确认请求必须带 runId 与用户身份；拒绝跨用户恢复检查点。",
            "超时未确认应自动过期，避免僵尸 run 占用资源。",
            "审计记录：谁在何时批准了什么，批准前后的字段差异。",
          ],
        },
        {
          type: "checkpoint",
          title: "本章自检",
          criteria: [
            "能画清 interrupt → UI → resume 的数据流",
            "副作用工具默认 Dry Run 或必须审批",
            "确认面板展示对象、影响与可编辑字段",
            "具备幂等键，防止重复批准导致重复执行",
          ],
        },
      ],
    },
  ],
};
