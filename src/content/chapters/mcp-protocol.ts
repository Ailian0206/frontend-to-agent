import type { Chapter } from "../types";

/** MCP as standardized tool protocol — key 2025-2026 gap. */
export const mcpChapter: Omit<Chapter, "number"> = {
  slug: "mcp-protocol",
  kind: "lesson",
  skills: ["S9"],
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
        {
          type: "checkpoint",
          title: "本章自检",
          criteria: [
            "能说清 MCP 解决什么问题、不解决什么问题",
            "本地跑通至少一个只读 MCP Server + Agent",
            "有工具白名单与目录/API 权限边界",
            "知道远程 MCP 必须鉴权，不能裸奔公网",
          ],
        },
      ],
    },
  ],
};
