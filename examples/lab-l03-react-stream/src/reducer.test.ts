import { describe, expect, it } from "vitest";
import {
  initialAgentViewState,
  reduceAgentView,
} from "./reducer.js";

describe("reduceAgentView", () => {
  it("moves planning → tool → streaming → idle on a happy path", () => {
    let state = initialAgentViewState;

    state = reduceAgentView(state, { type: "status", value: "planning" });
    expect(state.status).toBe("planning");

    state = reduceAgentView(state, {
      type: "tool_start",
      name: "weather",
      argsSummary: "city=上海",
    });
    expect(state.status).toBe("tool");
    expect(state.tools).toEqual(["weather"]);

    state = reduceAgentView(state, {
      type: "tool_end",
      name: "weather",
      ok: true,
    });
    expect(state.status).toBe("planning");

    state = reduceAgentView(state, { type: "token", text: "晴" });
    state = reduceAgentView(state, { type: "token", text: "，25℃" });
    expect(state.status).toBe("streaming");
    expect(state.answer).toBe("晴，25℃");

    state = reduceAgentView(state, { type: "done", runId: "r1" });
    expect(state.status).toBe("idle");
  });

  it("sets awaiting_confirm and pendingConfirm on confirm_required", () => {
    const state = reduceAgentView(initialAgentViewState, {
      type: "confirm_required",
      toolName: "send_email",
      title: "发送邮件？",
      summary: "收件人：ops@example.com",
    });
    expect(state.status).toBe("awaiting_confirm");
    expect(state.pendingConfirm?.toolName).toBe("send_email");
  });

  it("clears pendingConfirm when the side-effect tool actually starts", () => {
    let state = reduceAgentView(initialAgentViewState, {
      type: "confirm_required",
      toolName: "send_email",
      title: "发送邮件？",
      summary: "1 封",
    });
    state = reduceAgentView(state, {
      type: "tool_start",
      name: "send_email",
      argsSummary: "dryRun=false",
    });
    expect(state.pendingConfirm).toBeUndefined();
    expect(state.tools).toContain("send_email");
  });

  it("marks failed on error and tool_end with ok=false", () => {
    let state = reduceAgentView(initialAgentViewState, {
      type: "tool_start",
      name: "order",
      argsSummary: "",
    });
    state = reduceAgentView(state, {
      type: "tool_end",
      name: "order",
      ok: false,
    });
    expect(state.status).toBe("failed");

    state = reduceAgentView(initialAgentViewState, {
      type: "error",
      message: "timeout",
    });
    expect(state.status).toBe("failed");
  });

  it("returns to idle on cancelled without wiping streamed answer", () => {
    let state = reduceAgentView(initialAgentViewState, {
      type: "token",
      text: "部分",
    });
    state = reduceAgentView(state, { type: "cancelled", runId: "r1" });
    expect(state.status).toBe("idle");
    expect(state.answer).toBe("部分");
  });
});
