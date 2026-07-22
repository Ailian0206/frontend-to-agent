import { describe, expect, it } from "vitest";
import { hashPrompt } from "./prompt-version.js";

describe("hashPrompt", () => {
  it("returns a stable 64-char hex digest", () => {
    const text = "order triage v1";
    expect(hashPrompt(text)).toBe(hashPrompt(text));
    expect(hashPrompt(text)).toMatch(/^[a-f0-9]{64}$/);
  });

  it("changes when prompt text changes", () => {
    expect(hashPrompt("a")).not.toBe(hashPrompt("b"));
  });
});
