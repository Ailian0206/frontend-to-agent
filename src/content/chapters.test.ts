import { describe, expect, it } from "vitest";
import { chapters, searchChapters } from "./chapters";

describe("course content", () => {
  it("contains all required chapters in sequence", () => {
    expect(chapters).toHaveLength(11);
    expect(chapters.map((chapter) => chapter.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it("contains at least three diagrams and runnable code across core chapters", () => {
    const blocks = chapters.flatMap((chapter) => chapter.sections.flatMap((section) => section.blocks));
    expect(blocks.filter((block) => block.type === "diagram").length).toBeGreaterThanOrEqual(3);
    expect(blocks.filter((block) => block.type === "code").length).toBeGreaterThanOrEqual(10);
    expect(chapters.slice(2, 10).every((chapter) =>
      chapter.sections.some((section) => section.blocks.some((block) => block.type === "checkpoint")),
    )).toBe(true);
  });

  it("searches titles, goals, terms, and section headings", () => {
    expect(searchChapters("RAG").map((chapter) => chapter.slug)).toContain("core-concepts");
    expect(searchChapters("Supervisor").some((chapter) => chapter.slug === "multi-agent")).toBe(true);
    expect(searchChapters("不存在的课程词")).toEqual([]);
  });

  it("searches code and body content", () => {
    expect(searchChapters("nodemailer").map((chapter) => chapter.slug)).toContain("first-agent");
    expect(searchChapters("ORDER_GATEWAY_TIMEOUT").map((chapter) => chapter.slug)).toContain("tool-calling");
  });

  it("bootstraps an explicit NodeNext ESM project before top-level await lessons", () => {
    const setup = chapters[2].sections
      .flatMap((section) => section.blocks)
      .filter((block) => block.type === "code");
    const terminal = setup.find((block) => block.filename === "terminal");
    const tsconfig = setup.find((block) => block.filename === "tsconfig.json");

    expect(terminal?.code).toContain("npm pkg set type=module");
    expect(tsconfig?.code).toContain('"module": "NodeNext"');
    expect(tsconfig?.code).toContain('"target": "ES2022"');
  });
});
