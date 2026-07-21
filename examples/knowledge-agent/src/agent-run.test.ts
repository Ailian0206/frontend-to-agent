import { describe, expect, it, vi } from "vitest";
import { invokeWithTimeout } from "./agent-run.js";

describe("invokeWithTimeout", () => {
  it("aborts an agent run after the total time budget", async () => {
    let receivedSignal: AbortSignal | undefined;
    const agent = {
      invoke: vi.fn((_input: unknown, config: { signal?: AbortSignal; [key: string]: unknown }) => {
        receivedSignal = config.signal;
        return new Promise<never>((_resolve, reject) => {
          config.signal?.addEventListener("abort", () => {
            reject(new DOMException("aborted", "AbortError"));
          });
        });
      }),
    };

    await expect(
      invokeWithTimeout(
        (signal) => agent.invoke({ messages: [] }, { recursionLimit: 12, signal }),
        5,
      ),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(receivedSignal?.aborted).toBe(true);
  });
});
