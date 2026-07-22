import { describe, expect, it } from "vitest";
import { chapters, searchChapters, blockSearchText } from "./chapters";
import {
  filterChaptersByCurriculum,
  groupChaptersByKind,
  groupChaptersByTrack,
  chapterSummaries,
} from "./course-index";
import { curricula } from "./curricula";
import { courseResources } from "./resources";
import { coreSkillIds, electiveSkillIds, skillMap } from "./skills";
import { courseTracks } from "./taxonomy";
import type { ContentBlock } from "./types";

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
      // Production-ops stubs may ship without Agent skill ids until that course is authored.
      if (chapter.curriculum === "agent") {
        expect(chapter.skills.length).toBeGreaterThan(0);
      }
      for (const skill of chapter.skills) {
        expect(ids.has(skill), `${chapter.slug} references unknown skill ${skill}`).toBe(true);
      }
    }
  });

  it("contains the expanded curriculum with labs and electives in sequence", () => {
    expect(chapters).toHaveLength(43);
    expect(chapters.map((chapter) => chapter.number)).toEqual(
      Array.from({ length: 43 }, (_, index) => index + 1),
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
    expect(chapters.find((chapter) => chapter.slug === "capstone")?.kind).toBe("capstone");
    expect(chapters.find((chapter) => chapter.slug === "roadmap")).toBeDefined();
  });

  it("assigns agent curriculum by default and isolates production-ops", () => {
    expect(chapters.filter((chapter) => chapter.curriculum === "agent")).toHaveLength(29);
    expect(chapters.filter((chapter) => chapter.curriculum === "production-ops")).toHaveLength(14);
  });

  it("filters and groups chapters by curriculum for the dual-course sidebar", () => {
    expect(curricula.map((item) => item.id)).toEqual(["agent", "production-ops"]);
    const agentOnly = filterChaptersByCurriculum(chapterSummaries, "agent");
    const productionOnly = filterChaptersByCurriculum(chapterSummaries, "production-ops");
    expect(agentOnly).toHaveLength(29);
    expect(productionOnly).toHaveLength(14);
    expect(groupChaptersByKind(agentOnly).map((group) => group.label)).toEqual([
      "课程",
      "实验",
      "选修",
      "作品集",
    ]);
    expect(groupChaptersByKind(productionOnly).map((group) => group.label)).toEqual(["课程"]);
  });

  it("exposes lab, elective, and capstone placeholders for navigation", () => {
    const kinds = new Set(chapters.map((chapter) => chapter.kind));
    expect(kinds.has("lab")).toBe(true);
    expect(kinds.has("elective")).toBe(true);
    expect(kinds.has("capstone")).toBe(true);
    expect(chapters.filter((chapter) => chapter.comingSoon)).toEqual([]);
  });

  it("ships P01-P14 as ordered production-ops lessons", () => {
    const productionOps = chapters.filter((chapter) => chapter.curriculum === "production-ops");

    expect(productionOps.map((chapter) => chapter.slug)).toEqual([
      "production-ops-intro",
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
    ]);
    expect(productionOps.every((chapter) => chapter.kind === "lesson")).toBe(true);
    expect(productionOps.every((chapter) => chapter.track === "工程上线")).toBe(true);
    expect(productionOps.every((chapter) => !chapter.comingSoon)).toBe(true);
    expect(chapters.find((chapter) => chapter.slug === "deploy-observe")?.curriculum).toBe("agent");

  });

  it("keeps P01-P02 risk and inspection guidance complete", () => {
    const productionOps = chapters.filter((chapter) => chapter.curriculum === "production-ops");

    for (const chapter of productionOps.slice(0, 2)) {
      const text = chapter.sections
        .flatMap((section) => section.blocks)
        .map(blockSearchText)
        .join(" ");
      expect(text).toMatch(/只读|普通变更|高风险/);
      expect(text).toMatch(/发布后|每日|每周|每月|故障/);
      expect(
        chapter.sections.some((section) =>
          section.blocks.some((block) => block.type === "checkpoint"),
        ),
      ).toBe(true);
    }
  });

  it("ships complete platform lessons with screenshots and official resources", () => {
    const productionOps = chapters.filter((chapter) => chapter.curriculum === "production-ops");
    const platformLessons = productionOps.slice(2, 10);

    expect(platformLessons.map((chapter) => chapter.slug)).toEqual([
      "vercel-core-operations",
      "vercel-release-observability",
      "supabase-database-migrations",
      "supabase-auth-rls-recovery",
      "inngest-events-functions-runs",
      "inngest-retries-concurrency-cost",
      "sentry-issues-releases-sourcemaps",
      "sentry-traces-alerts-privacy",
    ]);

    for (const chapter of platformLessons) {
      const blocks = chapter.sections.flatMap((section) => section.blocks);
      const text = blocks.map(blockSearchText).join(" ");

      expect(text).toMatch(/是什么|职责/);
      expect(text).toMatch(/不负责/);
      expect(text).toMatch(/正常/);
      expect(text).toMatch(/异常/);
      expect(text).toMatch(/只读|普通变更|高风险/);
      expect(text).toContain("Evidence Graph");
      expect(blocks.filter((block) => block.type === "screenshot")).toHaveLength(3);
      expect(blocks.some((block) => block.type === "resources")).toBe(true);
      expect(blocks.some((block) => block.type === "checkpoint")).toBe(true);
    }
  });

  it("ships P11-P14 with a cross-platform decision model", () => {
    const productionOps = chapters.filter((chapter) => chapter.curriculum === "production-ops");
    const operations = [
      "release-checks-rollback",
      "cross-platform-incident-response",
      "production-security-cost-recovery",
      "observable-production-practicum",
    ];

    for (const slug of operations) {
      const chapter = productionOps.find((item) => item.slug === slug);
      expect(chapter, slug).toBeDefined();
      const blocks = chapter?.sections.flatMap((section) => section.blocks) ?? [];
      const text = blocks.map(blockSearchText).join(" ");

      expect(text).toMatch(/Vercel/);
      expect(text).toMatch(/Supabase/);
      expect(text).toMatch(/Inngest/);
      expect(text).toMatch(/Sentry/);
      expect(text).toMatch(/停止|不要继续/);
      expect(blocks.some((block) => block.type === "checkpoint")).toBe(true);
    }

    const incident = productionOps.find((item) => item.slug === "cross-platform-incident-response");
    const diagram = incident?.sections
      .flatMap((section) => section.blocks)
      .find((block) => block.type === "diagram");
    expect(diagram).toBeDefined();
    expect(blockSearchText(diagram!)).toMatch(/打不开|登录失败|数据异常|任务卡住|页面报错/);
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

  it("indexes screenshot title, alt text, legend, and source", () => {
    const screenshot = {
      type: "screenshot",
      src: "/course/production-ops/vercel/deployments.webp",
      alt: "Vercel Deployments 页面，标出状态和提交版本",
      title: "从 Deployments 确认线上版本",
      capturedAt: "2026-07-22",
      imageKind: "real",
      width: 1440,
      height: 900,
      legend: [
        { label: "1", title: "Status（状态）", detail: "Ready 表示发布完成。" },
      ],
      sourceUrl: "https://vercel.com/docs/deployments",
    } satisfies ContentBlock;

    expect(blockSearchText(screenshot)).toContain("Status（状态） Ready");
    expect(blockSearchText(screenshot)).toContain("Vercel Deployments");
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

  it("deepens M4 lessons with decision, failure, interview, and lab links", () => {
    const m4Lessons = ["mcp-protocol", "eval-security", "deploy-observe"];
    for (const slug of m4Lessons) {
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

  it("ships L07–L08 labs as non-placeholder content with example paths", () => {
    for (const slug of ["lab-l07", "lab-l08"]) {
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

  it("ships electives E1–E5 as readable non-placeholder content", () => {
    for (const slug of ["elective-e1", "elective-e2", "elective-e3", "elective-e4", "elective-e5"]) {
      const chapter = chapters.find((item) => item.slug === slug);
      expect(chapter, slug).toBeDefined();
      expect(chapter!.comingSoon).toBeFalsy();
      expect(chapter!.kind).toBe("elective");
      const text = chapter!
        .sections.flatMap((section) => section.blocks)
        .map((block) => blockSearchText(block))
        .join(" ");
      expect(text).toMatch(/面试/);
      expect(text).toMatch(/何时用|何时不用/);
      expect(
        chapter!.sections.some((section) =>
          section.blocks.some((block) => block.type === "checkpoint" || block.type === "diagram"),
        ),
      ).toBe(true);
    }
  });
});
