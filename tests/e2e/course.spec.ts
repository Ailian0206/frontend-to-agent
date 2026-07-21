import { expect, test } from "@playwright/test";

test("navigates chapters, searches, and persists progress", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("为什么前端要转型");

  await page.getByRole("button", { name: "搜索课程" }).first().click();
  await page.getByRole("textbox", { name: "搜索关键词" }).fill("RAG");
  await page.getByRole("dialog").getByRole("button", { name: /RAG 私有知识库/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("RAG 检索增强生成");

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
  await expect(page.locator(".mermaid-canvas svg").first()).toBeVisible({ timeout: 15_000 });
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "打开课程目录" }).click();
    await expect(page.getByRole("complementary").first()).toHaveClass(/open/);
    await page.getByRole("button", { name: "关闭课程目录" }).first().click();
  }

  expect(errors).toEqual([]);
});
