# M2 加厚 S1–S4 课与 L01–L03 Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 S1–S4 对应主线课加厚到岗位深度标准，并交付可安装、可单测（CI mock、无付费模型）的 L01–L03 Lab 包，站点 Lab 章从占位变为可学入口。

**Architecture:** 课仍在 `src/content` 结构化正文中扩写；Lab 以 `examples/lab-l0x-*` 独立子包落地确定性逻辑 + Vitest；章增加 `relatedLabs` 链到 Lab slug；根 `test:ci` 串联三 Lab 的 `npm test`。

**Tech Stack:** Next.js 静态站内容模型、Zod、Vitest、TypeScript NodeNext 子包（Lab 不强制引入 LangChain，能说明契约即可；需要时用轻量类型）。

**Spec:** `docs/superpowers/specs/2026-07-22-job-ready-curriculum-depth-design.md` §4、§5、§8-M2

**Out of scope:** S5–S11 加厚、L04–L08、选修成文、作品集升级（M3–M5）。

---

## File map

| File | Responsibility |
|---|---|
| `src/content/types.ts` | `Chapter.relatedLabs?: string[]` |
| `src/content/chapters/prompt-structured.ts` | S1 加厚 |
| `src/content/chapters.base.ts` (`tool-calling`, `first-agent`) | S2 / S3 加厚 |
| `src/content/chapters/streaming-ui.ts` | S4 加厚 |
| `src/content/placeholders.ts` | L01–L03 去 `comingSoon`，写入实正文与仓库路径 |
| `src/components/CoursePage.tsx` | 展示 relatedLabs 链接 |
| `examples/lab-l01-structured-output/**` | L01 子包 |
| `examples/lab-l02-tool-contract/**` | L02 子包 |
| `examples/lab-l03-react-stream/**` | L03 子包 |
| `package.json` | `test:examples` 纳入 `test:ci` |
| `src/content/chapters.test.ts` | 深度门禁：S1–S4 必有 interview/failure/lab 相关块；L01–L03 非 comingSoon |
| `README.md` | M2 Lab 入口说明 |
| `tests/e2e/course.spec.ts` | Lab 章与 skills 关联可见 |

---

### Task 1: 数据模型与深度回归测试骨架

**Files:**
- Modify: `src/content/types.ts`
- Modify: `src/content/course-index.ts`（summary 透传 `relatedLabs`）
- Modify: `src/content/chapters.test.ts`

- [ ] **Step 1: 扩展类型**

```ts
/** Slugs of lab chapters that prove the skills taught here. */
relatedLabs?: string[];
```

- [ ] **Step 2: 写失败测试（M2 深度门禁）**

```ts
const m2Lessons = ["prompt-structured", "tool-calling", "first-agent", "streaming-ui"];
const m2Labs = ["lab-l01", "lab-l02", "lab-l03"];

it("deepens M2 lessons with decision, failure, interview, and lab links", () => {
  for (const slug of m2Lessons) {
    const chapter = chapters.find((c) => c.slug === slug)!;
    const text = chapter.sections.flatMap((s) => s.blocks).map(blockSearchText).join(" ");
    expect(text).toMatch(/何时用|何时不用/);
    expect(text).toMatch(/失败|调试/);
    expect(text).toMatch(/面试/);
    expect(chapter.relatedLabs?.length).toBeGreaterThan(0);
  }
});

it("ships L01–L03 labs as non-placeholder content with example paths", () => {
  for (const slug of m2Labs) {
    const chapter = chapters.find((c) => c.slug === slug)!;
    expect(chapter.comingSoon).toBeFalsy();
    expect(chapter.kind).toBe("lab");
    const text = chapter.sections.flatMap((s) => s.blocks).map(blockSearchText).join(" ");
    expect(text).toMatch(/examples\/lab-l0/);
    expect(chapter.sections.some((s) => s.blocks.some((b) => b.type === "checkpoint"))).toBe(true);
  }
});
```

- [ ] **Step 3: Run — expect FAIL**（相关字段/正文尚未加）

- [ ] **Step 4: Commit** `test(content): 增加 M2 深度门禁用例`

---

### Task 2: 加厚 S1 — `prompt-structured`

**Files:** Modify `src/content/chapters/prompt-structured.ts`

必含新/扩 section（可用现有 block 类型，勿改渲染器除非必要）：

1. **决策表**：何时用 Structured Output / 何时手写解析 / 何时不用 LLM  
2. **反例**：把业务规则塞进 Prompt 导致绕过  
3. **失败分类**：Schema 漂移、模型拒答、部分字段幻觉、版本未锁定  
4. **可运行代码**：保留并略扩 Zod + 版本 hash 思路（与 L01 对齐）  
5. **面试 3–5**：表头「追问 / 答纲」  
6. **自检 checkpoint**  
7. `relatedLabs: ["lab-l01"]`，`skills: ["S1"]`

中文正文（不含代码）目标 ≥2000 字量级：通过新增段落+表达成，勿灌水。

- [ ] **Step 1: 扩写并挂 relatedLabs**  
- [ ] **Step 2: 单测中该章门禁片段通过**  
- [ ] **Step 3: Commit** `feat(content): 加厚 S1 Prompt 与结构化输出课`

---

### Task 3: 加厚 S2 — `tool-calling`

**Files:** Modify `src/content/chapters.base.ts` 中 `tool-calling` 对象

对齐 L02：Schema、权限、超时、幂等、Dry Run、非法参数。

- [ ] 决策表 / 反例 / 失败分类 / 面试 / checkpoint / `relatedLabs: ["lab-l02"]`  
- [ ] Commit `feat(content): 加厚 S2 Tool 契约课`

