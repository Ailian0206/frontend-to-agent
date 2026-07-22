import { describe, expect, it } from "vitest";
import { recallAtK } from "./metrics.js";

describe("recallAtK", () => {
  it("computes full recall when all relevant ids are in top K", () => {
    expect(recallAtK(["a", "b"], ["a", "b", "c"], 2)).toBe(1);
  });

  it("computes partial recall", () => {
    expect(recallAtK(["a", "b"], ["b", "c", "d"], 3)).toBe(0.5);
  });

  it("only considers first K retrieved ids", () => {
    expect(recallAtK(["a"], ["x", "y", "a"], 2)).toBe(0);
    expect(recallAtK(["a"], ["x", "y", "a"], 3)).toBe(1);
  });

  it("returns 1 when there are no relevant ids", () => {
    expect(recallAtK([], ["a"], 5)).toBe(1);
  });

  it("returns 0 when K is zero or retrieved is empty", () => {
    expect(recallAtK(["a"], ["a"], 0)).toBe(0);
    expect(recallAtK(["a"], [], 5)).toBe(0);
  });

  it("counts each listed relevant id toward the denominator", () => {
    expect(recallAtK(["a", "a"], ["a", "b"], 1)).toBe(1);
    expect(recallAtK(["a", "b"], ["a", "c"], 1)).toBe(0.5);
  });
});
