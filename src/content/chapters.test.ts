import { describe, expect, it } from "vitest";
import { chapters, searchChapters, blockSearchText } from "./chapters";
import { groupChaptersByTrack } from "./course-index";
import { courseResources } from "./resources";
import { coreSkillIds, electiveSkillIds, skillMap } from "./skills";
import { courseTracks } from "./taxonomy";

describe("course content", () => {
  it("defines core skills S1–S11 and elective skills E1–E5", () => {
    expect(coreSkillIds).toEqual([
      "S1",
      "S2",
      "S3",
      "S4",
      "S5",
      "S6",
      "S7",
      "S8",
      "S9",
      "S10",
      "S11",
    ]);
    expect(electiveSkillIds).toEqual(["E1", "E2", "E3", "E4", "E5"]);
    expect(skillMap).toHaveLength(16);
    expect(new Set(skillMap.map((skill) => skill.id)).size).toBe(16);
  });

  it("marks all assembled chapters with valid kind and skill ids", () => {
    const ids = new Set(skillMap.map((skill) => skill.id));
    const kinds = new Set(["lesson", "lab", "elective", "capstone"]);
    for (const chapter of chapters) {
      expect(kinds.has(chapter.kind), `${chapter.slug} has invalid kind`).toBe(true);
      expect(chapter.skills.length).toBeGreaterThan(0);
      for (const skill of chapter.skills) {
        expect(ids.has(skill), `${chapter.slug} references unknown skill ${skill}`).toBe(true);
      }
    }
  });

  it("contains the expanded curriculum with labs and electives in sequence", () => {
    expect(chapters).toHaveLength(29);
    expect(chapters.map((chapter) => chapter.number)).toEqual(
      Array.from({ length: 29 }, (_, index) => index + 1),
    );
    expect(chapters.slice(0, 14).map((chapter) => chapter.slug)).toEqual([
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
    ]);
    expect(chapters.filter((chapter) => chapter.kind === "lab").map((chapter) => chapter.slug)).toEqual([
      "lab-l01",
      "lab-l02",
      "lab-l03",
      "lab-l04",
      "lab-l05",
      "lab-l06",
      "lab-l07",
      "lab-l08",
    ]);
    expect(chapters.filter((chapter) => chapter.kind === "elective").map((chapter) => chapter.slug)).toEqual([
      "elective-e1",
      "elective-e2",
      "elective-e3",
      "elective-e4",
      "elective-e5",
    ]);
    expect(chapters.at(-2)?.slug).toBe("capstone");
    expect(chapters.at(-2)?.kind).toBe("capstone");
    expect(chapters.at(-1)?.slug).toBe("roadmap");
  });

  it("exposes lab, elective, and capstone placeholders for navigation", () => {
    const kinds = new Set(chapters.map((chapter) => chapter.kind));
    expect(kinds.has("lab")).toBe(true);
    expect(kinds.has("elective")).toBe(true);
    expect(kinds.has("capstone")).toBe(true);
    expect(chapters.filter((chapter) => chapter.comingSoon).length).toBeGreaterThanOrEqual(7);
  });

  it("assigns every chapter to a known learning track with tags", () => {
    const trackIds = new Set(courseTracks.map((track) => track.id));
    expect(chapters.every((chapter) => trackIds.has(chapter.track))).toBe(true);
    expect(chapters.every((chapter) => chapter.tags.length >= 2)).toBe(true);
    expect(groupChaptersByTrack().length).toBeGreaterThanOrEqual(6);
  });

  it("contains diagrams, runnable code, and checkpoints across core chapters", () => {
    const lessonChapters = chapters.filter((chapter) => chapter.kind === "lesson" || chapter.kind === "capstone");
    const blocks = lessonChapters.flatMap((chapter) =>
      chapter.sections.flatMap((section) => section.blocks),
    );
    expect(blocks.filter((block) => block.type === "diagram").length).toBeGreaterThanOrEqual(5);
    expect(blocks.filter((block) => block.type === "code").length).toBeGreaterThanOrEqual(14);
    expect(blocks.filter((block) => block.type === "resources").length).toBeGreaterThanOrEqual(4);
    expect(
      lessonChapters
        .filter((chapter) => !["why-agent", "core-concepts", "roadmap"].includes(chapter.slug))
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

  it("keeps relatedResources ids resolvable against the catalog", () => {
    const resourceIds = new Set(courseResources.map((resource) => resource.id));
    for (const chapter of chapters) {
      for (const id of chapter.relatedResources ?? []) {
        expect(resourceIds.has(id), `${chapter.slug} references missing resource ${id}`).toBe(true);
      }
    }
  });

  it("deepens M2 lessons with decision, failure, interview, and lab links", () => {
    const m2Lessons = ["prompt-structured", "tool-calling", "first-agent", "streaming-ui"];
    for (const slug of m2Lessons) {
      const chapter = chapters.find((item) => item.slug === slug);
      expect(chapter, slug).toBeDefined();
      const text = chapter!
        .sections.flatMap((section) => section.blocks)
        .map((block) => blockSearchText(block))
        .join(" ");
      expect(text).toMatch(/何时用|何时不用/);
      expect(text).toMatch(/失败|调试/);
      expect(text).toMatch(/面试/);
      expect(chapter!.relatedLabs?.length).toBeGreaterThan(0);
    }
  });

  it("ships L01–L03 labs as non-placeholder content with example paths", () => {
    for (const slug of ["lab-l01", "lab-l02", "lab-l03"]) {
      const chapter = chapters.find((item) => item.slug === slug);
      expect(chapter, slug).toBeDefined();
      expect(chapter!.comingSoon).toBeFalsy();
      expect(chapter!.kind).toBe("lab");
      const text = chapter!
        .sections.flatMap((section) => section.blocks)
        .map((block) => blockSearchText(block))
        .join(" ");
      expect(text).toMatch(/examples\/lab-l0/);
      expect(
        chapter!.sections.some((section) =>
          section.blocks.some((block) => block.type === "checkpoint"),
        ),
      ).toBe(true);
    }
  });

  it("deepens M3 lessons with decision, failure, interview, and lab links", () => {
    const m3Lessons = ["rag", "memory", "human-in-the-loop", "multi-agent"];
    for (const slug of m3Lessons) {
      const chapter = chapters.find((item) => item.slug === slug);
      expect(chapter, slug).toBeDefined();
      const text = chapter!
        .sections.flatMap((section) => section.blocks)
        .map((block) => blockSearchText(block))
        .join(" ");
      expect(text).toMatch(/何时用|何时不用/);
      expect(text).toMatch(/失败|调试/);
      expect(text).toMatch(/面试/);
      expect(chapter!.relatedLabs?.length).toBeGreaterThan(0);
    }
  });

  it("ships L04–L06 labs as non-placeholder content with example paths", () => {
    for (const slug of ["lab-l04", "lab-l05", "lab-l06"]) {
      const chapter = chapters.find((item) => item.slug === slug);
      expect(chapter, slug).toBeDefined();
      expect(chapter!.comingSoon).toBeFalsy();
      expect(chapter!.kind).toBe("lab");
      const text = chapter!
        .sections.flatMap((section) => section.blocks)
        .map((block) => blockSearchText(block))
        .join(" ");
      expect(text).toMatch(/examples\/lab-l0/);
      expect(
        chapter!.sections.some((section) =>
          section.blocks.some((block) => block.type === "checkpoint"),
        ),
      ).toBe(true);
    }
  });
});
