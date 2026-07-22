export type ApiGateConfig = {
  /** When true, requests without a matching apiKey are denied. */
  requireApiKey?: boolean;
  validApiKeys?: readonly string[];
  /** Max requests per IP within rateLimitWindowMs (default 60_000). */
  rateLimitPerWindow?: number;
  rateLimitWindowMs?: number;
};

export type GateRequest = {
  apiKey?: string;
  ip?: string;
};

export type GateResult = {
  allowed: boolean;
  reasons: string[];
};

type WindowBucket = {
  windowStartMs: number;
  count: number;
};

const ipBuckets = new Map<string, WindowBucket>();

/** Clears in-memory rate limit state (for tests). */
export function resetRateLimitStore(): void {
  ipBuckets.clear();
}

function checkApiKey(
  request: GateRequest,
  config: ApiGateConfig,
  reasons: string[],
): void {
  if (!config.requireApiKey) {
    return;
  }

  const key = request.apiKey?.trim();
  if (!key) {
    reasons.push("auth:missing_api_key");
    return;
  }

  const allowed = config.validApiKeys ?? [];
  if (!allowed.includes(key)) {
    reasons.push("auth:invalid_api_key");
  }
}

function checkRateLimit(
  request: GateRequest,
  config: ApiGateConfig,
  reasons: string[],
  nowMs: number,
): void {
  const limit = config.rateLimitPerWindow;
  if (limit === undefined || limit <= 0) {
    return;
  }

  const ip = request.ip?.trim() || "unknown";
  const windowMs = config.rateLimitWindowMs ?? 60_000;

  let bucket = ipBuckets.get(ip);
  if (!bucket || nowMs - bucket.windowStartMs >= windowMs) {
    bucket = { windowStartMs: nowMs, count: 0 };
    ipBuckets.set(ip, bucket);
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    reasons.push(`rate_limit:ip:${ip}`);
  }
}

export type CheckRequestOptions = {
  /** Injectable clock for deterministic tests. */
  nowMs?: number;
};

/**
 * API gate (S11): auth + per-IP rate limit before hitting the agent backend.
 */
export function checkRequest(
  request: GateRequest,
  config: ApiGateConfig,
  options: CheckRequestOptions = {},
): GateResult {
  const reasons: string[] = [];
  const nowMs = options.nowMs ?? Date.now();

  checkApiKey(request, config, reasons);
  checkRateLimit(request, config, reasons, nowMs);

  return { allowed: reasons.length === 0, reasons };
}
