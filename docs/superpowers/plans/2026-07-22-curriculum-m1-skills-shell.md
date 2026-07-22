# M1 岗位能力地图与三层内容骨架 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 上线岗位能力地图（S1–S11 / E1–E5），把现有课程迁成 `lesson`，侧栏按「课程 / 实验 / 选修 / 作品集」分组，并为后续 Lab/选修预留可导航占位条目。

**Architecture:** 在现有 `Chapter` 内容模型上增加 `kind` 与 `skills`；新增 `skills.ts` 单源能力地图；`CourseApp` 按 `kind` 分组导航；新增 `/skills` 静态页展示能力与课/Lab 关联。本里程碑不加厚正文、不新建可运行 Lab 包（属 M2+）。

**Tech Stack:** Next.js App Router static export、React 19、TypeScript、Vitest、Playwright、现有三栏 `CourseApp`。

**Spec:** `docs/superpowers/specs/2026-07-22-job-ready-curriculum-depth-design.md` §3、§4、§7、§8-M1

**Out of scope (M2–M5):** 课程加厚、L01–L08 实现、选修成文、作品集升级。

---

## File map

| File | Responsibility |
|---|---|
| `src/content/skills.ts` | 能力地图单源（id/title/proof/kind） |
| `src/content/types.ts` | `ContentKind`、`Chapter.kind`、`Chapter.skills` |
| `src/content/chapters.base.ts` + `src/content/chapters/*.ts` | 每章补 `kind`/`skills` |
| `src/content/placeholders.ts` | Lab/选修/作品集占位章（`comingSoon`） |
| `src/content/chapters/index.ts` | 组装 lesson + placeholders，统一编号 |
| `src/content/course-index.ts` | summary 含 kind/skills；按 kind 分组 |
| `src/components/CourseApp.tsx` | 侧栏四组导航 |
| `src/components/CoursePage.tsx` | 展示 skills 徽章；占位章提示 |
| `src/app/skills/page.tsx` | 能力地图页 |
| `src/app/sitemap.ts` | 加入 `/skills/` |
| `src/content/chapters.test.ts` | 模型与地图完整性测试 |
| `tests/e2e/course.spec.ts` | 导航分组与 skills 页 |
| `README.md` | 四层结构说明 |

---

### Task 1: 能力地图数据与类型（TDD）

**Files:**
- Create: `src/content/skills.ts`
- Modify: `src/content/types.ts`
- Modify: `src/content/chapters.test.ts`

- [ ] **Step 1: Write failing tests for skills catalog**

在 `src/content/chapters.test.ts` 追加：

```ts
import { skillMap, coreSkillIds, electiveSkillIds } from "./skills";

it("defines core skills S1–S11 and elective skills E1–E5", () => {
  expect(coreSkillIds).toEqual([
    "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11",
  ]);
  expect(electiveSkillIds).toEqual(["E1", "E2", "E3", "E4", "E5"]);
  expect(skillMap).toHaveLength(16);
  expect(new Set(skillMap.map((s) => s.id)).size).toBe(16);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `export PATH="$HOME/.nvm/versions/node/v22.22.1/bin:$PATH" && npx vitest run src/content/chapters.test.ts -t "defines core skills"`

Expected: FAIL — cannot find module `./skills` or export missing.

- [ ] **Step 3: Implement `skills.ts` and extend types**

`src/content/types.ts` 增加：

```ts
export type ContentKind = "lesson" | "lab" | "elective" | "capstone";

export type SkillId =
  | "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9" | "S10" | "S11"
  | "E1" | "E2" | "E3" | "E4" | "E5";

