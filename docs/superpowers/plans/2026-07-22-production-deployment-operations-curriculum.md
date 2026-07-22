# 生产部署与运维入门课程 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有三栏学习工作台中交付 14 课“生产部署与运维”专题，以中文解释 Vercel、Supabase、Inngest、Sentry 的日常操作，并用 24 张脱敏控制台截图和 `evidence-graph` 只读案例完成可验证教学。

**Architecture:** 继续使用 `Chapter` 与 `ContentBlock` 结构化内容链，在 `Chapter` 上增加可选专题引用，在 `ContentBlock` 上增加语义化截图块；课程按 overview、四个平台和 operations 六个文件拆分。导航仍先按内容形态分组，仅在 lesson 内增加“Agent 工程主线 / 生产部署与运维”二级组；路由、进度和 sitemap 继续使用全局章节序列。

**Tech Stack:** Next.js 16.2 App Router、React 19、strict TypeScript、Next Image（静态导出关闭运行时优化）、Vitest + Testing Library、Playwright、WebP 静态图片。

**Spec:** `docs/superpowers/specs/2026-07-22-production-deployment-operations-curriculum-design.md`

**Out of scope:** 官网逐页翻译、生产写操作、真实 Provider 调用、价格和免费额度硬编码、CMS、课程运行时外部服务。

---

## File map

| File | Responsibility |
| --- | --- |
| `src/content/types.ts` | 专题引用和 `screenshot` 内容块契约 |
| `src/content/taxonomy.ts` | `production-ops` 专题名称、视觉前缀和排序 |
| `src/content/course-index.ts` | 摘要携带专题信息，生成二级导航分组 |
| `src/content/chapters/index.ts` | 装配 P01-P14，并把截图图例纳入全文搜索 |
| `src/content/chapters/production-ops/overview.ts` | P01-P02 生产系统地图与巡检节奏 |
| `src/content/chapters/production-ops/vercel.ts` | P03-P04 Vercel 教程 |
| `src/content/chapters/production-ops/supabase.ts` | P05-P06 Supabase 教程 |
| `src/content/chapters/production-ops/inngest.ts` | P07-P08 Inngest 教程 |
| `src/content/chapters/production-ops/sentry.ts` | P09-P10 Sentry 教程 |
| `src/content/chapters/production-ops/operations.ts` | P11-P14 发布、故障、安全成本与综合实践 |
| `src/content/chapters/production-ops/index.ts` | 按 P01-P14 导出专题课程并断言顺序 |
| `src/components/AnnotatedScreenshot.tsx` | 语义化图片、真实/示意标记、记录日期、图例和来源 |
| `src/components/ContentRenderer.tsx` | 分派 `screenshot` 内容块 |
| `src/components/CourseApp.tsx` | lesson 二级分组和 P01-P14 导航编号 |
| `src/components/CoursePage.tsx` | 章节标题区显示专题编号 |
| `src/app/globals.css` | 专题导航和截图响应式样式 |
| `src/content/resources.ts` | 四个平台当前官方文档目录 |
| `public/course/production-ops/{platform}/*.webp` | 24 张脱敏、标注、压缩后的最终截图 |
| `src/content/chapters.test.ts` | 专题、内容、图片、资源、搜索与顺序契约 |
| `src/components/AnnotatedScreenshot.test.tsx` | 截图语义与路径测试 |
| `tests/e2e/course.spec.ts` | 二级导航、搜索、深链、图片和移动端行为 |
| `README.md` | 课程总量和生产运维专题说明 |

---

### Task 1: 建立专题与截图内容契约

**Files:**
- Modify: `src/content/types.ts`
- Modify: `src/content/taxonomy.ts`
- Modify: `src/content/course-index.ts`
- Modify: `src/content/chapters/index.ts`
- Modify: `src/content/chapters.test.ts`

- [ ] **Step 1: 先写专题分组和截图搜索 RED 测试**

在 `src/content/chapters.test.ts` 增加最小合成章节，断言专题元数据进入摘要、导航组和搜索文本：

