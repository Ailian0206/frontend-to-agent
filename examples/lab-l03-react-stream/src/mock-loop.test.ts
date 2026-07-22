import { describe, expect, it } from "vitest";
import { runMockReactLoop } from "./mock-loop.js";

/** AbortSignal whose `aborted` flips true after N property reads (sync mid-loop). */
function abortAfterAbortedReads(readsUntilAbort: number): AbortSignal {
  let reads = 0;
  const base = new AbortController().signal;
  return {
    get aborted() {
      reads += 1;
      return reads > readsUntilAbort;
    },
    addEventListener: base.addEventListener.bind(base),
    removeEventListener: base.removeEventListener.bind(base),
    dispatchEvent: base.dispatchEvent.bind(base),
    throwIfAborted: base.throwIfAborted.bind(base),
    onabort: null,
    reason: undefined,
  } as AbortSignal;
}

describe("runMockReactLoop", () => {
  it("emits a deterministic ReAct-shaped event list", () => {
    const events = runMockReactLoop({
      runId: "run-a",
      steps: [
        { kind: "tool", name: "weather", argsSummary: "city=北京" },
        { kind: "tokens", parts: ["北京", "今天晴"] },
      ],
    });

    expect(events.map((e) => e.type)).toEqual([
      "status",
      "tool_start",
      "tool_end",
      "status",
      "token",
      "token",
      "done",
    ]);
    expect(events.at(-1)).toEqual({ type: "done", runId: "run-a" });
  });

  it("emits confirm_required immediately before side-effect tool_start", () => {
    const events = runMockReactLoop({
      steps: [
        {
          kind: "tool_side_effect",
          name: "send_email",
          confirm: {
            title: "确认发送",
            summary: "将发送 1 封邮件",
          },
        },
      ],
    });

    const types = events.map((e) => e.type);
    const confirmIdx = types.indexOf("confirm_required");
    const startIdx = types.indexOf("tool_start");
    expect(confirmIdx).toBeGreaterThanOrEqual(0);
    expect(startIdx).toBe(confirmIdx + 1);
    const confirm = events[confirmIdx];
    expect(confirm).toMatchObject({
      type: "confirm_required",
      toolName: "send_email",
    });
  });

  it("stops with cancelled when signal is already aborted", () => {
    const controller = new AbortController();
    controller.abort();
    const events = runMockReactLoop({
      signal: controller.signal,
      steps: [{ kind: "tokens", parts: ["a", "b"] }],
    });
    expect(events).toEqual([{ type: "cancelled", runId: "mock-run" }]);
  });

  it("emits cancelled mid-loop and does not emit further tokens or done", () => {
    // planning(2 reads) + streaming status(2) + first token(2) = 6 reads before 2nd token
    const signal = abortAfterAbortedReads(6);
    const events = runMockReactLoop({
      runId: "mid",
      signal,
      steps: [{ kind: "tokens", parts: ["x", "y", "z"] }],
    });

    const tokens = events.filter((e) => e.type === "token");
    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toEqual({ type: "token", text: "x" });
    expect(events.at(-1)?.type).toBe("cancelled");
    expect(events.some((e) => e.type === "done")).toBe(false);
  });
});
