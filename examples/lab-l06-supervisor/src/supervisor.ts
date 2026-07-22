import { workersById } from "./workers.js";
import {
  SupervisorErrorCode,
  type Intent,
  type RouteResult,
  type RunResult,
} from "./types.js";

/**
 * Map user intent to a single worker. Unknown intents are rejected before any tool runs.
 */
export function route(intent: Intent): RouteResult {
  switch (intent) {
    case "order_status":
      return { worker: "A" };
    case "policy_question":
      return { worker: "B" };
    case "unknown":
      return {
        reject: true,
        reason: "无法识别意图，拒答且不调用任何 Worker Tool",
      };
    default: {
      const _exhaustive: never = intent;
      return _exhaustive;
    }
  }
}

function isToolAllowed(workerId: "A" | "B", toolName: string): boolean {
  const worker = workersById[workerId];
  return worker.allowedTools.includes(toolName);
}

/**
 * Route by intent, then invoke the tool only if it appears on that worker's whitelist.
 */
export function run(
  intent: Intent,
  toolName: string,
  args: Record<string, unknown>,
): RunResult {
  const routed = route(intent);
  if (!("worker" in routed)) {
    return {
      ok: false,
      code: SupervisorErrorCode.REJECTED,
      reason: routed.reason,
    };
  }

  const workerId = routed.worker;
  if (!isToolAllowed(workerId, toolName)) {
    return {
      ok: false,
      code: SupervisorErrorCode.FORBIDDEN,
      reason: `Worker ${workerId} 未授权 Tool「${toolName}」；允许：${workersById[workerId].allowedTools.join(", ")}`,
    };
  }

  const worker = workersById[workerId];
  const data = worker.invoke(toolName, args);
  return { ok: true, worker: workerId, tool: toolName, data };
}