```ts
import { groupChaptersByKind, summarizeChapter } from "./course-index";
import type { Chapter, ContentBlock } from "./types";

const screenshot: ContentBlock = {
  type: "screenshot",
  src: "/course/production-ops/vercel/deployments.webp",
  alt: "Vercel Deployments 页面，标出状态和提交版本",
  title: "从 Deployments 确认线上版本",
  capturedAt: "2026-07-22",
  imageKind: "real",
  width: 1440,
  height: 900,
  legend: [
    { label: "1", title: "Status（状态）", detail: "Ready 表示构建和发布完成。" },
  ],
  sourceUrl: "https://vercel.com/docs/deployments",
};

it("carries production topic metadata into summaries and navigation", () => {
  const chapter = {
    ...chapters[0],
    slug: "production-test",
    series: { id: "production-ops", order: 1 },
  } satisfies Chapter;
  expect(summarizeChapter(chapter).series).toEqual({ id: "production-ops", order: 1 });
  const lesson = groupChaptersByKind([summarizeChapter(chapter)])[0];
  expect(lesson.subgroups?.[0]).toMatchObject({ id: "production-ops", label: "生产部署与运维" });
});

it("indexes screenshot title, alt text, legend, and source", () => {
  expect(blockSearchText(screenshot)).toContain("Status（状态） Ready");
  expect(blockSearchText(screenshot)).toContain("Vercel Deployments");
});
```

- [ ] **Step 2: 运行聚焦测试确认 RED**

Run: `PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH npm test -- src/content/chapters.test.ts`

Expected: TypeScript/Vitest 因 `series`、`screenshot` 和 `subgroups` 尚不存在而失败。

- [ ] **Step 3: 实现最小类型和专题目录**

在 `src/content/types.ts` 增加：

```ts
export type ChapterSeriesId = "production-ops";

export interface ChapterSeriesRef {
  id: ChapterSeriesId;
  order: number;
}

export interface ScreenshotLegendItem {
  label: string;
  title: string;
  detail: string;
}

// Add to ContentBlock union.
| {
    type: "screenshot";
    src: string;
    alt: string;
    title: string;
    capturedAt: string;
    imageKind: "real" | "illustration";
    width: number;
    height: number;
    legend: ScreenshotLegendItem[];
    sourceUrl?: string;
  };

// Add to Chapter.
series?: ChapterSeriesRef;
```

在 `src/content/taxonomy.ts` 增加唯一专题目录：

```ts
export const chapterSeries = [
  {
    id: "production-ops" as const,
    label: "生产部署与运维",
    prefix: "P",
    summary: "从生产系统地图到四平台日常运维与故障定位。",
  },
];
```

- [ ] **Step 4: 让摘要、二级分组和搜索消费新契约**

`ChapterSummary` 增加 `series?: ChapterSeriesRef`；`summarizeChapter` 原样传递。`KindChapterGroup` 增加以下可选结构：

```ts
export interface ChapterSubgroup {
  id: "core-lessons" | ChapterSeriesId;
  label: string;
  chapters: ChapterSummary[];
}

export interface KindChapterGroup {
  kind: ContentKind;
  label: ContentKindLabel;
  chapters: ChapterSummary[];
  subgroups?: ChapterSubgroup[];
}
```

lesson 分组先输出无 `series` 的“Agent 工程主线”，再按 `chapterSeries` 输出专题，并按 `series.order` 排序；lab/elective/capstone 保持原结构。`blockSearchText` 的新分支返回标题、替代文字、日期、图例和来源链接拼接文本。

- [ ] **Step 5: 验证 GREEN 并提交**

Run: `PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH npm test -- src/content/chapters.test.ts`

Expected: PASS，现有 18 项内容契约无回归，新测试通过。

```bash
git add src/content/types.ts src/content/taxonomy.ts src/content/course-index.ts src/content/chapters/index.ts src/content/chapters.test.ts
git commit -m "feat(content): 建立生产运维专题与截图契约"
```

### Task 2: 渲染标注截图和专题二级导航

**Files:**
- Create: `src/components/AnnotatedScreenshot.tsx`
- Create: `src/components/AnnotatedScreenshot.test.tsx`
- Modify: `src/components/ContentRenderer.tsx`
- Modify: `src/components/CourseApp.tsx`
- Modify: `src/components/CoursePage.tsx`
- Modify: `src/app/globals.css`
- Modify: `tests/e2e/course.spec.ts`

- [ ] **Step 1: 写截图语义 RED 测试**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnnotatedScreenshot } from "./AnnotatedScreenshot";