---

### Task 4: 加厚 S3 — `first-agent`

**Files:** Modify `src/content/chapters.base.ts` 中 `first-agent`

对齐 S3 proof：循环与终止条件、何时不该上 ReAct；可提 LangGraph 状态图对照（不必整章迁 LangGraph API）。

- [ ] 决策表 / 反例（无终止条件死循环）/ 失败分类 / 面试 / checkpoint  
- [ ] `relatedLabs: ["lab-l03"]`（与 S4 共享 L03 可接受）  
- [ ] Commit `feat(content): 加厚 S3 ReAct 第一 Agent 课`

---

### Task 5: 加厚 S4 — `streaming-ui`

**Files:** Modify `src/content/chapters/streaming-ui.ts`

对齐事件协议、可取消、确认面板（可与 HITL 交叉引用但正文自洽）。

- [ ] 决策表 / 反例（只吐 token）/ 失败分类 / 面试 / checkpoint / `relatedLabs: ["lab-l03"]`  
- [ ] Commit `feat(content): 加厚 S4 流式与 Agent UI 课`

---

### Task 6: L01 子包 `examples/lab-l01-structured-output`

**Files:** Create package under `examples/lab-l01-structured-output/`

最小结构：

```
package.json  (type:module, vitest, zod, typescript)
tsconfig.json
vitest.config.mts
README.md     # 能力 S1、本地真跑（可选 OPENAI）、CI mock 说明、验收≥5
src/prompt-version.ts
src/order-schema.ts
src/regress.ts
src/*.test.ts
```

- 单测：合法/非法 JSON、schema 失败、prompt 版本 hash 变更导致 fixture 不匹配  
- **禁止**测试中调用 OpenAI  
- README 含：`npm test`、可选真跑步骤（标清需要 Key）

- [ ] `npm test` 在该目录通过  
- [ ] Commit `feat(lab): 增加 L01 结构化输出与 Prompt 版本回归`

---

### Task 7: L02 子包 `examples/lab-l02-tool-contract`

```
examples/lab-l02-tool-contract/
```

- `orderStatusTool`：Zod 入参、只读、dryRun、非法参数错误码  
- 单测覆盖缺字段、越权、超时模拟（`AbortSignal` 或 fake clock）  
- README：能力 S2、验收≥5

- [ ] Commit `feat(lab): 增加 L02 订单只读 Tool 契约`

---

### Task 8: L03 子包 `examples/lab-l03-react-stream`

```
examples/lab-l03-react-stream/
```

- `AgentEvent` 联合类型 + UI `reducer`  
- `runMockReactLoop`：纯函数步进，产出 `token` / `tool_start` / `tool_result` / `done` / `cancelled`  
- 单测：取消中途停止、确认面板事件顺序  
- README：能力 S3/S4、验收≥5

- [ ] Commit `feat(lab): 增加 L03 ReAct 与流式事件 UI 契约`

---

### Task 9: 站点 Lab 章替换占位

**Files:** `src/content/placeholders.ts`（或拆 `src/content/labs.ts`）

L01–L03：

- `comingSoon` 删除或 `false`  
- sections：目标、能力 ID、仓库路径、本地步骤、验收 checkpoint、关联课链接  
- 含可运行 code 块指向子包关键文件（摘录，非全文拷贝）

- [ ] M2 lab 门禁测试通过  
- [ ] Commit `feat(content): L01–L03 站点章改为可学入口`

---

### Task 10: UI、CI、README、E2E

**Files:**
- `CoursePage.tsx`：relatedLabs → `/chapter/{slug}` 链接行  
- `package.json`：

```json
"test:examples": "npm --prefix examples/lab-l01-structured-output test && npm --prefix examples/lab-l02-tool-contract test && npm --prefix examples/lab-l03-react-stream test",
"test:ci": "npm run lint && npm run typecheck && npm run test && npm run test:examples && npm run build"
```

注意：CI 需在跑 `test:examples` 前对三包 `npm ci`（或 `npm install`）。在 `test:examples` 脚本内先 install：

```bash
npm --prefix examples/lab-l01-structured-output ci && npm --prefix ... test
```

或 CI workflow 增加一步；优先自包含脚本。

- E2E：打开 `/chapter/lab-l01/` 可见验收/examples 路径；侧栏「实验」下 L01 无「即将」  
- README：增加 Labs 表与能力对应

- [ ] Commit `feat(ci): 串联 L01–L03 单测并展示 Lab 链接`

---

### Task 11: 门禁与里程碑 PR

- 分支：`feat/curriculum-m2-s1-s4-labs`  
- 本地：

```bash
export PATH="$HOME/.nvm/versions/node/v22.22.1/bin:$PATH"
GITHUB_PAGES=true npm run test:ci
CI=true npm run test:e2e
git diff --check
```

- 开唯一 PR → `claude --permission-mode auto --model sonnet -p "/codex-independent-pr-review <N>"` → 修问题不复审 → merge commit

---

## Spec coverage (M2)

| Spec | Task |
|---|---|
| S1–S4 课深度 §5.1 | T2–T5 |
| L01–L03 §5.2 | T6–T9 |
| CI 无付费模型 | T6–T8, T10 |
| 能力可点到课+Lab | T1, T9, T10 |
| M3+ | 不做 |

## Self-review

- Lab 保持小而可测，不复制 knowledge-agent 全家桶  
- 课加厚用既有 ContentBlock，避免无必要渲染器改造  
- `relatedLabs` 双向：课指 Lab；Lab 正文指回课 slug  
