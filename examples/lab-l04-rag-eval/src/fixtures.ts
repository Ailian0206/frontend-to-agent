import { chunkText, type TextChunk } from "./chunk.js";

/** Short in-memory corpus for offline retrieval eval (no network). */
export const corpusDocuments: { source: string; body: string }[] = [
  {
    source: "rag-intro",
    body:
      "RAG 将检索与生成结合。入库前需要切块 chunk overlap，以便上下文连续。",
  },
  {
    source: "eval-metrics",
    body:
      "Recall at K 衡量前 K 条结果覆盖了多少相关文档。向量检索与 BM25 都可评估。",
  },
  {
    source: "ci-mock",
    body:
      "CI 中使用 mock 语料与固定查询，避免调用 OpenAI 或 Qdrant 等外部服务。",
  },
];

const CHUNK_OPTS = { chunkSize: 48, overlap: 8, mode: "char" as const };

/** Full chunk index built from the fixture corpus. */
export function buildFixtureChunks(): TextChunk[] {
  const all: TextChunk[] = [];
  for (const doc of corpusDocuments) {
    all.push(...chunkText(doc.body, doc.source, CHUNK_OPTS));
  }
  return all;
}

export type EvalQuery = {
  query: string;
  relevantIds: string[];
};

/**
 * Gold labels: chunk ids that should rank highly for each query.
 * Ids match chunkText output for corpusDocuments + CHUNK_OPTS.
 */
export const evalQueries: EvalQuery[] = [
  {
    query: "切块 overlap 入库",
    relevantIds: ["rag-intro#0"],
  },
  {
    query: "Recall K 向量检索",
    relevantIds: ["eval-metrics#0"],
  },
  {
    query: "CI mock OpenAI Qdrant",
    relevantIds: ["ci-mock#0"],
  },
];
