/** High-level UI status derived from the event stream (not identical to status event values). */
export type AgentUiStatus =
  | "idle"
  | "planning"
  | "tool"
  | "streaming"
  | "awaiting_confirm"
  | "failed";

/** Structured agent run events for SSE / NDJSON frontends. */
export type AgentEvent =
  | { type: "status"; value: "planning" | "tool" | "streaming" }
  | { type: "tool_start"; name: string; argsSummary: string }
  | { type: "tool_end"; name: string; ok: boolean }
  | { type: "token"; text: string }
  | {
      type: "confirm_required";
      toolName: string;
      title: string;
      summary: string;
    }
  | { type: "cancelled"; runId: string }
  | { type: "error"; message: string }
  | { type: "done"; runId: string };
