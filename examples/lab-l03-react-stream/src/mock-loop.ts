import type { AgentEvent } from "./events.js";

/** One deterministic ReAct-ish step for CI mocks (no LLM). */
export type MockReactStep =
  | { kind: "tool"; name: string; argsSummary?: string; ok?: boolean }
  | {
      kind: "tool_side_effect";
      name: string;
      argsSummary?: string;
      ok?: boolean;
      confirm: { title: string; summary: string };
    }
  | { kind: "tokens"; parts: string[] }
  | { kind: "error"; message: string };

export interface RunMockReactLoopOptions {
  steps: MockReactStep[];
  runId?: string;
  signal?: AbortSignal;
}

const DEFAULT_RUN_ID = "mock-run";

function append(
  events: AgentEvent[],
  runId: string,
  event: AgentEvent,
  signal?: AbortSignal,
): boolean {
  if (signal?.aborted) {
    events.push({ type: "cancelled", runId });
    return false;
  }
  events.push(event);
  if (signal?.aborted) {
    events.push({ type: "cancelled", runId });
    return false;
  }
  return true;
}

/**
 * Deterministic fake ReAct loop: planning → tools → optional confirm → tokens → done.
 * Stops early with `cancelled` when `signal` is aborted (no further tokens).
 */
export function runMockReactLoop({
  steps,
  runId = DEFAULT_RUN_ID,
  signal,
}: RunMockReactLoopOptions): AgentEvent[] {
  const events: AgentEvent[] = [];

  if (
    !append(events, runId, { type: "status", value: "planning" }, signal)
  ) {
    return events;
  }

  for (const step of steps) {
    if (step.kind === "error") {
      append(events, runId, { type: "error", message: step.message }, signal);
      return events;
    }

    if (step.kind === "tool_side_effect") {
      if (
        !append(
          events,
          runId,
          {
            type: "confirm_required",
            toolName: step.name,
            title: step.confirm.title,
            summary: step.confirm.summary,
          },
          signal,
        )
      ) {
        return events;
      }
    }

    if (step.kind === "tool" || step.kind === "tool_side_effect") {
      const argsSummary = step.argsSummary ?? "";
      const ok = step.ok ?? true;
      if (
        !append(
          events,
          runId,
          { type: "tool_start", name: step.name, argsSummary },
          signal,
        )
      ) {
        return events;
      }
      if (
        !append(
          events,
          runId,
          { type: "tool_end", name: step.name, ok },
          signal,
        )
      ) {
        return events;
      }
      continue;
    }

    if (step.kind === "tokens") {
      if (
        !append(events, runId, { type: "status", value: "streaming" }, signal)
      ) {
        return events;
      }
      for (const text of step.parts) {
        if (!append(events, runId, { type: "token", text }, signal)) {
          return events;
        }
      }
    }
  }

  append(events, runId, { type: "done", runId }, signal);
  return events;
}
