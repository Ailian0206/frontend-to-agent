import { describe, expect, it } from "vitest";
import { chapters, searchChapters } from "./chapters";
import { groupChaptersByTrack } from "./course-index";
import { courseResources } from "./resources";
import { courseTracks } from "./taxonomy";

describe("course content", () => {
  it("contains the expanded 16-chapter curriculum in sequence", () => {
    expect(chapters).toHaveLength(16);
    expect(chapters.map((chapter) => chapter.number)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    ]);
    expect(chapters.map((chapter) => chapter.slug)).toEqual([
      "why-agent",
      "core-concepts",
      "stack-setup",
      "prompt-structured",
      "first-agent",
      "tool-calling",
      "streaming-ui",
      "rag",
      "memory",
      "human-in-the-loop",
      "multi-agent",
      "mcp-protocol",
      "deploy-observe",
      "eval-security",
      "capstone",
      "roadmap",
    ]);
  });

  it("assigns every chapter to a known learning track with tags", () => {
    const trackIds = new Set(courseTracks.map((track) => track.id));
    expect(chapters.every((chapter) => trackIds.has(chapter.track))).toBe(true);
    expect(chapters.every((chapter) => chapter.tags.length >= 2)).toBe(true);
    expect(groupChaptersByTrack().length).toBeGreaterThanOrEqual(6);
  });

  it("contains diagrams, runnable code, and checkpoints across core chapters", () => {
    const blocks = chapters.flatMap((chapter) => chapter.sections.flatMap((section) => section.blocks));
    expect(blocks.filter((block) => block.type === "diagram").length).toBeGreaterThanOrEqual(5);
    expect(blocks.filter((block) => block.type === "code").length).toBeGreaterThanOrEqual(14);
    expect(blocks.filter((block) => block.type === "resources").length).toBeGreaterThanOrEqual(4);
    expect(
      chapters
        .slice(2, 15)
        .every((chapter) =>
          chapter.sections.some((section) => section.blocks.some((block) => block.type === "checkpoint")),
        ),
    ).toBe(true);
  });

  it("searches titles, goals, terms, tracks, and section headings", () => {
    expect(searchChapters("RAG").map((chapter) => chapter.slug)).toContain("core-concepts");
    expect(searchChapters("Supervisor").some((chapter) => chapter.slug === "multi-agent")).toBe(true);
    expect(searchChapters("MCP").map((chapter) => chapter.slug)).toContain("mcp-protocol");
    expect(searchChapters("不存在的课程词")).toEqual([]);
  });

  it("searches code and body content", () => {
    expect(searchChapters("nodemailer").map((chapter) => chapter.slug)).toContain("first-agent");
    expect(searchChapters("ORDER_GATEWAY_TIMEOUT").map((chapter) => chapter.slug)).toContain("tool-calling");
    expect(searchChapters("AbortSignal").map((chapter) => chapter.slug)).toContain("streaming-ui");
    expect(searchChapters("MultiServerMCPClient").map((chapter) => chapter.slug)).toContain("mcp-protocol");
  });

  it("bootstraps an explicit NodeNext ESM project before top-level await lessons", () => {
    const setup = chapters
      .find((chapter) => chapter.slug === "stack-setup")
      ?.sections.flatMap((section) => section.blocks)
      .filter((block) => block.type === "code");
    const terminal = setup?.find((block) => block.filename === "terminal");
    const tsconfig = setup?.find((block) => block.filename === "tsconfig.json");

    expect(terminal?.code).toContain("npm pkg set type=module");
    expect(tsconfig?.code).toContain('"module": "NodeNext"');
    expect(tsconfig?.code).toContain('"target": "ES2022"');
  });

  it("curates a public resource catalog covering multiple tracks", () => {
    expect(courseResources.length).toBeGreaterThanOrEqual(16);
    expect(new Set(courseResources.map((resource) => resource.track)).size).toBeGreaterThanOrEqual(5);
    expect(courseResources.every((resource) => resource.url.startsWith("http"))).toBe(true);
  });
});
