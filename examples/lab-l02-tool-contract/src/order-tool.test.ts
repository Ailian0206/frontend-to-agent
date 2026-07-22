import { describe, expect, it } from "vitest";
import { ToolErrorCode, isToolExecutionError } from "./errors.js";
import { executeOrderStatus } from "./order-tool.js";

describe("executeOrderStatus — happy path", () => {
  it("returns status for agent with default dryRun=true", async () => {
    const result = await executeOrderStatus({
      input: { orderId: "ORD-000002" },
      actor: { role: "agent" },
    });
    expect(result).toEqual({
      orderId: "ORD-000002",
      status: "shipped",
      dryRun: true,
    });
  });

  it("allows admin to query with dryRun=false (live read)", async () => {
    const result = await executeOrderStatus({
      input: { orderId: "ORD-000001", dryRun: false },
      actor: { role: "admin" },
    });
    expect(result).toEqual({
      orderId: "ORD-000001",
      status: "pending",
      dryRun: false,
    });
  });

  it("derives pending vs shipped from order id parity", async () => {
    const pending = await executeOrderStatus({
      input: { orderId: "ORD-100003", dryRun: true },
      actor: { role: "agent" },
    });
    expect(pending.status).toBe("pending");

    const shipped = await executeOrderStatus({
      input: { orderId: "ORD-100004", dryRun: true },
      actor: { role: "agent" },
    });
    expect(shipped.status).toBe("shipped");
  });
});

describe("executeOrderStatus — INVALID_ARGS", () => {
  it("rejects missing orderId", async () => {
    await expect(
      executeOrderStatus({
        input: {},
        actor: { role: "agent" },
      }),
    ).rejects.toMatchObject({ code: ToolErrorCode.INVALID_ARGS });
  });

  it("rejects malformed orderId", async () => {
    await expect(
      executeOrderStatus({
        input: { orderId: "ORDER-123" },
        actor: { role: "agent" },
      }),
    ).rejects.toMatchObject({ code: ToolErrorCode.INVALID_ARGS });
  });

  it("rejects non-boolean dryRun", async () => {
    await expect(
      executeOrderStatus({
        input: { orderId: "ORD-000001", dryRun: "yes" },
        actor: { role: "agent" },
      }),
    ).rejects.toMatchObject({ code: ToolErrorCode.INVALID_ARGS });
  });

  it("rejects null input", async () => {
    try {
      await executeOrderStatus({
        input: null,
        actor: { role: "agent" },
      });
      expect.fail("expected throw");
    } catch (error) {
      expect(isToolExecutionError(error)).toBe(true);
      if (isToolExecutionError(error)) {
        expect(error.code).toBe(ToolErrorCode.INVALID_ARGS);
      }
    }
  });
});

describe("executeOrderStatus — FORBIDDEN", () => {
  it("blocks agent when dryRun is false", async () => {
    await expect(
      executeOrderStatus({
        input: { orderId: "ORD-000010", dryRun: false },
        actor: { role: "agent" },
      }),
    ).rejects.toMatchObject({
      code: ToolErrorCode.FORBIDDEN,
      message: expect.stringContaining("dryRun"),
    });
  });
});

describe("executeOrderStatus — TIMEOUT", () => {
  it("throws TIMEOUT when signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      executeOrderStatus({
        input: { orderId: "ORD-000005", dryRun: true },
        actor: { role: "agent" },
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ code: ToolErrorCode.TIMEOUT });
  });

  it("throws TIMEOUT when upstream sees aborted signal", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      executeOrderStatus({
        input: { orderId: "ORD-000006", dryRun: true },
        actor: { role: "admin" },
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ code: ToolErrorCode.TIMEOUT });
  });
});

describe("executeOrderStatus — UPSTREAM", () => {
  it("maps reserved order id to UPSTREAM failure", async () => {
    await expect(
      executeOrderStatus({
        input: { orderId: "ORD-999999", dryRun: true },
        actor: { role: "admin" },
      }),
    ).rejects.toMatchObject({ code: ToolErrorCode.UPSTREAM });
  });
});