describe("AnnotatedScreenshot", () => {
  it("renders a labelled figure with dated legend and source", () => {
    render(
      <AnnotatedScreenshot
        src="/course/production-ops/vercel/deployments.webp"
        alt="Vercel 部署列表"
        title="确认线上版本"
        capturedAt="2026-07-22"
        imageKind="real"
        width={1440}
        height={900}
        legend={[{ label: "1", title: "Status（状态）", detail: "Ready 表示发布完成。" }]}
        sourceUrl="https://vercel.com/docs/deployments"
      />,
    );
    expect(screen.getByRole("figure")).toHaveAccessibleName("确认线上版本");
    expect(screen.getByRole("img", { name: "Vercel 部署列表" })).toBeInTheDocument();
    expect(screen.getByText("真实界面")).toBeInTheDocument();
    expect(screen.getByText("记录于 2026-07-22")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "查看官方说明" })).toHaveAttribute(
      "href",
      "https://vercel.com/docs/deployments",
    );
  });
});
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH npm test -- src/components/AnnotatedScreenshot.test.tsx`

Expected: FAIL，组件模块尚不存在。

- [ ] **Step 3: 实现语义化截图组件**

组件使用 `next/image`、`figure`、`figcaption` 和 `ol`。根据 `process.env.GITHUB_PAGES === "true"` 给图片 `src` 加 `/frontend-to-agent` 前缀，遵守 Next.js 16 `basePath` 图片要求；图片显式给出 width/height、`sizes="(max-width: 760px) 100vw, 820px"` 和 `style={{ width: "100%", height: "auto" }}`。`imageKind` 映射为“真实界面”或“示意图”，来源链接使用 `target="_blank" rel="noreferrer"`。

- [ ] **Step 4: 接入渲染与专题导航**

`ContentRenderer` 的 `screenshot` 分支直接渲染 `<AnnotatedScreenshot {...block} />`。`CourseApp` 对存在 `subgroups` 的 lesson 组渲染 `.lesson-subgroup`；导航编号使用：

```ts
function chapterDisplayNumber(chapter: ChapterSummary): string {
  return chapter.series
    ? `P${String(chapter.series.order).padStart(2, "0")}`
    : String(chapter.number).padStart(2, "0");
}
```

`CoursePage` 标题区同样显示 P 序号；全局上一章、下一章和进度算法保持不变。

- [ ] **Step 5: 增加紧凑、响应式样式**

`.annotated-screenshot` 使用最大 5px 圆角、固定 `aspect-ratio` 图片容器、非卡片嵌套布局；图例采用两列网格，390px 下改为单列。`.lesson-subgroup` 只增加分段标题和缩进，不把整个导航包成卡片。长英文通过 `overflow-wrap: anywhere`，不得扩大 240px 左栏宽度。

- [ ] **Step 6: 写专题导航 E2E RED/GREEN**

先增加以下断言并确认缺少 P01 链接时失败；Task 3 添加内容后再运行至 GREEN：

```ts
test("groups production operations lessons under a secondary nav", async ({ page }) => {
  await page.goto("/chapter/deploy-observe/");
  const openMenu = page.getByRole("button", { name: "打开课程目录" });
  if (await openMenu.isVisible()) await openMenu.click();
  await expect(page.getByText("Agent 工程主线", { exact: true })).toBeVisible();
  await expect(page.getByText("生产部署与运维", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /P01.*托管生产系统地图/ })).toHaveAttribute(
    "aria-current",
    "page",
  );
});
```

- [ ] **Step 7: 验证组件 GREEN 并提交**

Run: `PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH npm test -- src/components/AnnotatedScreenshot.test.tsx src/content/chapters.test.ts`

Expected: 组件和内容聚焦测试通过；专题 E2E 暂不运行，等待真实章节装配。

```bash
git add src/components/AnnotatedScreenshot.tsx src/components/AnnotatedScreenshot.test.tsx src/components/ContentRenderer.tsx src/components/CourseApp.tsx src/components/CoursePage.tsx src/app/globals.css tests/e2e/course.spec.ts
git commit -m "feat(ui): 渲染标注截图与专题导航"
```

### Task 3: 交付 P01-P02 和专题装配

**Files:**
- Create: `src/content/chapters/production-ops/overview.ts`
- Create: `src/content/chapters/production-ops/index.ts`
- Modify: `src/content/chapters.base.ts`
- Modify: `src/content/chapters/index.ts`
- Modify: `src/content/chapters.test.ts`

- [ ] **Step 1: 写 P01-P02 顺序与内容 RED 测试**

```ts
const productionOps = chapters.filter((chapter) => chapter.series?.id === "production-ops");
expect(productionOps.map((chapter) => chapter.slug)).toEqual([
  "deploy-observe",
  "production-inspection-rhythm",
]);
expect(productionOps.map((chapter) => chapter.series?.order)).toEqual([1, 2]);
expect(productionOps.every((chapter) => chapter.kind === "lesson")).toBe(true);
expect(productionOps.every((chapter) => chapter.track === "工程上线")).toBe(true);
expect(productionOps.every((chapter) => !chapter.comingSoon)).toBe(true);

