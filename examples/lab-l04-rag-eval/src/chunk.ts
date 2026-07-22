/** One indexed slice of a source document for retrieval. */
export type TextChunk = {
  id: string;
  text: string;
  source: string;
};

export type ChunkMode = "char" | "token";

export type ChunkOptions = {
  /** Max units per chunk (characters or whitespace-delimited tokens). */
  chunkSize: number;
  /** Overlap between consecutive chunks (same unit as mode). */
  overlap: number;
  mode?: ChunkMode;
};

function assertValidOptions(options: ChunkOptions): void {
  if (options.chunkSize <= 0) {
    throw new Error("chunkSize must be positive");
  }
  if (options.overlap < 0) {
    throw new Error("overlap must be non-negative");
  }
  if (options.overlap >= options.chunkSize) {
    throw new Error("overlap must be smaller than chunkSize");
  }
}

/** Split document text into overlapping chunks with stable ids `{source}#{index}`. */
export function chunkText(
  text: string,
  source: string,
  options: ChunkOptions,
): TextChunk[] {
  assertValidOptions(options);
  const mode = options.mode ?? "char";

  if (text.length === 0) {
    return [];
  }

  if (mode === "char") {
    return chunkByChar(text, source, options.chunkSize, options.overlap);
  }

  return chunkByToken(text, source, options.chunkSize, options.overlap);
}

function chunkByChar(
  text: string,
  source: string,
  chunkSize: number,
  overlap: number,
): TextChunk[] {
  const chunks: TextChunk[] = [];
  const step = chunkSize - overlap;
  let index = 0;

  for (let start = 0; start < text.length; start += step) {
    const slice = text.slice(start, start + chunkSize);
    chunks.push({
      id: `${source}#${index}`,
      text: slice,
      source,
    });
    index += 1;
    if (start + chunkSize >= text.length) {
      break;
    }
  }

  return chunks;
}

function chunkByToken(
  text: string,
  source: string,
  chunkSize: number,
  overlap: number,
): TextChunk[] {
  const tokens = text.split(/\s+/).filter((t) => t.length > 0);
  if (tokens.length === 0) {
    return [];
  }

  const chunks: TextChunk[] = [];
  const step = chunkSize - overlap;
  let index = 0;

  for (let start = 0; start < tokens.length; start += step) {
    const slice = tokens.slice(start, start + chunkSize);
    chunks.push({
      id: `${source}#${index}`,
      text: slice.join(" "),
      source,
    });
    index += 1;
    if (start + chunkSize >= tokens.length) {
      break;
    }
  }

  return chunks;
}
