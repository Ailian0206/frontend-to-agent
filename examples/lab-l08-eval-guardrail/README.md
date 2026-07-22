# Lab L08 — 评估与门禁

**能力：** S10（评估与安全）、S11（上线与成本）  
**关联课：** `eval-security`、`deploy-observe`

## 目标

用**纯 TypeScript** 搭三条上线前防线，全部可在 CI 里用 mock 数据跑通，**不调用任何付费模型或外部 HTTP API**：

1. **轨迹断言（S10）** — 对离线 `AgentStep[]` 做 `mustIncludeTool` / `mustNotIncludeTool` / `maxSteps` 规则校验。  
2. **输出护栏（S10）** — `checkOutput` 拦截提示注入话术、`sk-…` 类假密钥、可选手机号形态 PII。  
3. **API 门禁（S11）** — `checkRequest` 校验 API Key、按 IP 内存限流。

## 本地运行

```bash
cd examples/lab-l08-eval-guardrail
npm install
npm test
```

类型检查：

```bash
npm run check
```

**CI：** 根仓库 `test:examples` 会串联本子包；fixtures 均为内存字符串与固定轨迹，无网络依赖。

## 包结构

| 文件 | 说明 |
|------|------|
| `src/trajectory.ts` | `AgentStep`、`TrajectoryRule`、`assertTrajectory` |
| `src/guardrail.ts` | `checkOutput` 与护栏选项 |
| `src/api-gate.ts` | `checkRequest`、内存限流、`resetRateLimitStore` |
| `src/fixtures.ts` | 轨迹 / 文本 / 门禁配置样例 |
| `src/*.test.ts` | Vitest 单测 |

## 验收清单（≥5）

完成本 Lab 后，你应能勾选以下项（与 `npm test` 对齐）：

1. [ ] 合规轨迹通过 `assertTrajectory`（含必选 Tool、禁选 Tool、步数上限）
2. [ ] 缺少 `mustIncludeTool` 或出现 `mustNotIncludeTool` 时抛出 `TrajectoryAssertionError`
3. [ ] 正常回复通过 `checkOutput`；注入话术与 `sk-` 模式被拒绝
4. [ ] 开启 `checkPiiPhone` 时可识别手机号形态 PII
5. [ ] 缺少或错误的 API Key 被 `checkRequest` 拒绝
6. [ ] 同一 IP 超过 `rateLimitPerWindow` 后返回限流原因码

## 与 S10 / S11 课的对应

- **S10：** 用轨迹断言把「Agent 是否按规程调用 Tool」变成可回归测试；输出护栏是用户可见层的最后一道过滤。  
- **S11：** 门禁在进模型前先鉴权与限流，避免成本失控；单测用 `resetRateLimitStore` 与注入 `nowMs` 保证确定性。  
- 生产环境应把限流迁到 Redis / 网关，本 Lab 仅演示内存计数与失败分类字段（`reasons[]`）。
