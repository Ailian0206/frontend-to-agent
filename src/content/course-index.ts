import { chapters, blockSearchText } from "./chapters";
import { courseTracks } from "./taxonomy";
import type { Chapter, CourseTrack } from "./types";

export interface ChapterSummary {
  slug: string;
  number: number;
  title: string;
  shortTitle: string;
  phase: string;
  track: CourseTrack;
  tags: string[];
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
    track: chapter.track,
    tags: chapter.tags,
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
    .toLocaleLowerCase("zh-CN"),
}));

export interface TrackChapterGroup {
  track: CourseTrack;
  summary: string;
  chapters: ChapterSummary[];
}

/** Group chapters by learning track for sidebar navigation. */
export function groupChaptersByTrack(items: ChapterSummary[] = chapterSummaries): TrackChapterGroup[] {
  return courseTracks
    .map((track) => ({
      track: track.id,
      summary: track.summary,
      chapters: items.filter((chapter) => chapter.track === track.id),
    }))
    .filter((group) => group.chapters.length > 0);
}
