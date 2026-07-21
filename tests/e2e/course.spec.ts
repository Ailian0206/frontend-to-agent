import { expect, test } from "@playwright/test";

test("navigates chapters, searches, and persists progress", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("为什么前端要转型");

  await page.getByRole("button", { name: "搜索课程" }).first().click();
  await page.getByRole("textbox", { name: "搜索关键词" }).fill("RAG");
  await page.getByRole("dialog").getByRole("link", { name: /RAG 私有知识库/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("RAG 检索增强生成");
  expect(new URL(page.url()).pathname).toBe("/chapter/rag/");

  await page.getByRole("button", { name: "标记本章完成" }).click();
  await page.reload();
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
