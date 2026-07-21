export type CalloutTone = "note" | "warning" | "success";

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
  duration: string;
  level: "基础" | "进阶" | "实战" | "工程化";
  goal: string;
  dependencies?: string[];
  terms: string[];
  sections: LessonSection[];
}