for (const slug of ["deploy-observe", "production-inspection-rhythm"]) {
  const chapter = productionOps.find((item) => item.slug === slug)!;
  const text = chapter.sections.flatMap((section) => section.blocks).map(blockSearchText).join(" ");
  expect(text).toMatch(/只读|普通变更|高风险/);
  expect(text).toMatch(/发布后|每日|每周|每月|故障/);
  expect(chapter.sections.some((section) => section.blocks.some((block) => block.type === "checkpoint"))).toBe(true);
}
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH npm test -- src/content/chapters.test.ts`

Expected: FAIL，专题数组为空。

- [ ] **Step 3: 编写 P01-P02 完整正文**

P01 至少包含：浏览器→Vercel→Supabase/Auth→Inngest→Sentry Mermaid 拓扑、Development/Preview/Production 对比表、四平台职责边界、变量流向、`evidence-graph` 只读案例、停止条件和自检。P02 至少包含：发布后/每日/每周/每月/故障节奏、正常/可疑/需处理信号、三级风险矩阵、10 分钟个人项目巡检记录模板、误区和自检。

两个章节统一使用：

```ts
series: { id: "production-ops", order: 1 }, // P02 uses order: 2
kind: "lesson",
track: "工程上线",
skills: ["S11", "E2", "E3", "E4"],
duration: "35–45 分钟",
```

- [ ] **Step 4: 装配 P01-P02 并固定最终 slug 契约**

`productionOpsChapters` 本任务只导出 P01-P02；后续任务每次只追加已经完成正文和测试的课程。最终顺序固定为：

```ts
[
  "deploy-observe",
  "production-inspection-rhythm",
  "vercel-core-operations",
  "vercel-release-observability",
  "supabase-database-migrations",
  "supabase-auth-rls-recovery",
  "inngest-events-functions-runs",
  "inngest-retries-concurrency-cost",
  "sentry-issues-releases-sourcemaps",
  "sentry-traces-alerts-privacy",
  "release-checks-rollback",
  "cross-platform-incident-response",
  "production-security-cost-recovery",
  "observable-production-practicum",
]
```

删除 `chapters.base.ts` 中旧 `deploy-observe` 对象，由新 P01 接管原 slug，避免产生未装配的历史正文；capstone/roadmap 索引随删除后调整。P01-P02 插入原 `deploy-observe` 所在全局位置，因此旧深链、上一章/下一章和 sitemap 都能立即验证。

- [ ] **Step 5: 验证 GREEN、路由和导航并提交**

Run:

```bash
PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH npm test -- src/content/chapters.test.ts
PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH npx playwright test tests/e2e/course.spec.ts --grep "secondary nav"
```

Expected: 内容测试和桌面/移动专题导航测试通过，`/chapter/deploy-observe/` 深链继续有效，P02 位于 P01 之后。

```bash
git add src/content/chapters.base.ts src/content/chapters/index.ts src/content/chapters.test.ts src/content/chapters/production-ops
git commit -m "feat(content): 增加生产系统地图与巡检课程"
```

### Task 4: 采集并交付 Vercel P03-P04

**Files:**
- Create: `public/course/production-ops/vercel/deployments.webp`
- Create: `public/course/production-ops/vercel/deployment-detail.webp`
- Create: `public/course/production-ops/vercel/build-logs.webp`
- Create: `public/course/production-ops/vercel/environment-variables.webp`
- Create: `public/course/production-ops/vercel/runtime-logs.webp`
- Create: `public/course/production-ops/vercel/analytics-usage.webp`
- Create: `src/content/chapters/production-ops/vercel.ts`
- Modify: `src/content/chapters/production-ops/index.ts`
- Modify: `src/content/resources.ts`
- Modify: `src/content/chapters.test.ts`

- [ ] **Step 1: 增加平台课完整性 RED 测试**

为 P03-P10 共用以下契约，本任务先让 Vercel 两课失败：

```ts
const platformLessons = productionOps.slice(2, 10);
for (const chapter of platformLessons) {
  const blocks = chapter.sections.flatMap((section) => section.blocks);
  const text = blocks.map(blockSearchText).join(" ");
  expect(text).toMatch(/是什么|职责|不负责/);
  expect(text).toMatch(/正常|异常/);
  expect(text).toMatch(/只读|普通变更|高风险/);
  expect(text).toContain("Evidence Graph");
  expect(blocks.filter((block) => block.type === "screenshot").length).toBeGreaterThanOrEqual(3);
  expect(blocks.some((block) => block.type === "resources")).toBe(true);
  expect(blocks.some((block) => block.type === "checkpoint")).toBe(true);
}
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH npm test -- src/content/chapters.test.ts`

Expected: FAIL，Vercel 章节尚未装配。

- [ ] **Step 3: 只读采集并脱敏 6 张截图**

使用已授权登录态，只查看 `evidence-graph` 控制台；原图放在仓库外临时目录。每张成品逐项检查并遮挡邮箱、账号/组织、项目 ID、内部域名、环境变量值、真实请求/错误正文和费用细节；输出 WebP 后删除原图。环境变量截图只保留变量名的教学示例，所有值完全遮挡。

- [ ] **Step 4: 编写 P03-P04 完整正文**

P03 覆盖 Account/Team、Project、Deployment、Environment、Domain、GitHub 导入、Build Logs/Runtime Logs、环境变量作用域和状态术语。P04 覆盖自动部署、Redeploy/Promote/Rollback 差异、Analytics/Usage/Logs、发布后验收、构建失败、Ready 但页面报错和异常流量。每课放入 3 个截图块、风险标识、Evidence Graph 只读案例、英文术语表、误区、停止条件、自检和官方资源。

- [ ] **Step 5: 验证 GREEN、图片存在和隐私扫描并提交**

Run:

```bash
PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH npm test -- src/content/chapters.test.ts
find public/course/production-ops/vercel -name '*.webp' | sort
rg -n "@|SUPABASE_SERVICE_ROLE_KEY|SENTRY_AUTH_TOKEN|INNGEST_SIGNING_KEY|https://.*supabase.co" public/course/production-ops/vercel src/content/chapters/production-ops/vercel.ts
```

Expected: 测试通过，正好 6 张 WebP；文本扫描不出现邮箱、密钥名对应值或私有项目地址。

```bash
git add public/course/production-ops/vercel src/content/chapters/production-ops/vercel.ts src/content/chapters/production-ops/index.ts src/content/resources.ts src/content/chapters.test.ts
git commit -m "feat(content): 增加 Vercel 中文运维课程"
```

### Task 5: 采集并交付 Supabase P05-P06

**Files:**
- Create: `public/course/production-ops/supabase/project-overview.webp`
- Create: `public/course/production-ops/supabase/table-editor.webp`
- Create: `public/course/production-ops/supabase/sql-editor.webp`
- Create: `public/course/production-ops/supabase/auth-providers.webp`
- Create: `public/course/production-ops/supabase/rls-policies.webp`
- Create: `public/course/production-ops/supabase/logs-backups.webp`
- Create: `src/content/chapters/production-ops/supabase.ts`
- Modify: `src/content/chapters/production-ops/index.ts`
- Modify: `src/content/resources.ts`
- Modify: `src/content/chapters.test.ts`

- [ ] **Step 1: 运行平台完整性测试确认 Supabase RED**

Run: `PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH npm test -- src/content/chapters.test.ts`

Expected: FAIL，P05/P06 尚未装配。

- [ ] **Step 2: 只读采集并脱敏 6 张截图**

只读进入 Production 项目。表格与 SQL 截图不得显示真实行、查询结果或研究正文；Auth 不显示用户；Project ref、URL、邮箱、Provider client ID、密钥、连接串全部遮挡。备份页只保留状态和入口，不展示下载链接。

- [ ] **Step 3: 编写 P05-P06 完整正文**

P05 覆盖 Project/Postgres/Schema/Table/SQL Editor/Migration、只读表数据与 SQL、迁移链和数据库健康；强调“仓库迁移是事实来源，控制台不是随手改生产表的地方”。P06 覆盖 Auth User/Provider/Redirect/Session/RLS、Logs/Backups/API Keys、publishable 与 service role 边界、登录失败与权限拒绝、RLS 泄漏风险和恢复准备度。

- [ ] **Step 4: 验证 GREEN、图片和隐私后提交**

Run:

```bash
PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH npm test -- src/content/chapters.test.ts
test "$(find public/course/production-ops/supabase -name '*.webp' | wc -l | tr -d ' ')" = "6"
git diff --check
```

```bash
git add public/course/production-ops/supabase src/content/chapters/production-ops/supabase.ts src/content/chapters/production-ops/index.ts src/content/resources.ts src/content/chapters.test.ts
git commit -m "feat(content): 增加 Supabase 中文运维课程"
```

### Task 6: 采集并交付 Inngest P07-P08

**Files:**
- Create: `public/course/production-ops/inngest/apps-functions.webp`
- Create: `public/course/production-ops/inngest/events.webp`
- Create: `public/course/production-ops/inngest/runs.webp`
- Create: `public/course/production-ops/inngest/run-steps.webp`
- Create: `public/course/production-ops/inngest/replay-concurrency.webp`
- Create: `public/course/production-ops/inngest/usage.webp`
- Create: `src/content/chapters/production-ops/inngest.ts`
- Modify: `src/content/chapters/production-ops/index.ts`
- Modify: `src/content/resources.ts`
- Modify: `src/content/chapters.test.ts`

- [ ] **Step 1: 运行平台完整性测试确认 Inngest RED**

Run: `PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH npm test -- src/content/chapters.test.ts`

Expected: FAIL，P07/P08 尚未装配。

- [ ] **Step 2: 只读采集并脱敏 6 张截图**

事件 payload、run input/output、用户和项目标识、event/run ID 完全遮挡；保留 App/Function/Run/Step 层级、状态、耗时和通用控制入口。不得点击 Replay/Rerun/Cancel 或改变并发配置。

- [ ] **Step 3: 编写 P07-P08 完整正文**

P07 覆盖 App/Event/Function/Run/Step、同步应用、查看事件与步骤、状态词和长任务边界。P08 覆盖 Retry、Replay/Rerun、Cancel、Concurrency、Throttle、重复副作用、失败率/耗时/积压/Usage、幂等键和不可重试错误；明确重放属于练习环境普通变更，生产需确认副作用。

- [ ] **Step 4: 验证 GREEN、图片和隐私后提交**

Run:

```bash
PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH npm test -- src/content/chapters.test.ts
test "$(find public/course/production-ops/inngest -name '*.webp' | wc -l | tr -d ' ')" = "6"
git diff --check
```

```bash
git add public/course/production-ops/inngest src/content/chapters/production-ops/inngest.ts src/content/chapters/production-ops/index.ts src/content/resources.ts src/content/chapters.test.ts
git commit -m "feat(content): 增加 Inngest 中文运维课程"
```

### Task 7: 采集并交付 Sentry P09-P10

**Files:**
- Create: `public/course/production-ops/sentry/issues.webp`
- Create: `public/course/production-ops/sentry/issue-detail.webp`
- Create: `public/course/production-ops/sentry/event-stack.webp`
- Create: `public/course/production-ops/sentry/traces.webp`
- Create: `public/course/production-ops/sentry/alerts.webp`
- Create: `public/course/production-ops/sentry/usage-privacy.webp`
- Create: `src/content/chapters/production-ops/sentry.ts`
- Modify: `src/content/chapters/production-ops/index.ts`
- Modify: `src/content/resources.ts`
- Modify: `src/content/chapters.test.ts`

- [ ] **Step 1: 运行平台完整性测试确认 Sentry RED**

Run: `PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH npm test -- src/content/chapters.test.ts`

Expected: FAIL，P09/P10 尚未装配。

- [ ] **Step 2: 只读采集并脱敏 6 张截图**

Issue title、stack frame 中的私有路径、请求 URL、用户/IP、breadcrumbs、release SHA、DSN、组织与项目标识全部遮挡；若生产尚无真实 Issue，使用当前空状态截图并以公开官方示例裁剪补充，标题明确“官方示例”而不伪装为生产事件。不得制造生产异常。

- [ ] **Step 3: 编写 P09-P10 完整正文**

P09 覆盖 Project/Issue/Event/Release/Stack Trace、环境与版本、Source Map、新问题/回归/重复/已解决。P10 覆盖 Trace/Transaction/Span、Alert、过滤/采样、PII 清理、额度、噪声与趋势，并写出与 Vercel Logs、Supabase Logs、Inngest Runs 的互补边界。

- [ ] **Step 4: 验证 GREEN、图片和隐私后提交**

Run:

```bash
PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH npm test -- src/content/chapters.test.ts
test "$(find public/course/production-ops/sentry -name '*.webp' | wc -l | tr -d ' ')" = "6"
git diff --check
```

```bash
git add public/course/production-ops/sentry src/content/chapters/production-ops/sentry.ts src/content/chapters/production-ops/index.ts src/content/resources.ts src/content/chapters.test.ts
git commit -m "feat(content): 增加 Sentry 中文运维课程"
```

### Task 8: 交付 P11-P14 联合运维与综合实践

**Files:**
- Create: `src/content/chapters/production-ops/operations.ts`
- Modify: `src/content/chapters/production-ops/index.ts`
- Modify: `src/content/chapters.test.ts`
- Modify: `README.md`

- [ ] **Step 1: 写跨平台教学模型 RED 测试**

```ts
for (const slug of [
  "release-checks-rollback",
  "cross-platform-incident-response",
  "production-security-cost-recovery",
  "observable-production-practicum",
]) {
  const chapter = productionOps.find((item) => item.slug === slug)!;
  const blocks = chapter.sections.flatMap((section) => section.blocks);
  const text = blocks.map(blockSearchText).join(" ");
  expect(text).toMatch(/Vercel/);
  expect(text).toMatch(/Supabase/);
  expect(text).toMatch(/Inngest/);
  expect(text).toMatch(/Sentry/);
  expect(text).toMatch(/停止|不要继续/);
  expect(blocks.some((block) => block.type === "checkpoint")).toBe(true);
}
expect(blockSearchText(
  productionOps.find((item) => item.slug === "cross-platform-incident-response")!
    .sections.flatMap((section) => section.blocks)
    .find((block) => block.type === "diagram")!,
)).toMatch(/打不开|登录失败|数据异常|任务卡住|页面报错/);
```

- [ ] **Step 2: 运行测试确认 RED**

Run: `PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH npm test -- src/content/chapters.test.ts`

Expected: FAIL，P11-P14 尚未装配。

- [ ] **Step 3: 编写 P11-P13**

P11 交付发布前/发布后清单、变量/迁移/回调/兼容性、版本核对、关键路径与任务、Redeploy/修复/Rollback 决策表和发布记录模板。P12 交付五类症状 Mermaid 故障树、时间/版本/requestId/runId 证据关联、排除信号、记录/修复/回滚/停止决策。P13 交付公开变量与机密、最小权限、轮换触发、Usage/预算、备份与恢复演练、个人项目周检/月检。

- [ ] **Step 4: 编写 P14 独立练习环境步骤**

按固定阶段编写：

```text
1. 新建独立 GitHub 练习仓库，不复用 evidence-graph 生产资源
2. 创建练习 Supabase 项目并只应用课程内最小迁移
3. 导入 Vercel Preview，分环境设置公开变量与服务端机密
4. 同步一个无外部 Provider 的 Inngest hello-run 函数
5. 接入 Sentry，并只在练习环境触发受控错误
6. 验证部署、登录回调、数据库读写、Run 步骤和 Issue/Trace
7. 填写发布记录、故障证据和清理清单
```

每一步写明预期输出、失败时先看哪里、风险等级和完成标准；所有 Provider 使用 fixture，不要求真实 OpenAI/Tavily 调用。

- [ ] **Step 5: 验证 GREEN 并提交**

Run: `PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH npm test -- src/content/chapters.test.ts`

Expected: 所有 14 课内容契约通过，P11-P14 均包含完整正文和验收标准。

```bash
git add src/content/chapters/production-ops/operations.ts src/content/chapters/production-ops/index.ts src/content/chapters.test.ts README.md
git commit -m "feat(content): 完成联合运维与部署实践课程"
```

### Task 9: 完整 E2E、静态导出、视觉与隐私验收

**Files:**
- Modify: `tests/e2e/course.spec.ts`
- Modify: `src/app/globals.css`
- Modify: `src/content/chapters.test.ts`
- Modify: `docs/superpowers/plans/2026-07-22-production-deployment-operations-curriculum.md`

- [ ] **Step 1: 补齐搜索、深链和截图 E2E**

先在 `src/content/chapters.test.ts` 增加最终课程数量与顺序契约：

```ts
const productionOps = chapters.filter((chapter) => chapter.series?.id === "production-ops");
expect(productionOps).toHaveLength(14);
expect(productionOps.map((chapter) => chapter.series?.order)).toEqual(
  Array.from({ length: 14 }, (_, index) => index + 1),
);
expect(chapters).toHaveLength(42);
expect(new Set(productionOps.map((chapter) => chapter.slug)).size).toBe(14);
```

随后补齐浏览器行为：

```ts
test("searches production platforms and renders annotated screenshots", async ({ page }) => {
  await page.goto("/chapter/vercel-core-operations/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Vercel");
  await expect(page.getByRole("figure", { name: /Deployments/ }).first()).toBeVisible();
  await expect(page.getByText("记录于 2026-07-22").first()).toBeVisible();
  await page.getByRole("button", { name: "搜索课程" }).first().click();
  await page.getByRole("textbox", { name: "搜索关键词" }).fill("Replay");
  await expect(page.getByRole("dialog").getByRole("link", { name: /Inngest/ }).first()).toBeVisible();
});

