import type { AgentEvent, AgentUiStatus } from "./events.js";

export interface PendingConfirm {
  toolName: string;
  title: string;
  summary: string;
}

export interface AgentViewState {
  status: AgentUiStatus;
  answer: string;
  tools: string[];
  pendingConfirm?: PendingConfirm;
}

export const initialAgentViewState: AgentViewState = {
  status: "idle",
  answer: "",
  tools: [],
};

/** Pure reducer: one structured event → next UI snapshot. */
export function reduceAgentView(
  state: AgentViewState,
  event: AgentEvent,
): AgentViewState {
  switch (event.type) {
    case "status":
      return { ...state, status: event.value };
    case "tool_start":
      return {
        ...state,
        status: "tool",
        tools: [...state.tools, event.name],
        pendingConfirm: undefined,
      };
    case "tool_end":
      return {
        ...state,
        status: event.ok ? "planning" : "failed",
      };
    case "token":
      return {
        ...state,
        status: "streaming",
        answer: state.answer + event.text,
      };
    case "confirm_required":
      return {
        ...state,
        status: "awaiting_confirm",
        pendingConfirm: {
          toolName: event.toolName,
          title: event.title,
          summary: event.summary,
        },
      };
    case "cancelled":
      return {
        ...state,
        status: "idle",
        pendingConfirm: undefined,
      };
    case "error":
      return {
        ...state,
        status: "failed",
        pendingConfirm: undefined,
      };
    case "done":
      return {
        ...state,
        status: "idle",
        pendingConfirm: undefined,
      };
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}
