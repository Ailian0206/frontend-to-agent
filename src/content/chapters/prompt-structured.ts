import type { Chapter } from "../types";

/** Prompt engineering and structured output — missing core track in original curriculum. */
export const promptStructuredChapter: Omit<Chapter, "number"> = {
  slug: "prompt-structured",
  title: "Prompt 工程与结构化输出",
  shortTitle: "Prompt 与结构化输出",
  phase: "控制模型输出",
  track: "模型与提示",
  tags: ["Prompt", "Zod", "Structured Output", "CoT"],
  duration: "70 分钟",
  level: "基础",
  goal: "把自然语言提示变成可测试的控制面：边界清晰、输出可校验、失败可复现。",
  dependencies: ["zod@4", "langchain@1", "@langchain/openai"],
  terms: ["System Prompt", "Few-shot", "Chain-of-Thought", "Structured Output", "Schema"],
  relatedResources: ["book-langchain-agent", "hi-agent", "langchain-js-docs", "frontend-agent-path-article"],
  sections: [
    {
      id: "control-plane",
      title: "Prompt 是控制面，不是业务逻辑仓库",
      blocks: [
        {
          type: "paragraph",
          text: "公开课程几乎都把 Prompt 工程放在 Agent 之前：不是因为写文案重要，而是因为模型只会在你给的约束里做概率选择。资深前端可以把 Prompt 类比成“组件 props + 运行时策略”：系统消息定义角色与硬边界，用户消息携带目标，工具结果是只读观察。真正的业务规则（能否退款、是否越权、金额上限）必须留在 TypeScript 代码里校验，否则模型一改措辞就能绕过。",
        },
        {
          type: "table",
          headers: ["放在 Prompt 里", "放在代码里", "原因"],
          rows: [
            ["任务目标、风格、输出格式说明", "权限、配额、金额、状态机转移", "模型不可作为可信执行者"],
            ["工具选择提示与优先级", "工具白名单与参数 Schema", "选择可建议，执行必须校验"],
            ["拒答策略与证据不足话术", "审计日志与脱敏规则", "合规不可靠自然语言保证"],
            ["示例与反例（Few-shot）", "单测与评估集断言", "示例会漂移，测试才能回归"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "常见陷阱",
          text: "把整本员工手册塞进 System Prompt 会同时抬高成本、延迟和注意力噪声。私有知识走 RAG；稳定规则走代码；只有“如何说话、如何组织答案”才适合 Prompt。",
        },
      ],
    },
    {
      id: "patterns",
      title: "前端熟悉的四类 Prompt 模式",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "指令式", detail: "直接说明目标、输入、输出与禁止项。适合结构化抽取与分类。" },
            { title: "Few-shot", detail: "给 2–5 个正反例，锁定格式。例要短，且覆盖边界情况。" },
            { title: "CoT / 计划后再答", detail: "要求先列步骤再给结论。适合多跳推理，但别把思维链当可信审计。" },
            { title: "工具优先", detail: "明确“先查再答 / 先确认再写”。与 ReAct 循环配合，减少空想。" },
          ],
        },
        {
          type: "code",
          language: "typescript",
          filename: "src/prompts/order-triage.ts",
          code: `export const orderTriagePrompt = \`你是订单分流助手。
目标：判断用户意图属于 query_status / cancel / refund / other。
规则：
1. 只根据用户消息判断，不编造订单号。
2. 若信息不足，intent 设为 other，并列出缺失字段。
3. 不要承诺退款或取消结果。
输出必须是符合 schema 的 JSON，不要 Markdown。\`;`,
        },
        {
          type: "paragraph",
          text: "写 Prompt 时像写 API 文档：先定义输入输出契约，再补语气。团队协作时给 Prompt 加版本号（例如 order-triage@2026-07-21），并与评估集绑定。改 Prompt 等于发版，需要回归，而不是聊天窗口里“感觉更好了”。",
        },
      ],
    },
    {
      id: "structured",
      title: "结构化输出：让模型返回可解析对象",
      blocks: [
        {
          type: "paragraph",
          text: "Agent 工程的第一生产力是 Structured Output。与其解析自由文本，不如用 Zod schema 约束字段类型、枚举与长度。模型负责填槽，代码负责校验；校验失败就重试或降级，而不是把半截字符串传给下游。",
        },
        {
          type: "code",
          language: "typescript",
          filename: "src/structured-intent.ts",
          code: `import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";

const IntentSchema = z.object({
  intent: z.enum(["query_status", "cancel", "refund", "other"]),
  orderId: z.string().regex(/^ORD-\\d{6}$/).optional(),
  missingFields: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
});

const model = new ChatOpenAI({
  model: process.env.OPENAI_MODEL,
  temperature: 0,
}).withStructuredOutput(IntentSchema);

const result = await model.invoke([
  { role: "system", content: orderTriagePrompt },
  { role: "user", content: "帮我看看 ORD-123456 到哪了" },
]);

console.log(result.intent, result.orderId);`,
          output: `预期：intent=query_status, orderId=ORD-123456, confidence 为 0~1 数字。
若用户没给订单号：intent 可能为 other，missingFields 含 orderId。`,
          caption: "依赖：zod@4、@langchain/openai；勿在测试中调用付费模型。",
        },
        {
          type: "checkpoint",
          title: "本章自检",
          criteria: [
            "能说明哪些规则绝不能只写在 Prompt 里",
            "至少有一个 Zod schema + withStructuredOutput 实验",
            "Prompt 有版本标识，并准备了 5 条以上回归用例（手工表即可）",
            "失败时有校验错误处理，而不是 JSON.parse 裸奔",
          ],
        },
      ],
    },
    {
      id: "resources",
      title: "公开资料怎么读",
      blocks: [
        {
          type: "resources",
          title: "推荐公开资源",
          items: [
            {
              title: "diguike/book-langchain-agent",
              url: "https://github.com/diguike/book-langchain-agent",
              kind: "github",
              note: "中文 LangChain.js 体系，补 Prompt 与评估章节。",
            },
            {
              title: "joker-yjc/hi-agent",
              url: "https://github.com/joker-yjc/hi-agent",
              kind: "github",
              note: "前端友好的阶段一/二练习，适合对照动手。",
            },
            {
              title: "LangChain.js Docs",
              url: "https://js.langchain.com/",
              kind: "docs",
              note: "Structured Output API 以官方为准。",
            },
          ],
        },
      ],
    },
  ],
};
