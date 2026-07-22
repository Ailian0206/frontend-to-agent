export type CalloutTone = "note" | "warning" | "success";

/** Learning tracks used for navigation grouping and resource filtering. */
export type CourseTrack =
  | "认知基础"
  | "模型与提示"
  | "工具与协议"
  | "知识检索"
  | "状态编排"
  | "工程上线"
  | "实战进阶";

export type ResourceKind = "github" | "docs" | "course" | "article" | "video";

/** Content layer for sidebar grouping: lesson / lab / elective / capstone. */
export type ContentKind = "lesson" | "lab" | "elective" | "capstone";

export type ChapterSeriesId = "production-ops";

export interface ChapterSeriesRef {
  id: ChapterSeriesId;
  order: number;
}

export interface ScreenshotLegendItem {
  label: string;
  title: string;
  detail: string;
}

/** JD-aligned skill IDs from the curriculum skill map. */
export type SkillId =
  | "S1"
  | "S2"
  | "S3"
  | "S4"
  | "S5"
  | "S6"
  | "S7"
  | "S8"
  | "S9"
  | "S10"
  | "S11"
  | "E1"
  | "E2"
  | "E3"
  | "E4"
  | "E5";

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string; author: string; source?: string }
  | { type: "bullets"; items: string[] }
  | { type: "steps"; items: { title: string; detail: string }[] }
  | { type: "callout"; tone: CalloutTone; title: string; text: string }
  | {
      type: "table";
      headers: string[];
      rows: string[][];
    }
  | {
      type: "code";
      language: string;
      filename: string;
      code: string;
      caption?: string;
      output?: string;
    }
  | { type: "diagram"; title: string; chart: string }
  | {
      type: "checkpoint";
      title: string;
      criteria: string[];
    }
  | {
      type: "resources";
      title: string;
      items: {
        title: string;
        url: string;
        kind: ResourceKind;
        note: string;
      }[];
    }
  | {
      type: "screenshot";
      src: string;
      alt: string;
      title: string;
      capturedAt: string;
      imageKind: "real" | "illustration";
      width: number;
      height: number;
      legend: ScreenshotLegendItem[];
      sourceUrl?: string;
    };

export interface LessonSection {
  id: string;
  title: string;
  blocks: ContentBlock[];
}

export interface Chapter {
  slug: string;
  number: number;
  title: string;
  shortTitle: string;
  phase: string;
  track: CourseTrack;
  tags: string[];
  /** Content layer used for left-nav grouping. */
  kind: ContentKind;
  /** Optional series used for secondary lesson navigation. */
  series?: ChapterSeriesRef;
  /** Linked entries from the skill map (S1–S11 / E1–E5). */
  skills: SkillId[];
  /** Lab chapter slugs that prove skills taught in this lesson. */
  relatedLabs?: string[];
  /** Stub chapter reserved for a later milestone (nav-only for now). */
  comingSoon?: boolean;
  duration: string;
  level: "基础" | "进阶" | "实战" | "工程化";
  goal: string;
  dependencies?: string[];
  terms: string[];
  /** IDs from the curated public resource catalog. */
  relatedResources?: string[];
  sections: LessonSection[];
}

export interface CourseResource {
  id: string;
  title: string;
  url: string;
  kind: ResourceKind;
  track: CourseTrack;
  tags: string[];
  language: "zh" | "en";
  summary: string;
  why: string;
}
