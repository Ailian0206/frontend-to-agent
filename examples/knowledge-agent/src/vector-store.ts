import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { env } from "./config.js";

export function createEmbeddings(): OpenAIEmbeddings {
  return new OpenAIEmbeddings({
    apiKey: env.OPENAI_API_KEY,
    model: env.EMBEDDING_MODEL,
    timeout: 20_000,
    configuration: env.OPENAI_BASE_URL
      ? { baseURL: env.OPENAI_BASE_URL }
      : undefined,
  });
}

export async function connectVectorStore(): Promise<QdrantVectorStore> {
  return QdrantVectorStore.fromExistingCollection(createEmbeddings(), {
    url: env.QDRANT_URL,
    collectionName: env.QDRANT_COLLECTION,
  });
}
