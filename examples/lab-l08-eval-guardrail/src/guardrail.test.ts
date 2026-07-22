import { describe, expect, it } from "vitest";
import { checkOutput } from "./guardrail.js";
import {
  outputInjection,
  outputSafe,
  outputWithFakeSecret,
  outputWithPhone,
} from "./fixtures.js";

describe("checkOutput", () => {
  it("accepts benign assistant text", () => {
    const result = checkOutput(outputSafe);
    expect(result.ok).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it("flags prompt-injection phrases", () => {
    const result = checkOutput(outputInjection);
    expect(result.ok).toBe(false);
    expect(result.reasons.some((r) => r.startsWith("prompt_injection:"))).toBe(
      true,
    );
  });

  it("flags sk- secret-like patterns", () => {
    const result = checkOutput(outputWithFakeSecret);
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("leaked_secret:sk-pattern");
  });

  it("does not flag phone numbers unless checkPiiPhone is enabled", () => {
    expect(checkOutput(outputWithPhone).ok).toBe(true);
  });

  it("flags phone-like PII when option is on", () => {
    const result = checkOutput(outputWithPhone, { checkPiiPhone: true });
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("pii:phone-like");
  });
});
