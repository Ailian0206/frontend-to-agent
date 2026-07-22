import type { CurriculumId } from "./types";

export interface CurriculumMeta {
  id: CurriculumId;
  /** Short label for the sidebar course switcher. */
  shortTitle: string;
  /** Full title shown in empty states and future course hubs. */
  title: string;
  description: string;
}

/** Top-level courses available in the left-nav switcher. */
export const curricula: CurriculumMeta[] = [
  {
    id: "agent",
    shortTitle: "AI Agent",
    title: "AI Agent 系统",
    description: "Prompt、Tool、RAG、HITL、MCP 与可交付作品集。",
  },
  {
    id: "production-ops",
    shortTitle: "生产运维",
    title: "生产部署与运维入门",
    description: "Vercel、Supabase、Inngest、Sentry 的上线与日常巡检。",
  },
];

export const defaultCurriculumId: CurriculumId = "agent";

export function isCurriculumId(value: string): value is CurriculumId {
  return curricula.some((item) => item.id === value);
}

export function curriculumMeta(id: CurriculumId): CurriculumMeta {
  return curricula.find((item) => item.id === id) ?? curricula[0];
}

/** Resolve draft/optional curriculum fields to a stable id. */
export function resolveCurriculumId(curriculum?: CurriculumId): CurriculumId {
  return curriculum ?? defaultCurriculumId;
}
