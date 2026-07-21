import { tool } from "langchain";
import { z } from "zod";
import { formatSearchHits } from "./format.js";
import { connectVectorStore } from "./vector-store.js";

export async function createSearchKnowledgeTool() {
  const store = await connectVectorStore();

  return tool(
    async ({ query, limit }) => {
      try {
        const results = await store.similaritySearchWithScore(query, limit);
        return formatSearchHits(
          results.map(([document, score]) => ({
            pageContent: document.pageContent,
            metadata: document.metadata,
            score,
          })),
        );
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        throw new Error(`Knowledge search failed: ${detail}`);
      }
    },
    {
      name: "search_knowledge",
      description:
        "Search the private knowledge base. Use it before answering questions about the user's documents.",
      schema: z.object({
        query: z.string().min(2).describe("A standalone semantic search query"),
        limit: z.number().int().min(1).max(8).default(4),
      }),
    },
  );
}
