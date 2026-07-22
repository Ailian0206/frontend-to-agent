import type { TextChunk } from "./chunk.js";

/** Normalize and tokenize for lexical overlap scoring (no external deps). */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

/** Count query terms that appear in the document token bag. */
function overlapScore(queryTokens: string[], docTokens: string[]): number {
  if (queryTokens.length === 0 || docTokens.length === 0) {
    return 0;
  }
  const docSet = new Set(docTokens);
  let hits = 0;
  for (const token of queryTokens) {
    if (docSet.has(token)) {
      hits += 1;
    }
  }
  // BM25-lite style: favor more hits and penalize very long chunks slightly.
  return hits / Math.sqrt(docTokens.length);
}

export type RetrieveOptions = {
  /** Number of chunk ids to return (default 5). */
  k?: number;
};

/**
 * In-memory ranker: sort chunks by token overlap with the query.
 * Returns chunk ids in descending score order (ties broken by id).
 */
export function retrieve(
  query: string,
  chunks: readonly TextChunk[],
  options: RetrieveOptions = {},
): string[] {
  const k = options.k ?? 5;
  if (chunks.length === 0 || k <= 0) {
    return [];
  }

  const queryTokens = tokenize(query);
  const scored = chunks.map((chunk) => ({
    id: chunk.id,
    score: overlapScore(queryTokens, tokenize(chunk.text)),
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.id.localeCompare(b.id);
  });

  return scored.slice(0, k).map((row) => row.id);
}
