import { chapters, blockSearchText } from "./chapters";
import { courseTracks } from "./taxonomy";
import type { Chapter, ContentKind, CourseTrack, SkillId } from "./types";

export interface ChapterSummary {
  slug: string;
  number: number;
  title: string;
  shortTitle: string;
  phase: string;
  track: CourseTrack;
  tags: string[];
  kind: ContentKind;
  skills: SkillId[];
  comingSoon?: boolean;
  duration: string;
  level: Chapter["level"];
  goal: string;
  terms: string[];
  relatedResources: string[];
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
    kind: chapter.kind,
    skills: chapter.skills,
    comingSoon: chapter.comingSoon,
    duration: chapter.duration,
    level: chapter.level,
    goal: chapter.goal,
    terms: chapter.terms,
    relatedResources: chapter.relatedResources ?? [],
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
    chapter.kind,
    ...chapter.skills,
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

/** Group chapters by learning track for outline metadata and resource filters. */
export function groupChaptersByTrack(items: ChapterSummary[] = chapterSummaries): TrackChapterGroup[] {
  return courseTracks
    .map((track) => ({
      track: track.id,
      summary: track.summary,
      chapters: items.filter((chapter) => chapter.track === track.id),
    }))
    .filter((group) => group.chapters.length > 0);
}

export type ContentKindLabel = "课程" | "实验" | "选修" | "作品集";

export function kindLabel(kind: ContentKind): ContentKindLabel {
  switch (kind) {
    case "lesson":
      return "课程";
    case "lab":
      return "实验";
    case "elective":
      return "选修";
    case "capstone":
      return "作品集";
  }
}

export interface KindChapterGroup {
  kind: ContentKind;
  label: ContentKindLabel;
  chapters: ChapterSummary[];
}

/** Group chapters by content kind for the primary left-nav IA. */
export function groupChaptersByKind(items: ChapterSummary[] = chapterSummaries): KindChapterGroup[] {
  const order: ContentKind[] = ["lesson", "lab", "elective", "capstone"];
  return order
    .map((kind) => ({
      kind,
      label: kindLabel(kind),
      chapters: items.filter((chapter) => chapter.kind === kind),
    }))
    .filter((group) => group.chapters.length > 0);
}
