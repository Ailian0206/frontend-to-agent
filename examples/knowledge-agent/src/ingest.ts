import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Document } from "@langchain/core/documents";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantClient } from "@qdrant/js-client-rest";
import { env } from "./config.js";
import { createEmbeddings } from "./vector-store.js";

async function loadMarkdownDocuments(directory: string): Promise<Document[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const markdownFiles = entries.filter(
    (entry) => entry.isFile() && entry.name.endsWith(".md"),
  );

  if (markdownFiles.length === 0) {
    throw new Error(`No Markdown files found in ${directory}`);
  }

  return Promise.all(
    markdownFiles.map(async (entry) => {
      const filePath = path.join(directory, entry.name);
      return new Document({
        pageContent: await readFile(filePath, "utf8"),
        metadata: { source: entry.name },
      });
    }),
  );
}

async function resetCollection(): Promise<void> {
  const client = new QdrantClient({ url: env.QDRANT_URL });
  const { collections } = await client.getCollections();
  const exists = collections.some(
    (collection) => collection.name === env.QDRANT_COLLECTION,
  );
  if (exists) await client.deleteCollection(env.QDRANT_COLLECTION);
}

async function main(): Promise<void> {
  const knowledgeDir = path.resolve("knowledge");
  const documents = await loadMarkdownDocuments(knowledgeDir);
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 700,
    chunkOverlap: 120,
  });
  const chunks = await splitter.splitDocuments(documents);

  await resetCollection();
  await QdrantVectorStore.fromDocuments(chunks, createEmbeddings(), {
    url: env.QDRANT_URL,
    collectionName: env.QDRANT_COLLECTION,
  });

  console.log(
    `Indexed ${documents.length} documents as ${chunks.length} chunks into ${env.QDRANT_COLLECTION}.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
