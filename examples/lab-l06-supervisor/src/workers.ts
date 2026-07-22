import type { WorkerId } from "./types.js";

/** Minimal worker contract: fixed tool whitelist + in-memory mock execution. */
export type Worker = {
  id: WorkerId;
  allowedTools: readonly string[];
  invoke: (toolName: string, args: Record<string, unknown>) => unknown;
};

const MOCK_ORDERS: Record<string, { status: string }> = {
  "ORD-000001": { status: "shipped" },
  "ORD-000002": { status: "processing" },
};

const MOCK_DOCS: { id: string; title: string; snippet: string }[] = [
  {
    id: "pol-001",
    title: "退货政策",
    snippet: "签收 7 日内可无理由退货（定制商品除外）。",
  },
  {
    id: "pol-002",
    title: "运费说明",
    snippet: "满 99 元包邮，偏远地区加收附加费。",
  },
];

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter(Boolean);
}

/** Worker A — order read-only; only `orders:read` is permitted. */
export const workerA: Worker = {
  id: "A",
  allowedTools: ["orders:read"],
  invoke(toolName, args) {
    if (toolName !== "orders:read") {
      throw new Error(`WorkerA cannot invoke ${toolName}`);
    }
    const orderId = args["orderId"];
    if (typeof orderId !== "string") {
      return { error: "INVALID_ARGS", message: "orderId must be a string" };
    }
    const record = MOCK_ORDERS[orderId];
    if (!record) {
      return { error: "NOT_FOUND", orderId };
    }
    return { orderId, status: record.status };
  },
};

/** Worker B — documentation search; only `docs:search` is permitted. */
export const workerB: Worker = {
  id: "B",
  allowedTools: ["docs:search"],
  invoke(toolName, args) {
    if (toolName !== "docs:search") {
      throw new Error(`WorkerB cannot invoke ${toolName}`);
    }
    const query = args["query"];
    if (typeof query !== "string" || query.trim() === "") {
      return { error: "INVALID_ARGS", message: "query must be a non-empty string" };
    }
    const terms = tokenize(query);
    const hits = MOCK_DOCS.filter((doc) => {
      const hay = `${doc.title} ${doc.snippet}`.toLowerCase();
      return terms.some((t) => hay.includes(t));
    });
    return { query, hits };
  },
};

export const workersById: Record<WorkerId, Worker> = {
  A: workerA,
  B: workerB,
};
