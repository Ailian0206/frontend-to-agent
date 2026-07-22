import { describe, expect, it } from "vitest";
import { route, run } from "./supervisor.js";
import { SupervisorErrorCode } from "./types.js";
import { workerA, workerB } from "./workers.js";

describe("route", () => {
  it("order_status → Worker A", () => {
    expect(route("order_status")).toEqual({ worker: "A" });
  });

  it("policy_question → Worker B", () => {
    expect(route("policy_question")).toEqual({ worker: "B" });
  });

  it("unknown → reject", () => {
    const result = route("unknown");
    expect(result).toMatchObject({ reject: true });
    if ("reject" in result && result.reject) {
      expect(result.reason.length).toBeGreaterThan(0);
    }
  });
});

describe("worker whitelists", () => {
  it("WorkerA only exposes orders:read", () => {
    expect(workerA.allowedTools).toEqual(["orders:read"]);
  });

  it("WorkerB only exposes docs:search", () => {
    expect(workerB.allowedTools).toEqual(["docs:search"]);
  });
});

describe("run", () => {
  it("order_status + orders:read returns mock order status", () => {
    const result = run("order_status", "orders:read", { orderId: "ORD-000001" });
    expect(result).toEqual({
      ok: true,
      worker: "A",
      tool: "orders:read",
      data: { orderId: "ORD-000001", status: "shipped" },
    });
  });

  it("policy_question + docs:search returns matching policy hits", () => {
    const result = run("policy_question", "docs:search", { query: "退货" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.worker).toBe("B");
      expect(result.tool).toBe("docs:search");
      const data = result.data as { hits: { id: string }[] };
      expect(data.hits.some((h) => h.id === "pol-001")).toBe(true);
    }
  });

  it("wrong tool for routed worker → FORBIDDEN", () => {
    const result = run("order_status", "docs:search", { query: "退货" });
    expect(result).toEqual({
      ok: false,
      code: SupervisorErrorCode.FORBIDDEN,
      reason: expect.stringContaining("docs:search"),
    });
  });

  it("cross-worker tool on policy path → FORBIDDEN", () => {
    const result = run("policy_question", "orders:read", { orderId: "ORD-000001" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe(SupervisorErrorCode.FORBIDDEN);
    }
  });

  it("unknown intent → REJECTED without invoking tools", () => {
    const result = run("unknown", "orders:read", { orderId: "ORD-000001" });
    expect(result).toMatchObject({
      ok: false,
      code: SupervisorErrorCode.REJECTED,
    });
  });
});
