import { describe, expect, it } from "vitest";
import type { TextChunk } from "./chunk.js";
import { buildFixtureChunks, evalQueries } from "./fixtures.js";
import { recallAtK } from "./metrics.js";
import { retrieve, tokenize } from "./retrieve.js";

describe("retrieve", () => {
  const fixtureChunks = buildFixtureChunks();

  it("tokenize strips punctuation and lowercases", () => {
    expect(tokenize("Recall@K, BM25-lite!")).toEqual([
      "recall",
      "k",
      "bm25",
      "lite",
    ]);
  });

  it("returns empty when corpus or k is empty", () => {
    expect(retrieve("q", [], { k: 3 })).toEqual([]);
    const chunks: TextChunk[] = [
      { id: "1", text: "hello", source: "s" },
    ];
    expect(retrieve("hello", chunks, { k: 0 })).toEqual([]);
  });

  it("ranks gold fixture chunks at top for each eval query", () => {
    for (const { query, relevantIds } of evalQueries) {
      const ids = retrieve(query, fixtureChunks, { k: 3 });
      const gold = relevantIds[0];
      expect(ids[0], `query: ${query}`).toBe(gold);
    }
  });

  it("achieves recall@1 = 1 on fixture queries with k=1", () => {
    for (const { query, relevantIds } of evalQueries) {
      const ids = retrieve(query, fixtureChunks, { k: 5 });
      expect(recallAtK(relevantIds, ids, 1)).toBe(1);
    }
  });

  it("breaks score ties by chunk id lexicographic order", () => {
    const chunks: TextChunk[] = [
      { id: "b-chunk", text: "alpha beta", source: "b" },
      { id: "a-chunk", text: "alpha beta", source: "a" },
    ];
    expect(retrieve("alpha", chunks, { k: 2 })).toEqual([
      "a-chunk",
      "b-chunk",
    ]);
  });

  it("ranks higher overlap before unrelated chunks", () => {
    const chunks: TextChunk[] = [
      { id: "noise", text: "无关内容", source: "n" },
      {
        id: "match",
        text: "向量检索 Recall 评估指标",
        source: "m",
      },
    ];
    const ids = retrieve("Recall 向量检索", chunks, { k: 2 });
    expect(ids[0]).toBe("match");
  });
});