test("keeps production screenshots within the viewport", async ({ page }) => {
  await page.goto("/chapter/supabase-auth-rls-recovery/");
  await page.locator(".annotated-screenshot").first().scrollIntoViewIfNeeded();
  await expect(page.locator(".annotated-screenshot img").first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
```

- [ ] **Step 2: 运行聚焦 E2E 并修到 GREEN**

Run: `PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH npx playwright test tests/e2e/course.spec.ts --grep "production|annotated|secondary nav"`

Expected: desktop/mobile 全部通过；浏览器控制台无图片 404 和 React hydration 错误。

- [ ] **Step 3: 验证 24 张图片与静态导出路径**

Run:

```bash
test "$(find public/course/production-ops -name '*.webp' | wc -l | tr -d ' ')" = "24"
PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH GITHUB_PAGES=true npm run build
test -f out/frontend-to-agent/chapter/vercel-core-operations/index.html || test -f out/chapter/vercel-core-operations/index.html
find out -path '*course/production-ops/*.webp' -o -path '*course/production-ops/*/*.webp' | head
```

Expected: 24 张图片，GitHub Pages 构建成功，专题深链和静态图片进入 `out`。

- [ ] **Step 4: 运行完整本地门禁**

Run:

```bash
PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH GITHUB_PAGES=true npm run test:ci
PATH=$HOME/.nvm/versions/node/v22.22.1/bin:$PATH npm run test:e2e
git diff --check
```

Expected: lint、typecheck、全部 Vitest、示例工程测试、静态构建、desktop/mobile E2E 全绿；无付费 Provider 或真实平台调用。

- [ ] **Step 5: 三档视口视觉与像素验收**

启动本地站点后在 390×844、1024×768、1440×1000 逐一检查 P01、P03、P06、P08、P10、P12、P14：无横向溢出、文字裁切、图例重叠、图片空白、专题导航错误或动态内容导致的布局偏移。对 24 张图片做 canvas/像素非空检查，并确认真实界面与示意图标签准确。

- [ ] **Step 6: 最终隐私和差异审计**

Run:

```bash
git status --short
git diff --stat origin/main...HEAD
git diff --check origin/main...HEAD
rg -n "BEGIN (RSA|OPENSSH|EC) PRIVATE KEY|service_role|sk-[A-Za-z0-9]|@gmail\.com|@qq\.com" src public docs README.md
```

Expected: 只包含规范、计划、课程代码、测试、README 和 24 张脱敏成品；无原始截图、`.env`、密钥、邮箱、项目 ID 或生产正文。

- [ ] **Step 7: 标记计划完成并提交验收修正**

把本计划实际完成项改为 `[x]`，记录最终测试数量和截图检查结果；只提交 Task 9 产生的 E2E、样式或验收文档改动：

```bash
git add tests/e2e/course.spec.ts src/app/globals.css src/content/chapters.test.ts docs/superpowers/plans/2026-07-22-production-deployment-operations-curriculum.md
git commit -m "test(course): 完成生产运维专题验收"
```

- [ ] **Step 8: 按里程碑流程交付**

确认开放 PR 为 0 后 push `codex/production-ops-curriculum`，创建唯一 Draft PR；运行一次 `claude --permission-mode auto --model sonnet -p "/codex-independent-pr-review <PR编号>"`。有效 finding 用本地复现和最小修复闭环，不再次调用 Claude；最终 GitHub CI 通过后用 merge commit 合并并删除远端分支。
