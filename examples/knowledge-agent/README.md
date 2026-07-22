# Knowledge Agent（作品集）

Node.js / TypeScript 私有知识库 Agent：RAG 检索、持久会话、输出护栏、HITL 副作用确认与离线评估集。课程配套教程的**封顶实战项目**（规格 §6）。

English quick start:

```bash
cp .env.example .env
npm install
docker compose up -d
npm run ingest
npm run dev
```

Open `http://localhost:3000` or use the API examples in [`scripts/demo-paths.md`](scripts/demo-paths.md).

---

## 能力覆盖（Skills）

| 能力 | 本仓库体现 |
|------|------------|
| **S5** RAG | `ingest.ts`、`search_knowledge` 工具、`knowledge/` 文档 |
| **S6** 持久会话 | LangGraph `PostgresSaver` + `threadId`（`/api/chat`） |
| **S7** HITL | `src/notify-hitl.ts`、`src/hitl-routes.ts`（提议 → confirm/reject，内存 mock 发送） |
| **S10** 评估与护栏 | `eval/cases.json`、`src/eval-offline.test.ts`、`src/guardrail.ts`、`src/trajectory.ts` |
| **S11** API 边界 | `/api/chat` 校验与超时、`hitl-routes` 独立挂载说明；生产需网关鉴权/限流 |

---

## 毕业验收清单（≥8 项可勾选）

1. [ ] 本地 `docker compose up -d` + `npm run ingest` + `npm run dev` 可访问 UI/API  
2. [ ] 成功问答带 `[source: filename]` 引用（见 `scripts/demo-paths.md` 路径 1）  
3. [ ] 无证据问题拒答、不编造（路径 2 + `no_evidence` 评估用例）  
4. [ ] 注入/投毒短语被 `checkAnswer` 拦截（路径 3 + `knowledge/injection-poison-sample.md`）  
5. [ ] 不同 `threadId` 不互泄上下文：离线评估用 `assertThreadIsolation` 拦截外会话密钥回显（路径 4）  
6. [ ] HITL：`proposeNotify` → `confirm` 后才 mock 发送（`npm test` / HITL curl）  
7. [ ] 离线评估 ≥30 用例全绿：`npm test`  
8. [ ] `npm run check`（`tsc` + 测试）通过  
9. [ ] README 能单独作为面试作品说明（架构 + 成本 + 观测）  
10. [ ] CI 不调用付费模型（仅单元/离线评估）

---

## 目录要点

| 路径 | 说明 |
|------|------|
| `src/agent.ts` | LangGraph Agent + 系统提示（先检索、须引用、拒服从文档指令） |
| `src/guardrail.ts` | `checkAnswer`：注入、假 `sk-` 密钥、无引用事实句 |
| `src/notify-hitl.ts` | 通知副作用 HITL 门（同 L05 模式） |
| `src/hitl-routes.ts` | Hono 路由；可挂到 `server.ts` 而不影响离线测试 |
| `eval/cases.json` | ≥30 离线用例（success / no_evidence / injection / cross_thread） |
| `src/eval-offline.test.ts` | 合成回答 + 轨迹 `assertTrajectory` |
| `scripts/demo-paths.md` | 四条演示路径 + HITL curl |

`npm run ingest` 首次创建索引；集合已存在时拒绝覆盖。重建向量：

```bash
npm run ingest -- --reset
```

---

## 部署 / 观测 / 成本

- **部署**：容器内跑 Node `npm run start`（先 `npm run build`）；Postgres（checkpoint）、Qdrant（向量）、OpenAI 兼容 API 由环境变量配置（见 `.env.example`）。**必须在 API 网关**做认证、按租户限流，并把检索过滤绑定到服务端身份。  
- **观测**：记录 `threadId`、检索延迟、工具调用次数；对 `checkAnswer` 失败打指标（`reasons`）；HITL 提议/确认/拒绝审计日志。  
- **成本**：embedding + 聊天按 token 计费；`temperature: 0` 与检索 `limit` 控制开销；评估与 CI 使用 `eval-offline` **不调模型**。

`/api/chat` 含 45s 总超时与 `AbortSignal` 传播（`agent-run.ts`）。

---

## CI / 离线测试（无 OpenAI、无 Qdrant）

```bash
npm test
```

测试仅覆盖：超时、`format`、`guardrail`、`notify-hitl`、`hitl-routes`、**离线评估 harness**。不 import `server.ts` / `agent.ts`，避免拉起真实 Agent。

根仓库 `test:ci` 可纳入本包 `npm test`（M5 计划）。

---

## HITL 确认流（S7）

1. 副作用工具（如外发通知）调用 `HitlNotifyGate.proposeNotify` → `confirm_required` + `token`。  
2. 用户或 UI 调用 `confirm(proposalId, token)` 后才 `mock` 发送；`reject` 取消。  
3. 相同 `idempotencyKey` 重复 confirm 不重复发送。  

HTTP 形态见 `scripts/demo-paths.md`；`server.ts` 默认未挂载 HITL（避免测试 import 链依赖 DB），按 README 片段可选挂载。

---

## 离线评估（S10）

- 用例：`eval/cases.json`（字段：`id`, `query`, `category`, `expected`）。  
- 运行：`src/eval-offline.test.ts` 对**合成回答**与轨迹规则断言，证明 harness 可扩展为接 live runner。  
- 护栏：`checkAnswer`；轨迹：`assertTrajectory`（`mustIncludeTool` / `mustNotIncludeTool` / `maxSteps`）。

---

## 示例 API

```bash
curl -s http://localhost:3000/api/health
curl -s http://localhost:3000/api/chat \
  -H 'content-type: application/json' \
  -d '{"threadId":"demo","message":"严重事故多久内要建群？"}'
```

更多场景见 [`scripts/demo-paths.md`](scripts/demo-paths.md).
