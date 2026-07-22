/**
 * Recall@K: fraction of relevant ids present in the first K retrieved ids.
 * When there are no relevant ids, recall is defined as 1 (nothing to miss).
 */
export function recallAtK(
  relevantIds: readonly string[],
  retrievedIds: readonly string[],
  k: number,
): number {
  if (relevantIds.length === 0) {
    return 1;
  }
  if (k <= 0) {
    return 0;
  }

  const topK = new Set(retrievedIds.slice(0, k));
  let hits = 0;
  for (const id of relevantIds) {
    if (topK.has(id)) {
      hits += 1;
    }
  }

  return hits / relevantIds.length;
}