// On Chapter:
kind: ContentKind;
skills: SkillId[];
/** When true, body is a stub pointing to a future milestone. */
comingSoon?: boolean;
```

`src/content/skills.ts`：导出 `SkillDefinition { id, title, proof, group: "core" | "elective" }` 数组，文案与规格 §4 表一致；导出 `skillMap`、`coreSkillIds`、`electiveSkillIds`、`getSkill(id)`。

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/chapters.test.ts -t "defines core skills"`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/content/skills.ts src/content/types.ts src/content/chapters.test.ts
git commit -m "feat(content): 增加岗位能力地图单源数据"
```

---

### Task 2: 现有章迁移为 lesson 并挂 skills

**Files:**
- Modify: `src/content/chapters.base.ts`
- Modify: `src/content/chapters/prompt-structured.ts`
- Modify: `src/content/chapters/streaming-ui.ts`
- Modify: `src/content/chapters/human-in-the-loop.ts`
- Modify: `src/content/chapters/mcp-protocol.ts`
- Modify: `src/content/chapters/eval-security.ts`
- Modify: `src/content/chapters.test.ts`

**推荐 skills 映射（实现时逐章写入，勿留空数组）：**

| slug | skills |
|---|---|
| why-agent | S1 |
| core-concepts | S1, S3 |
| stack-setup | S1 |
| prompt-structured | S1 |
| first-agent | S2, S3 |
| tool-calling | S2 |
| streaming-ui | S4 |
| rag | S5 |
| memory | S6 |
| human-in-the-loop | S7 |
| multi-agent | S8 |
| mcp-protocol | S9 |
| deploy-observe | S11 |
| eval-security | S10 |
| capstone | S5, S10, S11 |
| roadmap | S1 |

- [ ] **Step 1: Write failing test — every chapter has kind+skills**

```ts
it("marks all assembled chapters as lessons with valid skill ids", () => {
  const ids = new Set(skillMap.map((s) => s.id));
  for (const chapter of chapters) {
    expect(chapter.kind).toBe("lesson"); // will fail until placeholders exist; temporarily assert kind present
    expect(chapter.skills.length).toBeGreaterThan(0);
    for (const skill of chapter.skills) expect(ids.has(skill)).toBe(true);
  }
});
```

先写成：`expect(["lesson","lab","elective","capstone"]).toContain(chapter.kind)` 且 skills 非空且 id 合法。对**当前仅有的课**在 Task 2 断言全部为 `kind: "lesson"`。

- [ ] **Step 2: Run test — expect FAIL**（缺 `kind`/`skills` 字段导致类型或运行失败）

Run: `npx vitest run src/content/chapters.test.ts -t "marks all assembled"`

- [ ] **Step 3: Add `kind: "lesson"` and `skills: [...]` to every existing chapter object**

在每个章节对象的 `track`/`tags` 附近写入字段。可用一次脚本辅助，但提交前人工核对上表。

- [ ] **Step 4: Fix TypeScript — `Omit<Chapter,"number">` 组装处必须含新必填字段**

Run: `npm run typecheck`

Expected: PASS

- [ ] **Step 5: Run unit tests**

Run: `npx vitest run src/content/chapters.test.ts`

Expected: PASS（含既有 8 个用例 + 新用例）

- [ ] **Step 6: Commit**

```bash
git add src/content/chapters.base.ts src/content/chapters src/content/chapters.test.ts
git commit -m "feat(content): 现有课程迁移为 lesson 并挂载 skills"
```

---

### Task 3: Lab / 选修 / 作品集占位条目

**Files:**
- Create: `src/content/placeholders.ts`
- Modify: `src/content/chapters/index.ts`
- Modify: `src/content/chapters.test.ts`

- [ ] **Step 1: Write failing test for placeholder kinds**

```ts
it("exposes lab, elective, and capstone placeholders for navigation", () => {
  const kinds = new Set(chapters.map((c) => c.kind));
  expect(kinds.has("lab")).toBe(true);
  expect(kinds.has("elective")).toBe(true);
  expect(kinds.has("capstone")).toBe(true);
  expect(chapters.filter((c) => c.comingSoon).length).toBeGreaterThanOrEqual(8);
});
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement placeholders**

