import type { Chapter } from "../types";

/** MCP as standardized tool protocol — key 2025-2026 gap. */
export const mcpChapter: Omit<Chapter, "number"> = {
  slug: "mcp-protocol",
  kind: "lesson",
  skills: ["S9"],
  relatedLabs: ["lab-l07"],
  title: "MCP：把工具生态标准化",
  shortTitle: "MCP 工具协议",
  phase: "协议化工具接入",
  track: "工具与协议",
  tags: ["MCP", "Adapters", "Stdio", "权限"],
  duration: "80 分钟",
  level: "进阶",
  goal: "理解 Model Context Protocol，能把 MCP Server 安全地接到 LangChain.js Agent，而不是为每个 API 手写一次性 Tool。",
  dependencies: ["@langchain/mcp-adapters", "@modelcontextprotocol/sdk", "langchain"],
  terms: ["MCP", "Tools", "Resources", "Stdio Transport", "Streamable HTTP"],
  relatedResources: ["mcp-langchain-js", "mcp-spec", "build-your-own-ai-agent", "agent-learning-zh"],
  sections: [
    {
      id: "why-mcp",
      title: "为什么需要协议，而不是更多 wrapper",
      blocks: [
        {
          type: "paragraph",
          text: "每个产品团队都在写自己的“天气 Tool / 工单 Tool / 浏览器 Tool”。MCP 把工具发现、调用与传输做成开放协议：Server 声明能力，Host（IDE、Agent 运行时）按统一方式连接。对前端工程师，这很像“浏览器扩展 API”或“Language Server Protocol”——能力在边界清晰的进程里，权限由宿主授予。",
        },
        {
          type: "table",
          headers: ["方式", "优点", "风险"],
          rows: [
            ["手写 LangChain Tool", "灵活、易单测", "生态难复用，接入成本线性上升"],
            ["MCP Server + Adapter", "工具可跨宿主复用", "需治理权限、版本与网络安全"],
            ["直接把 Shell 暴露给模型", "上手快", "几乎必然变成生产事故"],
          ],
        },
        {
          type: "callout",
          tone: "note",
          title: "和 A2A 的分工",
          text: "公开路线图常把 MCP 与 A2A 并列：MCP 偏“工具与上下文接入”，A2A 偏“Agent 之间的任务协作”。本站先掌握 MCP；跨框架 Agent 协作放到选修。",
        },
      ],
    },
    {
      id: "when-mcp",
      title: "何时用 MCP，何时不用",
      blocks: [
        {
          type: "paragraph",
          text: "「何时用」MCP：你需要接入的能力已有社区或内部 MCP Server（文件、浏览器、工单、数据库只读视图），且希望同一套 Server 在 IDE、CLI Agent 与产品里复用；或工具实现语言与 Agent 运行时不同，需要进程隔离与独立发版。「何时不用」：单一 HTTP API、无状态、团队已有一套稳定的 LangChain Tool 层且没有跨宿主需求；或安全基线尚未就绪（无白名单、无审计、远程 Server 裸奔公网）——此时应先收窄手写 Tool，而不是把 Shell 包进 MCP 当“标准化”。面试里常把 MCP 说成“万能插件”：协议解决的是发现与传输，不自动解决权限与供应链安全。",
        },
        {
          type: "table",
          headers: ["场景", "何时用", "何时不用", "常见误判"],
          rows: [
            ["只读知识库文件", "官方 filesystem Server + 只读目录", "把整个 $HOME 挂进 Server", "以为 MCP 自带沙箱"],
            ["内部 SaaS 集成", "独立 MCP 进程持密钥", "把 API Key 写进 tool description", "让模型“自己选”20 个工具"],
            ["IDE 与产品共用工具", "同一 Server 版本矩阵", "每个产品 fork 一份 wrapper", "忽略 Server 升级与 breaking change"],
            ["一次性脚本", "手写 Tool 更快", "为一条 curl 起 MCP", "协议开销大于收益"],
            ["高风险写操作", "MCP + 宿主白名单 + HITL", "仅依赖 System Prompt 禁止删除", "信任 Server 声明的全部 tools"],
          ],
        },
      ],
    },
    {
      id: "connect",
      title: "用适配器接入 MCP 工具",
      blocks: [
        {
          type: "code",
          language: "typescript",
          filename: "src/mcp-agent.ts",
          code: `import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";

const client = new MultiServerMCPClient({
  filesystem: {
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "./knowledge"],
  },
});

const tools = await client.getTools();
// Host-side allowlist: never expose every MCP tool blindly in production.
const allowed = tools.filter((tool) => ["read_file", "list_directory"].includes(tool.name));

const agent = createAgent({
  model: new ChatOpenAI({ model: process.env.OPENAI_MODEL, temperature: 0 }),
  tools: allowed,
  systemPrompt: "Only read local knowledge files. Never modify files.",
});

const result = await agent.invoke({
  messages: [{ role: "user", content: "总结 knowledge/handbook.md 的值班规则" }],
});
console.log(result.messages.at(-1)?.content);
await client.close();`,
          caption: "API 以 docs.langchain.com MCP 文档为准；示例强调白名单。",
          output: `预期：Agent 通过 MCP 文件系统工具读取 handbook，回答带来源。
若工具不在白名单，应无法删除或写入文件。`,
        },
        {
          type: "bullets",
          items: [
            "本地 Stdio Server 适合开发；远程用 Streamable HTTP，并强制鉴权。",
            "工具描述会被模型看到：写清副作用、输入约束与失败语义。",
            "MCP 返回错误时，TypeScript 适配器可能抛异常——要有捕获与降级策略。",
            "资源（Resources）与提示（Prompts）也是协议能力，不要只盯 Tools。",
          ],
        },
        {
          type: "code",
          language: "typescript",
          filename: "examples/lab-l07-mcp-whitelist/src/allowlist.ts",
          code: `/** Lab: filter MCP tool list before agent registration. */
export function filterAllowedTools<T extends { name: string }>(
  tools: T[],
  allowlist: readonly string[],
): T[] {
  const set = new Set(allowlist);
  return tools.filter((tool) => set.has(tool.name));
}`,
          caption: "Lab L07 在注册 Agent 前做宿主侧白名单，并单测拒绝 write_file 等危险工具名。",
        },
      ],
    },
    {
      id: "anti-mcp",
      title: "反例：把 Server 全部工具交给模型",
      blocks: [
        {
          type: "callout",
          tone: "warning",
          title: "反例（不要模仿）",
          text: "MultiServerMCPClient.getTools() 返回 18 个工具后，开发图省事 `tools: await client.getTools()` 全部注册；filesystem Server 挂在仓库根目录，模型一次误调用 write_file 或执行路径穿越。日志只有“tool error”，没有 server 版本、tool 名与参数摘要，事后无法回答合规问的“谁授权了写盘”。远程 MCP 无 mTLS、无 token，内网扫描即可枚举工具面。",
        },
        {
          type: "paragraph",
          text: "反例把 MCP 当成“自动安全”：协议只统一了调用形状，权限仍在宿主。正确做法是只读目录、allowlist 子集、密钥留在 Server 进程环境变量，并对每次调用记 audit 行（server id、tool、参数摘要、结果状态）。Lab L07 的 vitest 应断言：未列入白名单的工具名即使出现在 Server 列表里也不会进入 Agent。",
        },
      ],
    },
    {
      id: "security",
      title: "MCP 安全基线",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "最小权限目录/API", detail: "文件系统 Server 只能挂只读知识目录，不要挂整个 $HOME。" },
            { title: "宿主白名单", detail: "即使 Server 暴露 20 个工具，Agent 也只注册必要子集。" },
            { title: "密钥不进模型上下文", detail: "Token 留在 Server 环境变量；工具结果做脱敏。" },
            { title: "审计与版本", detail: "记录 server 名称、版本、tool 名、参数摘要与调用结果。" },
          ],
        },
        {
          type: "resources",
          title: "协议与教程",
          items: [
            {
              title: "Model Context Protocol",
              url: "https://modelcontextprotocol.io/",
              kind: "docs",
              note: "先读概念与安全模型。",
            },
            {
              title: "LangChain JS MCP docs",
              url: "https://docs.langchain.com/oss/javascript/langchain/mcp",
              kind: "docs",
              note: "MultiServerMCPClient 用法。",
            },
            {
              title: "build-your-own-ai-agent / MCP project",
              url: "https://github.com/Lay4U/build-your-own-ai-agent",
              kind: "github",
              note: "去框架实现有助于理解协议边界。",
            },
          ],
        },
      ],
    },
    {
      id: "mcp-failures",
      title: "MCP 失败分类与调试",
      blocks: [
        {
          type: "paragraph",
          text: "MCP 链路的「失败」常横跨传输、Server 进程与宿主适配三层。调试时先问：是 Stdio 子进程没起来（command/args 错）？是 Server 返回协议错误但 Agent 只显示“tool failed”？还是白名单漏配导致危险 tool 仍被注册？切忌在 transport 超时后无界重试 spawn——可能堆满僵尸 npx 进程。",
        },
        {
          type: "table",
          headers: ["failure_class", "现象", "调试与修复"],
          rows: [
            ["stdio_spawn", "getTools 一直挂起或 ECONNRESET", "本地手动跑同 command；固定 Server 版本；启动超时"],
            ["tool_not_allowlisted", "生产出现未预期的写操作", "注册前 filter；Lab L07 单测覆盖 forbidden tool"],
            ["server_error_opaque", "模型只会重试同一调用", "捕获 MCP error body；映射为可恢复/不可恢复"],
            ["path_escape", "读到仓库外文件", "Server 根目录最小化；结果路径校验"],
            ["remote_unauth", "公网 MCP 被扫", "mTLS/OAuth；内网；禁用匿名 Streamable HTTP"],
            ["version_skew", "升级后 tool schema 变", "锁 Server 版本；CI 契约测 tool input"],
          ],
        },
        {
          type: "callout",
          tone: "note",
          title: "调试习惯",
          text: "在 Host 侧打开单次 invoke 的 MCP 调用序列（server、tool、latency、status）。面试谈到 MCP 事故时，说出 failure_class 表 + 宿主白名单 + 只读挂载，比只说“用了官方 Server”更能体现工程边界。",
        },
      ],
    },
    {
      id: "interview-mcp",
      title: "面试常问：MCP 与工具治理",
      blocks: [
        {
          type: "table",
          headers: ["追问", "答纲要点"],
          rows: [
            ["MCP 和手写 LangChain Tool 怎么选？", "跨宿主复用、异构语言、独立发版 → MCP；单一 API、强单测、无复用需求 → 手写。"],
            ["为什么 getTools 后还要白名单？", "Server 声明能力 ⊃ 产品授权能力；模型只见允许子集。"],
            ["Stdio 和 HTTP 传输如何取舍？", "本地开发 Stdio；远程 HTTP + 鉴权；注意超时与子进程生命周期。"],
            ["Resources/Prompts 和 Tools 关系？", "同一协议不同能力；RAG 上下文可读 Resource，不必全塞进 Tool 结果。"],
            ["如何审计一次 MCP 调用？", "traceId + server 版本 + tool 名 + 参数摘要 + 结果码；密钥不出现在日志。"],
          ],
        },
        {
          type: "paragraph",
          text: "面试追问常落在供应链与权限：Server 谁维护、升级谁审批、误调用如何止血。结合 Lab L07 白名单单测与只读 knowledge 目录，就是可落地的「何时用 / 何时不用」故事，而不是背协议缩写。",
        },
      ],
    },
    {
      id: "lab-mcp",
      title: "动手验证",
      blocks: [
        {
          type: "callout",
          tone: "success",
          title: "配套 Lab L07",
          text: "仓库路径 examples/lab-l07-mcp-whitelist：实现 MCP 工具列表过滤（allowlist）、拒绝未授权工具名注册，并用 vitest 覆盖 read 允许与 write 拒绝路径。站点章节 /chapter/lab-l07 与本课 MultiServerMCPClient 示例对照，通过后再接真实只读 filesystem Server。",
        },
        {
          type: "checkpoint",
          title: "上岗自检（MCP）",
          criteria: [
            "能说明「何时用 / 何时不用」MCP，并指出全量 getTools 反例",
            "本地跑通至少一个只读 MCP Server + 宿主白名单 Agent",
            "有目录/API 权限边界与 MCP 调用审计字段",
            "失败能归类 stdio_spawn / tool_not_allowlisted 等，并会查 Server 进程与 allowlist",
            "能根据面试表讲清传输、白名单与 Resources 分工",
          ],
        },
      ],
    },
  ],
};
