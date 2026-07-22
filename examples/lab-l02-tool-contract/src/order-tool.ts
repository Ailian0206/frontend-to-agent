import { z } from "zod";
import { ToolErrorCode, ToolExecutionError } from "./errors.js";

/** Read-only order status query — order id must match ORD-######. */
export const OrderStatusInputSchema = z.object({
  orderId: z
    .string()
    .regex(/^ORD-\d{6}$/, "orderId must match ORD-######"),
  dryRun: z.boolean().default(true),
});

export type OrderStatusInput = z.infer<typeof OrderStatusInputSchema>;

export type OrderStatusResult = {
  orderId: string;
  status: "shipped" | "pending";
  dryRun: boolean;
};

export type ActorRole = "agent" | "admin";

export type ExecuteOrderStatusParams = {
  input: unknown;
  actor: { role: ActorRole };
  signal?: AbortSignal;
};

/** Deterministic fake upstream — no HTTP, safe for CI. */
function fetchOrderStatusFromUpstream(
  orderId: string,
  dryRun: boolean,
  signal?: AbortSignal,
): OrderStatusResult {
  if (signal?.aborted) {
    throw new ToolExecutionError(
      ToolErrorCode.TIMEOUT,
      "Order status request aborted before upstream completed",
    );
  }

  // Simulate reserved id that represents upstream failure in tests.
  if (orderId === "ORD-999999") {
    throw new ToolExecutionError(
      ToolErrorCode.UPSTREAM,
      "Upstream order service unavailable",
    );
  }

  const lastDigit = Number(orderId.slice(-1));
  const status: OrderStatusResult["status"] =
    Number.isFinite(lastDigit) && lastDigit % 2 === 0 ? "shipped" : "pending";

  return { orderId, status, dryRun };
}

/**
 * Read-only tool: validates input, enforces role/dryRun policy, then queries fake upstream.
 */
export async function executeOrderStatus(
  params: ExecuteOrderStatusParams,
): Promise<OrderStatusResult> {
  if (params.signal?.aborted) {
    throw new ToolExecutionError(
      ToolErrorCode.TIMEOUT,
      "Order status request aborted",
    );
  }

  const parsed = OrderStatusInputSchema.safeParse(params.input);
  if (!parsed.success) {
    throw new ToolExecutionError(
      ToolErrorCode.INVALID_ARGS,
      parsed.error.issues.map((i) => i.message).join("; "),
    );
  }

  const { orderId, dryRun } = parsed.data;

  if (!dryRun && params.actor.role === "agent") {
    throw new ToolExecutionError(
      ToolErrorCode.FORBIDDEN,
      "Agent may only query order status with dryRun=true",
    );
  }

  return fetchOrderStatusFromUpstream(orderId, dryRun, params.signal);
}
