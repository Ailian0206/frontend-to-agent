import { AIMessage } from "@langchain/core/messages";
import { describe, expect, it } from "vitest";
import { formatSearchHits, messageText } from "./format.js";

describe("formatSearchHits", () => {
  it("preserves source metadata for citations", () => {
    const output = formatSearchHits([
      {
        pageContent: "The refund window is seven days.",
        metadata: { source: "policy.md" },
        score: 0.91234,
      },
    ]);

    expect(output).toContain("source: policy.md");
    expect(output).toContain("score: 0.9123");
    expect(output).toContain("refund window");
  });
});

describe("messageText", () => {
  it("extracts plain string content", () => {
    expect(messageText(new AIMessage("hello"))).toBe("hello");
  });
});
