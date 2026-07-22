import type { Chapter } from "../types";

/** Human-in-the-loop patterns as a first-class chapter. */
export const hitlChapter: Omit<Chapter, "number"> = {
  slug: "human-in-the-loop",
  kind: "lesson",
  skills: ["S7"],
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
  relatedLabs: ["lab-l05"],
  sections: [
    {
      id: "when",
      title: "什么时候必须让人介入",
      blocks: [
        {
          type: "paragraph",
          text: "公开教程里的 HITL 常被简化成“弹个确认框”。工程上它是工作流状态：Agent 运行到安全边界时写入检查点并暂停，等待外部决策，再带着决策恢复。前端工程师应把确认面板当成一等表单——有 schema、有校验、有审计，而不是聊天里回一句“好的”。没有 checkpointer 的 interrupt 在进程重启后会丢失待办，因此 HITL 与持久化线程是绑定的，而不是 UI 层的装饰。",
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
      id: "when-hitl",
      title: "何时用 HITL，何时不用",
      blocks: [
        {
          type: "paragraph",
          text: "「何时用」：任何跨越信任边界的动作——写外部系统、花钱、改权限、代表用户对外发言——都应在执行前 interrupt，并把待确认载荷结构化返回给 UI。「何时不用」：纯推理、只读检索、可在沙箱里无损重试的模拟；以及团队尚未准备好 checkpointer、审计与幂等键时——此时应先收窄工具面，而不是给每个工具都挂一个聊天式“可以吗？”。过度 HITL 会让用户疲劳点掉确认，反而失去安全意义；不足 HITL 则在第一次模型幻觉时直接造成生产事故。",
        },
        {
          type: "table",
          headers: ["场景", "何时用", "何时不用", "常见误判"],
          rows: [
            ["发邮件/通知", "真实 SMTP 或第三方 API", "写入 outbox 由人工批次发送", "把“草稿预览”当成已审批"],
            ["改数据库", "生产写路径", "本地 fixture / 事务内 dry-run", "在聊天里贴 SQL 让用户回“执行”"],
            ["调用付费 API", "按次计费或配额敏感", "mock 或 staging 环境", "仅弹 toast 无 runId 绑定"],
            ["批量操作", "影响 >N 条或跨租户", "单条且可一键回滚", "拆成 100 次小调用绕过审批"],
            ["Agent 自纠错", "需要人改约束再继续", "自动重试只读步骤", "拒绝后无状态恢复，用户从头问"],
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
        {
          type: "code",
          language: "typescript",
          filename: "examples/lab-l05-checkpoint-hitl/src/hitl.ts",
          code: `/** Lab: propose → confirm with token; physical send counted once. */
export class HitlEmailGate {
  proposeEmailSend(payload: EmailPayload): Proposal { /* checkpoint + token */ }
  confirm(proposalId: string, token: string): SendResult { /* idempotent send */ }
}`,
          caption: "Lab L05 用纯 TypeScript 模拟 checkpoint 与邮件闸门，不依赖付费模型。",
        },
      ],
    },
    {
      id: "anti-hitl",
      title: "反例：聊天里问一句就算审批",
      blocks: [
        {
          type: "callout",
          tone: "warning",
          title: "反例（不要模仿）",
          text: "Agent 在最终回复里写“我将发送邮件，回复 yes 继续”；用户打字 yes 后服务端直接调 SMTP，没有 runId、没有 proposalId、没有幂等键。用户刷新页面后上下文丢失，模型再次 invoke 又发一封；或两个标签页各点一次确认，产生重复副作用。审计只能看到聊天记录，无法证明谁在何时批准了哪一版 subject/body。",
        },
        {
          type: "paragraph",
          text: "反例把 HITL 降级成自然语言契约，无法通过自动化测试，也无法满足合规里的职责分离。正确做法是 interrupt 返回结构化 pending，前端用表单 + token 提交 resume；物理副作用集中在单一闸门函数里，并用 idempotencyKey 去重。Lab L05 的 vitest 会断言：错误 token 拒绝、重复 confirm 不增加发送计数。",
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
            "拒绝路径应写回图状态（取消或改约束），避免用户只能关页面。",
          ],
        },
      ],
    },
    {
      id: "hitl-failures",
      title: "HITL 失败分类与调试",
      blocks: [
        {
          type: "paragraph",
          text: "HITL 链路的「失败」常横跨图执行、存储与 UI 三层。调试时先问：是根本没 interrupt（工具偷偷执行了）？是 checkpoint 丢了（无 thread_id）？还是 resume 带了过期 token / 错误用户？切忌在 resume 失败时静默重跑整图——那可能跳过审批直接打到副作用节点。",
        },
        {
          type: "table",
          headers: ["failure_class", "现象", "调试与修复"],
          rows: [
            ["no_interrupt", "用户未见确认就已执行", "副作用前必须 interrupt；工具层禁止直连外部 API"],
            ["checkpoint_lost", "重启后 pending 消失", "持久化 checkpointer；thread_id 与 tenant 绑定"],
            ["stale_resume", "confirm 返回 409/过期", "proposal TTL；UI 展示重新 propose"],
            ["double_submit", "重复邮件/重复扣款", "幂等键 + 闸门内物理发送计数；前端防抖"],
            ["cross_user", "A 批准了 B 的 run", "resume 校验 subject 与 session；拒绝越权 thread"],
            ["schema_drift", "编辑字段未生效", "ApprovalSchema 与服务端 payload 版本对齐"],
          ],
        },
        {
          type: "callout",
          tone: "note",
          title: "调试习惯",
          text: "用 thread_id 在 LangGraph 或自建存储里拉出 checkpoint 历史，对照 interrupt payload 与 resume 输入。面试谈到 HITL bug 时，说出 failure_class 表 + 幂等闸门单测，比只说“加了个确认弹窗”更有说服力。",
        },
      ],
    },
    {
      id: "interview-hitl",
      title: "面试常问：HITL 与检查点",
      blocks: [
        {
          type: "table",
          headers: ["追问", "答纲要点"],
          rows: [
            ["interrupt 和普通 tool 有什么区别？", "interrupt 暂停图并持久化；resume 注入人类决策；tool 不应在审批前产生副作用。"],
            ["如何保证重复点击确认只执行一次？", "proposalId + token + idempotencyKey；闸门函数内去重；前端禁用双提交。"],
            ["拒绝后 Agent 怎么继续？", "resume 带 approved=false 或修订约束；路由回规划节点而非 END。"],
            ["HITL 与流式 UI 如何配合？", "事件类型 confirm_required；与 S4 awaiting_confirm 状态一致；runId 贯穿。"],
            ["何时不必上 HITL？", "只读、可重试、staging mock；先缩工具面再谈审批疲劳。"],
          ],
        },
        {
          type: "paragraph",
          text: "面试追问常落在「可审计」与「可恢复」：能否证明批准的是哪一版载荷、进程重启后待办是否还在、取消是否真正阻止了副作用。结合 Lab L05 里 token 校验与发送计数的测试用例，就是可落地的工程故事。",
        },
      ],
    },
    {
      id: "lab-hitl",
      title: "动手验证",
      blocks: [
        {
          type: "callout",
          tone: "success",
          title: "配套 Lab L05",
          text: "仓库路径 examples/lab-l05-checkpoint-hitl：实现 HitlEmailGate（propose / confirm / 幂等发送），用 vitest 覆盖合法确认、错误 token 与重复 confirm。站点章节 /chapter/lab-l05 与本课 interrupt 循环对照，通过后再把同一闸门模式接到 LangGraph checkpointer。",
        },
        {
          type: "checkpoint",
          title: "上岗自检（HITL）",
          criteria: [
            "能说明「何时用 / 何时不用」HITL，并指出聊天式 yes 反例",
            "能画清 interrupt → UI → resume 的数据流，且副作用在 resume 之后",
            "确认面板展示对象、影响与可编辑字段，带 runId / proposalId",
            "失败能归类 checkpoint_lost / double_submit 等，并会用闸门单测调试",
            "能根据面试表讲清幂等、拒绝路径与审计要求",
          ],
        },
      ],
    },
  ],
};