创建 `placeholders.ts`，导出 `placeholderChapters: Omit<Chapter,"number">[]`，至少包含：

- Labs：`lab-l01` … `lab-l08`（shortTitle 用规格表主题，`comingSoon: true`，`kind: "lab"`，对应 skills，单节说明「M2+ 实现，当前为导航占位」）
- Electives：`elective-e1` … `elective-e5`
- Capstone：`capstone-portfolio`（可与现有 `capstone` lesson 并存：lesson 保留为课程说明，placeholder 指向作品集规格页语义；或将现有 `capstone` slug 的 `kind` 改为 `capstone` 并加厚提示——**推荐：现有 `capstone` 改为 `kind: "capstone"`，不再另造重复 slug**）

**推荐默认：**  
- 现有 `capstone` → `kind: "capstone"`（仍 `comingSoon: false`，保留现有正文作规格导读）  
- 新增 8 lab + 5 elective 占位  

`chapters/index.ts` 组装顺序：全部 lesson（除 capstone/roadmap 按现序）→ labs → electives → capstone → roadmap（roadmap 仍 lesson）。

编号继续 `map((c,i)=>({...c,number:i+1}))`。

- [ ] **Step 4: Run tests + typecheck**

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/content/placeholders.ts src/content/chapters/index.ts src/content/chapters.base.ts src/content/chapters.test.ts
git commit -m "feat(content): 增加 Lab/选修导航占位与 capstone kind"
```

---

### Task 4: 侧栏按 kind 四组导航

**Files:**
- Modify: `src/content/course-index.ts`
- Modify: `src/components/CourseApp.tsx`
- Modify: `src/app/globals.css`
- Modify: `tests/e2e/course.spec.ts`

- [ ] **Step 1: Add `groupChaptersByKind` and extend summaries**

```ts
export type ContentKindLabel = "课程" | "实验" | "选修" | "作品集";

export function kindLabel(kind: ContentKind): ContentKindLabel {
  switch (kind) {
    case "lesson": return "课程";
    case "lab": return "实验";
    case "elective": return "选修";
    case "capstone": return "作品集";
  }
}

export function groupChaptersByKind(items = chapterSummaries) {
  const order: ContentKind[] = ["lesson", "lab", "elective", "capstone"];
  return order
    .map((kind) => ({
      kind,
      label: kindLabel(kind),
      chapters: items.filter((c) => c.kind === kind),
    }))
    .filter((g) => g.chapters.length > 0);
}
```

`ChapterSummary` 增加 `kind`、`skills`、`comingSoon?: boolean`。

- [ ] **Step 2: Update CourseApp nav**

用 `groupChaptersByKind` 替换（或并列于）仅按 track 的列表：每个 kind 一组，组标题为「课程/实验/选修/作品集」；组内条目仍显示 number + shortTitle；`comingSoon` 条目可加「即将」标记。保留 track 信息在大纲侧栏。

资源库链接保持；新增链到 `/skills`（「能力地图」）。

- [ ] **Step 3: Write/adjust E2E**

```ts
test("groups navigation by content kind", async ({ page }) => {
  await page.goto("/");
  const openMenu = page.getByRole("button", { name: "打开课程目录" });
  if (await openMenu.isVisible()) await openMenu.click();
  await expect(page.getByText("课程", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("实验", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /能力地图/ })).toBeVisible();
});
```

（`/skills` 页在 Task 5 创建；本步可先链到 `#` 或等 Task 5 一并测。）

