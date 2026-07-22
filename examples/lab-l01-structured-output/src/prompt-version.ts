import { createHash } from "node:crypto";

/** Stable SHA-256 hex digest for prompt template versioning and regression pins. */
export function hashPrompt(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}
