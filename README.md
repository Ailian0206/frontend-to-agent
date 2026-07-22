# Frontend to Agent

面向 10 年以上前端工程师的 AI Agent 系统学习网站。课程以 Node.js、TypeScript、LangChain.js 和 LangGraph.js 为主线，覆盖 Prompt、Tool Calling、流式 UI、RAG、HITL、多 Agent、MCP、评估安全，直到可部署的个人知识库 Agent。

## 在线课程

GitHub Pages 部署完成后访问：

<https://ailian0206.github.io/frontend-to-agent/>

公开资源库：

<https://ailian0206.github.io/frontend-to-agent/resources/>

岗位能力地图：

<https://ailian0206.github.io/frontend-to-agent/skills/>

## 课程能力

- 四层内容结构：课程 / 实验 Lab / 选修 / 作品集
- 岗位能力地图 `/skills`：主线 S1–S11 + 选修 E1–E5
- 16 章系统教程（lesson）+ Lab/选修导航；**L01–L08 与选修 E1–E5 已交付**
- 16 周核心学习计划 + 选修拓展
- Mermaid 架构图、结构化正文检索、章节深链分享
- 20+ 组代码示例，核心实验均注明依赖版本、验证方法与章节自检
- 公开资源库：GitHub / 官方文档 / 公开中文文章（原创摘要，外链阅读）
- 桌面三栏学习工作台与移动端目录抽屉
- `examples/knowledge-agent` 完整知识库 Agent 项目
- `examples/lab-l01-structured-output` … `lab-l08-eval-guardrail`

## Labs（M2–M4）

| Lab | 能力 | 目录 |
|---|---|---|
| L01 | S1 | `examples/lab-l01-structured-output` |
| L02 | S2 | `examples/lab-l02-tool-contract` |
| L03 | S3/S4 | `examples/lab-l03-react-stream` |
| L04 | S5 | `examples/lab-l04-rag-eval` |
| L05 | S6/S7 | `examples/lab-l05-checkpoint-hitl` |
| L06 | S8 | `examples/lab-l06-supervisor` |
| L07 | S9 | `examples/lab-l07-mcp-whitelist` |
| L08 | S10/S11 | `examples/lab-l08-eval-guardrail` |

每个 Lab：`cd` 进入目录后 `npm install && npm test`。CI 通过根目录 `npm run test:examples` 串联，**不会**调用付费模型。选修 E1–E5 见侧栏「选修」分组。

## 学习轨道

| 轨道 | 覆盖 |
|---|---|
| 认知基础 | 转型动机、术语、系统边界 |
| 模型与提示 | 环境、Prompt、结构化输出 |
| 工具与协议 | Tool Calling、MCP |
| 知识检索 | RAG、Agentic RAG、引用与评估 |
| 状态编排 | 记忆、HITL、多 Agent |
| 工程上线 | 流式 UI、部署、评估与安全 |
| 实战进阶 | Capstone、16 周路线、资源库 |

## 本地运行

```bash
npm install
npm run dev
```

打开 <http://localhost:3000>。

## 质量检查

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

里程碑变更使用功能分支和 PR，并经过只读 CI 与一次独立 Claude 审核；小型维护可在完整验证后直接推送 `main`。完整规则见 [`docs/github-review-workflow.md`](docs/github-review-workflow.md)。

## 项目结构

```text
frontend-to-agent/
├── .github/                 # PR 模板、PR CI 与 GitHub Pages 部署
├── docs/                    # 审核报告与 GitHub 协作规范
├── examples/knowledge-agent # 最终实战项目
├── src/app                  # Next.js 页面与视觉系统
├── src/components           # 课程、代码、图表组件
├── src/content              # 结构化课程内容与测试
└── tests/e2e                # 桌面与移动端关键路径
```

## 最终实战

```bash
cd examples/knowledge-agent
cp .env.example .env
npm install
docker compose up -d
npm run ingest
npm run check
npm run dev
```

完整环境变量与验证命令见 [`examples/knowledge-agent/README.md`](examples/knowledge-agent/README.md)。

## License

[MIT](LICENSE)
