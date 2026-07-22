import { describe, expect, it } from "vitest";
import { chunkText } from "./chunk.js";

describe("chunkText", () => {
  it("splits by character with overlap and stable ids", () => {
    const text = "abcdefghijklmnopqrstuvwxyz";
    const chunks = chunkText(text, "doc-a", {
      chunkSize: 10,
      overlap: 2,
      mode: "char",
    });

    expect(chunks.map((c) => c.text)).toEqual([
      "abcdefghij",
      "ijklmnopqr",
      "qrstuvwxyz",
    ]);
    expect(chunks[0]?.id).toBe("doc-a#0");
    expect(chunks[1]?.id).toBe("doc-a#1");
    expect(chunks.every((c) => c.source === "doc-a")).toBe(true);
  });

  it("returns empty array for empty input", () => {
    expect(chunkText("", "empty", { chunkSize: 8, overlap: 2 })).toEqual([]);
  });

  it("splits by token with overlap", () => {
    const text = "one two three four five six seven";
    const chunks = chunkText(text, "tok", {
      chunkSize: 3,
      overlap: 1,
      mode: "token",
    });

    expect(chunks.map((c) => c.text)).toEqual([
      "one two three",
      "three four five",
      "five six seven",
    ]);
  });

  it("rejects invalid overlap", () => {
    expect(() =>
      chunkText("abc", "x", { chunkSize: 4, overlap: 4 }),
    ).toThrow(/overlap/);
  });

  it("single short document yields one chunk", () => {
    const chunks = chunkText("短文本", "s", { chunkSize: 100, overlap: 10 });
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.text).toBe("短文本");
  });
});
