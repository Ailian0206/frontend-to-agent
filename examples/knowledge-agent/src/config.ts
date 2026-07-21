import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  OPENAI_BASE_URL: z.url().optional().or(z.literal("")),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  QDRANT_URL: z.url().default("http://127.0.0.1:6333"),
  QDRANT_COLLECTION: z.string().default("personal_knowledge"),
  DATABASE_URL: z.url().default("postgresql://agent:agent@127.0.0.1:5432/agent"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
});

export const env = EnvSchema.parse(process.env);
