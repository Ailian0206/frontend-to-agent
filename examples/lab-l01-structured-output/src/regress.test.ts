import { describe, expect, it } from "vitest";
import {
  assertFixtureMatches,
  CURRENT_PROMPT_VERSION,
  REGRESSION_FIXTURES,
} from "./regress.js";

describe("regression fixtures", () => {
  it("each golden fixture matches current prompt version", () => {
    for (const fixture of REGRESSION_FIXTURES) {
      const parsed = assertFixtureMatches(fixture.promptVersion, fixture.rawJson);
      expect(parsed).toEqual(fixture.expected);
    }
  });

  it("fails when prompt version does not match current template hash", () => {
    const fixture = REGRESSION_FIXTURES[0]!;
    expect(() => assertFixtureMatches("deadbeef".repeat(8), fixture.rawJson)).toThrow(
      /Prompt version mismatch/,
    );
    expect(() => assertFixtureMatches(fixture.promptVersion, fixture.rawJson)).not.toThrow();
    expect(CURRENT_PROMPT_VERSION).toBe(fixture.promptVersion);
  });
});
