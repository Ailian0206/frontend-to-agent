import { afterEach, describe, expect, it } from "vitest";
import { checkRequest, resetRateLimitStore } from "./api-gate.js";
import { gateConfigStrict } from "./fixtures.js";

describe("checkRequest", () => {
  afterEach(() => {
    resetRateLimitStore();
  });

  it("allows valid api key when auth is required", () => {
    const result = checkRequest(
      { apiKey: "ci-test-key", ip: "10.0.0.1" },
      { requireApiKey: true, validApiKeys: ["ci-test-key"] },
    );
    expect(result.allowed).toBe(true);
  });

  it("denies missing api key", () => {
    const result = checkRequest({ ip: "10.0.0.2" }, gateConfigStrict);
    expect(result.allowed).toBe(false);
    expect(result.reasons).toContain("auth:missing_api_key");
  });

  it("denies invalid api key", () => {
    const result = checkRequest(
      { apiKey: "wrong-key", ip: "10.0.0.3" },
      gateConfigStrict,
    );
    expect(result.allowed).toBe(false);
    expect(result.reasons).toContain("auth:invalid_api_key");
  });

  it("enforces per-IP rate limit after threshold", () => {
    const ip = "203.0.113.50";
    const config = {
      requireApiKey: false,
      rateLimitPerWindow: 2,
      rateLimitWindowMs: 60_000,
    };
    const t0 = 1_700_000_000_000;

    expect(checkRequest({ ip }, config, { nowMs: t0 }).allowed).toBe(true);
    expect(checkRequest({ ip }, config, { nowMs: t0 + 1 }).allowed).toBe(true);
    const third = checkRequest({ ip }, config, { nowMs: t0 + 2 });
    expect(third.allowed).toBe(false);
    expect(third.reasons.some((r) => r.startsWith("rate_limit:"))).toBe(true);
  });

  it("resets rate window after rateLimitWindowMs", () => {
    const ip = "203.0.113.99";
    const config = {
      requireApiKey: false,
      rateLimitPerWindow: 1,
      rateLimitWindowMs: 1_000,
    };
    const t0 = 1_700_000_000_000;

    expect(checkRequest({ ip }, config, { nowMs: t0 }).allowed).toBe(true);
    expect(checkRequest({ ip }, config, { nowMs: t0 + 100 }).allowed).toBe(
      false,
    );
    expect(checkRequest({ ip }, config, { nowMs: t0 + 1_001 }).allowed).toBe(
      true,
    );
  });
});
