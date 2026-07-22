# Lab L01：结构化输出与 Prompt 版本回归

**能力 ID：** S1（结构化输出与 Schema 校验）  
**路径：** `examples/lab-l01-structured-output/`

## 目标

- 用 **Zod** 定义订单意图 `IntentSchema`，约束 `intent`、`orderId`、`missingFields`、`confidence`。
- 将模型返回的 JSON 字符串解析并校验，非法 JSON 或字段不合规时明确失败。
- 用 `hashPrompt` 为系统 Prompt 模板生成稳定版本号，**回归夹具（fixtures）** 与当前 Prompt 绑定；改 Prompt 未更新夹具时 CI 应失败。

本实验**不依赖** OpenAI、LangChain 或任何付费 API；全部为本地纯函数与 Vitest。

## 本地步骤

1. 确保 Node.js ≥ 20（推荐 22 LTS）。
2. 进入本目录并安装依赖：

   ```bash
   cd examples/lab-l01-structured-output
   npm install
   ```

3. 运行测试：

   ```bash
   npm test
   ```

4. 类型检查 + 测试（与 CI 一致）：

   ```bash
   npm run check
   ```

5. （可选）若你已在其它环境用真实模型生成 JSON，可将样例追加到 `src/regress.ts` 的 `REGRESSION_FIXTURES`，并确保 `promptVersion` 等于 `CURRENT_PROMPT_VERSION`。**不要**把 API Key 写入仓库或测试代码。

## CI / Mock 说明

- 流水线只执行 `npm run check`（`tsc --noEmit` + `vitest run`）。
- 测试使用 `REGRESSION_FIXTURES` 中的**静态 JSON 字符串**，模拟模型输出。
- **测试绝不会调用 OpenAI 或任何外部 LLM**；无网络、无 Key、无 `fetch` 到模型端点。
- 修改 `ORDER_TRIAGE_PROMPT` 会改变 `CURRENT_PROMPT_VERSION`；若夹具仍使用旧 `promptVersion`，`assertFixtureMatches` 会抛出「Prompt version mismatch」，迫使你在合并前更新 golden 数据。

## 验收清单

- [ ] `npm test` 在本目录全部通过。
- [ ] `npm run check` 通过（严格 TypeScript + 测试）。
- [ ] 能说明 `IntentSchema` 中 `intent` 枚举与 `orderId` 正则的含义。
- [ ] 能区分 `IntentParseError` 的 `invalid_json` 与 `schema` 两类失败。
- [ ] 理解 `hashPrompt` 与 `CURRENT_PROMPT_VERSION` 如何防止「悄悄改 Prompt 却未回归」。
- [ ] 确认本包 `package.json` 无 OpenAI / LangChain 依赖。

## 关键文件

| 文件 | 职责 |
|------|------|
| `src/order-schema.ts` | Zod schema 与 `parseIntentJson` |
| `src/prompt-version.ts` | `hashPrompt` |
| `src/regress.ts` | Prompt 模板、版本号、fixtures、`assertFixtureMatches` |

关联课程：站点章节 `lab-l01` / 技能 **S1**。
