import type { BaseMessage } from "@langchain/core/messages";

export interface SearchHit {
  pageContent: string;
  metadata: Record<string, unknown>;
  score: number;
}

export function formatSearchHits(hits: SearchHit[]): string {
  if (hits.length === 0) return "No relevant knowledge was found.";

  return hits
    .map((hit, index) => {
      const source = String(hit.metadata.source ?? "unknown");
      return [
        `Result ${index + 1}`,
        `source: ${source}`,
        `score: ${hit.score.toFixed(4)}`,
        hit.pageContent,
      ].join("\n");
    })
    .join("\n\n---\n\n");
}

export function messageText(message: BaseMessage | undefined): string {
  if (!message) return "";
  if (typeof message.content === "string") return message.content;

  return message.content
    .map((block) => {
      if (typeof block === "string") return block;
      if ("text" in block && typeof block.text === "string") return block.text;
      return "";
    })
    .filter(Boolean)
    .join("\n");
}
