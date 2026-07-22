import { baseChapters } from "../chapters.base";
import type { Chapter } from "../types";
import { evalSecurityChapter } from "./eval-security";
import { hitlChapter } from "./human-in-the-loop";
import { mcpChapter } from "./mcp-protocol";
import { promptStructuredChapter } from "./prompt-structured";
import { streamingUiChapter } from "./streaming-ui";

/**
 * Assemble the full curriculum: original 11 chapters plus public-curriculum gaps.
 * Order follows a senior-frontend learning path (prompt → tools → stream → knowledge → HITL → MCP → eval).
 */
const orderedWithoutNumbers: Omit<Chapter, "number">[] = [
  baseChapters[0], // why-agent
  baseChapters[1], // core-concepts
  baseChapters[2], // stack-setup
  promptStructuredChapter,
  baseChapters[3], // first-agent
  baseChapters[4], // tool-calling
  streamingUiChapter,
  baseChapters[5], // rag
  baseChapters[6], // memory
  hitlChapter,
  baseChapters[7], // multi-agent
  mcpChapter,
  baseChapters[8], // deploy-observe
  evalSecurityChapter,
  baseChapters[9], // capstone
  baseChapters[10], // roadmap
];

export const chapters: Chapter[] = orderedWithoutNumbers.map((chapter, index) => ({
  ...chapter,
  number: index + 1,
}));

export function getChapter(slug: string): Chapter {
  return chapters.find((chapter) => chapter.slug === slug) ?? chapters[0];
}

/** Extract plain text from content blocks for full-text search. */
export function blockSearchText(block: Chapter["sections"][number]["blocks"][number]): string {
  switch (block.type) {
    case "paragraph":
      return block.text;
    case "callout":
      return `${block.title} ${block.text}`;
    case "quote":
      return `${block.text} ${block.author} ${block.source ?? ""}`;
    case "bullets":
      return block.items.join(" ");
    case "steps":
      return block.items.map((item) => `${item.title} ${item.detail}`).join(" ");
    case "table":
      return `${block.headers.join(" ")} ${block.rows.flat().join(" ")}`;
    case "code":
      return `${block.filename} ${block.code} ${block.caption ?? ""} ${block.output ?? ""}`;
    case "diagram":
      return `${block.title} ${block.chart}`;
    case "checkpoint":
      return `${block.title} ${block.criteria.join(" ")}`;
    case "resources":
      return `${block.title} ${block.items.map((item) => `${item.title} ${item.note} ${item.url}`).join(" ")}`;
    default:
      return "";
  }
}

export function searchChapters(query: string): Chapter[] {
  const normalized = query.trim().toLocaleLowerCase("zh-CN");
  if (!normalized) return chapters;

  return chapters.filter((chapter) => {
    const searchable = [
      chapter.title,
      chapter.shortTitle,
      chapter.goal,
      chapter.phase,
      chapter.track,
      ...chapter.tags,
      ...chapter.terms,
      ...(chapter.dependencies ?? []),
      ...chapter.sections.flatMap((section) => [
        section.title,
        ...section.blocks.map((block) => blockSearchText(block)),
      ]),
    ]
      .join(" ")
      .toLocaleLowerCase("zh-CN");
    return searchable.includes(normalized);
  });
}
