# Frontend to Agent

面向 10 年以上前端工程师的 AI Agent 系统学习网站。课程以 Node.js、TypeScript、LangChain.js 和 LangGraph.js 为主线，从核心概念、Tool Calling、RAG、记忆与多 Agent，一直推进到可部署的个人知识库 Agent。

## 在线课程

GitHub Pages 部署完成后访问：

<https://ailian0206.github.io/frontend-to-agent/>

## 课程能力

- 11 章系统教程与 12 周核心学习计划
- 6 张 Mermaid 架构图
- 20 组代码示例，核心实验均注明依赖版本、验证方法与章节自检
- 章节搜索、学习进度持久化、代码一键复制
- 桌面三栏学习工作台与移动端目录抽屉
- `examples/knowledge-agent` 完整知识库 Agent 项目

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

## 项目结构

```text
frontend-to-agent/
├── .github/workflows/       # GitHub Pages 自动部署
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
