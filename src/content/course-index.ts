import { chapters } from "./chapters";
import type { Chapter } from "./types";

export interface ChapterSummary {
  slug: string;
  number: number;
  title: string;
  shortTitle: string;
  phase: string;
  duration: string;
  level: Chapter["level"];
  goal: string;
  terms: string[];
  sections: { id: string; title: string }[];
}

export interface ChapterSearchItem extends ChapterSummary {
  searchText: string;
}

export function summarizeChapter(chapter: Chapter): ChapterSummary {
  return {
    slug: chapter.slug,
    number: chapter.number,
    title: chapter.title,
    shortTitle: chapter.shortTitle,
    phase: chapter.phase,
    duration: chapter.duration,
    level: chapter.level,
    goal: chapter.goal,
    terms: chapter.terms,
    sections: chapter.sections.map(({ id, title }) => ({ id, title })),
  };
}

export const chapterSummaries = chapters.map(summarizeChapter);

export const chapterSearchIndex: ChapterSearchItem[] = chapters.map((chapter) => ({
  ...summarizeChapter(chapter),
  searchText: [
    chapter.title,
    chapter.shortTitle,
    chapter.goal,
    ...chapter.terms,
    ...chapter.sections.flatMap((section) => [
      section.title,
      ...section.blocks.map((block) => JSON.stringify(block)),
    ]),
  ]
    .join(" ")
    .toLocaleLowerCase("zh-CN"),
}));
