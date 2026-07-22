import { expect, test } from "@playwright/test";

test("opens public resource catalog and filters by track", async ({ page }) => {
  await page.goto("/resources/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("公开 Agent 教程与资源库");
  await expect(page.getByRole("button", { name: "标记本章完成" })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "本章大纲" })).toHaveCount(0);

  const openMenu = page.getByRole("button", { name: "打开课程目录" });
  if (await openMenu.isVisible()) await openMenu.click();
  await expect(page.getByRole("link", { name: "公开资源库" })).toHaveAttribute("aria-current", "page");

  await page.getByLabel("按轨道筛选").selectOption("工具与协议");
  await expect(page.getByText(/当前显示 \d+ 条/)).toBeVisible();
  await expect(page.getByRole("link", { name: /mcp|MCP|langchain-mcp|Model Context/i }).first()).toBeVisible();
});

test("searches body content and persists chapter progress", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/chapter/rag/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("RAG 检索增强生成");

  await page.getByRole("button", { name: "搜索课程" }).first().click();
  await page.getByRole("textbox", { name: "搜索关键词" }).fill("Qdrant");
  await expect(page.getByRole("dialog").getByRole("link", { name: /RAG 私有知识库/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();

  await page.getByRole("button", { name: "标记本章完成" }).click();
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: "本章已完成" })).toBeVisible();
});

test("renders diagrams without overflow or console errors", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");
  await page.locator(".diagram-figure").first().scrollIntoViewIfNeeded();
  await expect(page.locator(".mermaid-canvas svg").first()).toBeVisible({ timeout: 15_000 });
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
  await expect(page.locator('[role="progressbar"][aria-label="课程学习进度"]')).toHaveAttribute(
    "aria-valuenow",
    /\d+/,
  );
  await expect(page.locator(".mermaid-canvas svg title").first()).toHaveText(
    "前端工程师的 Agent 学习路线",
  );

  if (testInfo.project.name === "mobile") {
    const diagram = page.locator(".mermaid-canvas").first();
    expect(await diagram.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
    await expect(page.locator(".course-nav")).toHaveAttribute("inert", "");
    await page.getByRole("button", { name: "打开课程目录" }).click();
    await expect(page.locator(".course-nav")).toHaveClass(/open/);
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await page.getByRole("button", { name: "关闭课程目录" }).first().click();
  }

  expect(errors).toEqual([]);
});

test("search dialog traps and restores focus while locking background scroll", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "搜索课程" }).first();
  await trigger.focus();
  await trigger.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  for (let index = 0; index < 16; index += 1) await page.keyboard.press("Tab");
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(trigger).toBeFocused();
});

test("groups navigation by content kind", async ({ page }) => {
  await page.goto("/");
  const openMenu = page.getByRole("button", { name: "打开课程目录" });
  if (await openMenu.isVisible()) await openMenu.click();
  await expect(page.getByRole("tab", { name: "AI Agent" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("navigation", { name: "课程章节" }).locator("button.kind-toggle").filter({ hasText: "课程" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "课程章节" }).locator("button.kind-toggle").filter({ hasText: "实验" })).toBeVisible();
  await expect(page.getByRole("link", { name: /能力地图/ })).toBeVisible();
});

test("switches top-level curriculum and collapses kind groups", async ({ page }, testInfo) => {
  await page.goto("/");
  const openMenu = page.getByRole("button", { name: "打开课程目录" });
  async function ensureNavOpen(): Promise<void> {
    if (await openMenu.isVisible()) {
      await openMenu.click();
      await expect(page.locator(".course-nav")).toHaveClass(/open/);
    }
  }

  await ensureNavOpen();
  await page.getByRole("tab", { name: "生产运维" }).click();
  await expect(page).toHaveURL(/production-ops-intro/, { timeout: 15_000 });
  await ensureNavOpen();
  await expect(page.getByRole("tab", { name: "生产运维" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("生产部署与运维");
  await expect(page.getByRole("link", { name: /能力地图/ })).toHaveCount(0);

  await page.getByRole("tab", { name: "AI Agent" }).click();
  await expect(page).toHaveURL(/why-agent|\/$/, { timeout: 15_000 });
  await ensureNavOpen();
  // Accordion collapse is asserted on desktop; mobile drawer focus/layout is covered elsewhere.
  if (testInfo.project.name === "mobile") return;
  const lessonToggle = page
    .getByRole("navigation", { name: "课程章节" })
    .locator("button.kind-toggle")
    .filter({ hasText: "课程" });
  await expect(lessonToggle).toHaveAttribute("aria-expanded", "true");
  await lessonToggle.click();
  await expect(lessonToggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("navigation", { name: "课程章节" }).getByRole("link", { name: /为什么转型 Agent/ })).toHaveCount(0);
});

test("keeps shell pages when re-clicking the active curriculum tab", async ({ page }) => {
  await page.goto("/skills/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("能力地图");
  const openMenu = page.getByRole("button", { name: "打开课程目录" });
  if (await openMenu.isVisible()) await openMenu.click();
  await expect(page.getByRole("tab", { name: "AI Agent" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "AI Agent" }).click();
  await expect(page).toHaveURL(/\/skills\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("能力地图");
});

test("opens graduate checklist without seniority copy", async ({ page }) => {
  await page.goto("/graduate/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("毕业验收");
  const main = page.locator("main");
  await expect(main.getByText(/S1 · LLM 控制面/)).toBeVisible();
  await expect(main.getByRole("checkbox").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "标记本章完成" })).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText("10 年以上");
  await expect(page.locator("main")).not.toContainText("10年以上");

  const openMenu = page.getByRole("button", { name: "打开课程目录" });
  if (await openMenu.isVisible()) {
    await openMenu.click();
    await expect(page.getByText("毕业验收", { exact: true }).first()).toBeVisible();
  }
});

test("opens shipped lab L01 without coming-soon chrome", async ({ page }) => {
  await page.goto("/chapter/lab-l01/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("结构化输出");
  await expect(page.getByText("examples/lab-l01-structured-output").first()).toBeVisible();
  await expect(page.getByText("本实验将在后续里程碑提供可运行仓库")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /S1/ }).first()).toBeVisible();
});

test("opens shipped lab L04 without coming-soon chrome", async ({ page }) => {
  await page.goto("/chapter/lab-l04/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("RAG");
  await expect(page.getByText("examples/lab-l04-rag-eval").first()).toBeVisible();
  await expect(page.getByText("本实验将在后续里程碑提供可运行仓库")).toHaveCount(0);
});

test("opens shipped lab L07 and elective E1", async ({ page }) => {
  await page.goto("/chapter/lab-l07/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("MCP");
  await expect(page.getByText("examples/lab-l07-mcp-whitelist").first()).toBeVisible();
  await page.goto("/chapter/elective-e1/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("网关");
  await expect(page.getByText("本实验将在后续里程碑提供可运行仓库")).toHaveCount(0);
});
