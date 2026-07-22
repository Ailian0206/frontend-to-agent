import { describe, expect, it } from "vitest";
import { checkAnswer } from "./guardrail.js";
import {
  INJECTION_ECHO_ANSWER,
  NO_EVIDENCE_ANSWER,
  SECRET_LEAK_ANSWER,
  SUCCESS_ANSWER_WITH_CITE,
} from "./eval-fixtures.js";

describe("checkAnswer", () => {
  it("accepts cited factual answers", () => {
    const result = checkAnswer(SUCCESS_ANSWER_WITH_CITE);
    expect(result.ok).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it("flags uncited factual claims with needsCiteRefuse", () => {
    const result = checkAnswer(
      "严重事故需在 30 分钟内建群并同步值班负责人。",
    );
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("missing_citation");
    expect(result.needsCiteRefuse).toBe(true);
  });

  it("allows no-evidence refusal without citation", () => {
    const result = checkAnswer(NO_EVIDENCE_ANSWER);
    expect(result.ok).toBe(true);
  });

  it("flags prompt-injection phrases in model output", () => {
    const result = checkAnswer(INJECTION_ECHO_ANSWER);
    expect(result.ok).toBe(false);
    expect(result.reasons.some((r) => r.startsWith("prompt_injection:"))).toBe(
      true,
    );
  });

  it("flags sk- secret-like patterns", () => {
    const result = checkAnswer(SECRET_LEAK_ANSWER);
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("leaked_secret:sk-pattern");
  });
});
