import type { Chapter } from "../types";

/** Prompt engineering and structured output — missing core track in original curriculum. */
export const promptStructuredChapter: Omit<Chapter, "number"> = {
  slug: "prompt-structured",
  kind: "lesson",
  skills: ["S1"],
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
  relatedLabs: ["lab-l01"],
  sections: [
    {
      id: "control-plane",
      title: "Prompt 是控制面，不是业务逻辑仓库",
      blocks: [
        {
          type: "paragraph",
          text: "公开课程几乎都把 Prompt 工程放在 Agent 之前：不是因为写文案重要，而是因为模型只会在你给的约束里做概率选择。资深前端可以把 Prompt 类比成“组件 props + 运行时策略”：系统消息定义角色与硬边界，用户消息携带目标，工具结果是只读观察。真正的业务规则（能否退款、是否越权、金额上限）必须留在 TypeScript 代码里校验，否则模型一改措辞就能绕过。上线后若只靠“模型记得规则”，等价于把权限校验写在 localStorage——演示能过，审计过不了。",
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
          text: "写 Prompt 时像写 API 文档：先定义输入输出契约，再补语气。团队协作时给 Prompt 加版本号（例如 order-triage@2026-07-21），并与评估集绑定。改 Prompt 等于发版，需要回归，而不是聊天窗口里“感觉更好了”。版本号应出现在日志与评估报告里，这样线上劣化才能对照到具体 Prompt diff，而不是笼统怪“模型变了”。",
        },
      ],
    },
    {
      id: "when-structured",
      title: "何时用结构化输出，何时不用",
      blocks: [
        {
          type: "paragraph",
          text: "「何时用」Structured Output，本质是在问：下游是否需要机器可消费的字段，且错误代价是否高于多一次重试的成本。分类、路由、填表、工具参数提案、评估打分——这些场景几乎都应结构化；纯创意文案、开放式头脑风暴、对用户展示的散文式解释，则不必强行 JSON。面试里常把“结构化”和“JSON 模式”混为一谈：前者是产品契约（字段语义 + 校验 + 降级），后者只是传输格式。",
        },
        {
          type: "table",
          headers: ["场景", "何时用", "何时不用", "备注"],
          rows: [
            ["意图路由 / 槽位填充", "要驱动 if/else 或状态机", "只需展示一段说明文字", "路由错一次可能触发错误工具"],
            ["工具参数提案", "要写库、发邮件、改配置", "只读查询且可人工改", "提案仍须代码二次校验"],
            ["评估与打分", "要进 CI 做阈值断言", "一次性人工看一眼", "分数必须可复现"],
            ["长文生成", "需要章节标题等元数据", "整篇博客一次性输出", "可分段结构化，不必全文 JSON"],
            ["CoT 推理", "需要中间步骤供 UI 展示", "步骤含敏感推理", "思维链不要当审计证据"],
          ],
        },
        {
          type: "quote",
          text: "Prompt 建议格式，Schema 定义真相；二者冲突时以 Schema 与代码为准。",
          author: "课程共识",
        },
      ],
    },
    {
      id: "anti-pattern",
      title: "反例：把 Prompt 当数据库用",
      blocks: [
        {
          type: "callout",
          tone: "warning",
          title: "反例（不要模仿）",
          text: "System Prompt 里写满 200 条业务规则 + 全量 SKU 价格表，并要求模型“牢记”；用户一说退款，模型凭记忆编金额；没有 Zod、没有工具查询、没有版本回归。演示时像智能客服，一上评估集就 intent 漂移、字段幻觉、JSON 外包裹 Markdown 代码块。",
        },
        {
          type: "paragraph",
          text: "正确拆法：价格与库存走只读工具或 RAG，退款资格走代码策略引擎，Prompt 只描述“如何向用户解释结果”和“缺字段时如何追问”。反例的价值在于帮你识别团队里“再加一段 System 就能修”的惯性——那通常是在用概率模型做关系型数据库该做的事。",
        },
        {
          type: "bullets",
          items: [
            "反例信号：Prompt 字数周环比暴涨，但评估集通过率不变或下降。",
            "反例信号：线上大量 JSON.parse 失败，却在 Prompt 里加“请务必输出合法 JSON”。",
            "反例信号：同一用户问题，换模型后业务分支完全改变，却没有 Prompt 版本记录。",
          ],
        },
      ],
    },
    {
      id: "structured",
      title: "结构化输出：让模型返回可解析对象",
      blocks: [
        {
          type: "paragraph",
          text: "Agent 工程的第一生产力是 Structured Output。与其解析自由文本，不如用 Zod schema 约束字段类型、枚举与长度。模型负责填槽，代码负责校验；校验失败就重试或降级，而不是把半截字符串传给下游。Lab 里会把「模型原文 → JSON.parse → safeParse」拆成可测函数，与 withStructuredOutput 对照，让你看见失败发生在哪一层。",
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
          type: "code",
          language: "typescript",
          filename: "examples/lab-l01-structured-output/src/order-schema.ts",
          code: `export function parseIntentJson(rawJson: string): IntentResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (error) {
    throw new IntentParseError("invalid_json", "Model output is not valid JSON", error);
  }
  const result = IntentSchema.safeParse(parsed);
  if (!result.success) {
    throw new IntentParseError("schema", \`Schema validation failed: \${result.error.message}\`, result.error);
  }
  return result.data;
}`,
          caption: "与 Lab L01 对齐：区分 invalid_json 与 schema 两类失败，便于指标与重试策略。",
        },
      ],
    },
    {
      id: "failures",
      title: "失败分类与调试路径",
      blocks: [
        {
          type: "paragraph",
          text: "结构化链路里的「失败」不要笼统记成“模型不行”。上线团队会为每次请求打 failure_class，否则你无法决定是改 Prompt、改 Schema、换模型还是修工具。调试时固定顺序：先确认 Prompt 版本与输入快照，再看原始 model text（是否夹带 Markdown），再跑 Zod safeParse，最后才看业务分支是否误用 optional 字段。",
        },
        {
          type: "table",
          headers: ["failure_class", "典型症状", "优先动作"],
          rows: [
            ["format", "JSON 截断、多余 ```、前后缀说明文字", "收紧输出指令；解析前 strip；限制 max_tokens"],
            ["schema", "字段类型错、枚举越界、缺必填", "缩小 schema；Few-shot 边界例；降级为 other + missingFields"],
            ["semantic", "JSON 合法但 intent 与人工标注不一致", "补评估集；调 temperature；拆分子任务"],
            ["policy", "模型承诺退款/泄露不该说的", "拒答模板 + 输出护栏；敏感动作移出 Prompt"],
            ["integration", "withStructuredOutput 与供应商 API 不兼容", "查 SDK 版本；回退 manual parse + Zod"],
          ],
        },
        {
          type: "callout",
          tone: "note",
          title: "调试清单",
          text: "本地保存：user 原文、system 版本号、model raw、parse 错误码、重试次数。面试追问“如何复现一次线上 bad case”时，用这五元组讲故事，而不是只说“我们看了日志”。",
        },
      ],
    },
    {
      id: "interview",
      title: "面试常问：Prompt 与结构化",
      blocks: [
        {
          type: "paragraph",
          text: "以下表格覆盖社招/外企常见 follow-up。答纲强调工程取舍，避免背诵“写清楚一点”这类空话。现场可把「何时不用」结构化讲成：用户可读性优先、字段不确定、或错误代价低的三类。",
        },
        {
          type: "table",
          headers: ["追问", "答纲要点"],
          rows: [
            ["为什么业务规则不能只写在 System Prompt？", "模型非确定性执行者；合规与权限要代码+审计；Prompt 适合表达策略而非真相源。"],
            ["Structured Output 和 function calling 怎么选？", "前者拿最终业务对象；后者驱动工具图。常组合：工具用 FC，汇总结果再 schema 化。"],
            ["评估集要多大？改 Prompt 怎么发版？", "先 20–50 条高价值边界；Prompt 版本化；CI 跑回归；劣化阻断合并。"],
            ["JSON 老是坏怎么办？", "分 format vs schema；strip/markdown 处理；重试一次；仍失败走降级 intent。"],
            ["CoT 要不要给用户看？", "可作 UX 进度；不可作安全或计费依据；敏感推理应隐藏或摘要。"],
          ],
        },
      ],
    },
    {
      id: "lab-link",
      title: "动手验证",
      blocks: [
        {
          type: "callout",
          tone: "success",
          title: "配套 Lab L01",
          text: "仓库路径 examples/lab-l01-structured-output：实现 order schema、Prompt 版本常量与离线回归表。学完本章后在站点打开 /chapter/lab-l01，用 vitest 跑通 parse 与 regress，再把同一份 schema 接到你的 Agent 路由层。",
        },
        {
          type: "checkpoint",
          title: "上岗自检（Prompt 与结构化）",
          criteria: [
            "能口头说明「何时用 / 何时不用」结构化，并举一条反例",
            "至少有一个 Zod schema + withStructuredOutput 或等价 parse 管线",
            "Prompt 有版本标识，并准备了 5 条以上回归用例（手工表即可）",
            "失败能区分 format / schema / semantic，并有调试五元组习惯",
            "能根据面试表回答权限、发版与 JSON 坏数据处理",
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