- [ ] **Step 4: Style `.kind-group` / `.coming-soon` 最小样式**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(ui): 侧栏按课程/实验/选修/作品集分组"
```

---

### Task 5: `/skills` 能力地图页

**Files:**
- Create: `src/app/skills/page.tsx`
- Create: `src/components/SkillsPage.tsx`（client，复用 CourseApp shell，无 activeChapter）
- Modify: `src/app/sitemap.ts`
- Modify: `tests/e2e/course.spec.ts`
- Modify: `README.md`

- [ ] **Step 1: SkillsPage lists all skills and linked chapters**

对每个 skill：标题、proof、链接到 `chapters.filter(c => c.skills.includes(id))` 的章节。

- [ ] **Step 2: Route + sitemap + nav link**

- [ ] **Step 3: E2E**

```ts
test("opens skills map", async ({ page }) => {
  await page.goto("/skills/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("能力地图");
  await expect(page.getByText("S1")).toBeVisible();
  await expect(page.getByText("E1")).toBeVisible();
});
```

- [ ] **Step 4: README 增加四层结构与 `/skills` 说明**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(skills): 上线岗位能力地图页"
```

---

### Task 6: CoursePage 展示 skills；占位章体验

**Files:**
- Modify: `src/components/CoursePage.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Header 增加 skills 徽章（链到 `/skills#S1` 等）**

- [ ] **Step 2: `comingSoon` 章顶部 callout：「本实验将在后续里程碑提供可运行仓库；当前可先学关联课程。」**

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(ui): 章节页展示 skills 与占位提示"
```

---

### Task 7: M1 门禁、分支与 PR

**Files:** 本计划涉及的全部文件

- [ ] **Step 1: 在隔离 worktree + 分支 `feat/curriculum-m1-skills-shell` 上完成 Tasks 1–6（若当前在 main 实现，合并前必须挪到功能分支）**

- [ ] **Step 2: 本地门禁**

Run:

```bash
export PATH="$HOME/.nvm/versions/node/v22.22.1/bin:$PATH"
nvm use 22
GITHUB_PAGES=true npm run test:ci
CI=true npm run test:e2e
git diff --check
```

Expected: 全绿。

- [ ] **Step 3: Push 并开唯一 PR（开放 PR 必须为 0）**

```bash
git push -u origin HEAD
gh pr create --title "feat: M1 能力地图与课/Lab/选修骨架" --body "$(cat <<'EOF'
## Summary
- 岗位能力地图 S1–S11 / E1–E5 与 `/skills` 页
- 内容模型增加 kind/skills；现有课迁为 lesson
- 侧栏四组导航；Lab/选修占位

## Test plan
- [x] GITHUB_PAGES=true npm run test:ci
- [x] CI=true npm run test:e2e
- [ ] 桌面/移动：侧栏可见课程/实验/选修/作品集
- [ ] /skills 展示能力与章节链接
- [ ] /resources 仍无「标记本章完成」

## Review
- 独立 Claude：待跑一次 `/codex-independent-pr-review`
EOF
)"
```

- [ ] **Step 4: 独立 Claude 审核恰好一次；修复不复审；CI 绿后 merge commit**

```bash
claude --permission-mode auto --model sonnet -p "/codex-independent-pr-review <PR编号>"
# 修复后：
gh pr merge <PR编号> --merge --delete-branch
```

---

## Spec coverage (M1 only)

| Spec item | Task |
|---|---|
| 四层 IA 导航 | T4 |
| 能力地图 S/E | T1, T5 |
| kind/skills 模型 | T1–T3 |
| 现有章迁 lesson | T2 |
| Lab/选修占位 | T3 |
| 里程碑 PR + 单次审核 | T7 |
| 加厚课 / 真 Lab / 作品集升级 | **不在 M1** → M2–M5 另开 plan |

## Follow-on plans (do not implement in this plan)

- M2: 加厚 S1–S4 + L01–L03  
- M3: 加厚 S5–S8 + L04–L06  
- M4: 加厚 S9–S11 + L07–L08 + 选修成文  
- M5: 作品集封顶  

---

## Self-review

- 无 TBD/TODO 占位步骤  
- 类型字段在 T1 定义，T2+ 一致使用 `kind`/`skills`/`comingSoon`  
- M1 可独立上线并让用户「看到变深的结构」，正文深度留给后续里程碑  
