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
