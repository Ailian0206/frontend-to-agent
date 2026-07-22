import { expect, test } from "@playwright/test";

test("opens public resource catalog and filters by track", async ({ page }) => {
  await page.goto("/resources/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("公开 Agent 教程与资源库");
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
