/** Supervisor / worker outcomes (machine-readable for orchestration). */
export const SupervisorErrorCode = {
  REJECTED: "REJECTED",
  FORBIDDEN: "FORBIDDEN",
} as const;

export type SupervisorErrorCode =
  (typeof SupervisorErrorCode)[keyof typeof SupervisorErrorCode];

export type Intent = "order_status" | "policy_question" | "unknown";

export type WorkerId = "A" | "B";

export type RouteResult =
  | { worker: WorkerId }
  | { reject: true; reason: string };

export type RunSuccess = {
  ok: true;
  worker: WorkerId;
  tool: string;
  data: unknown;
};

export type RunFailure = {
  ok: false;
  code: SupervisorErrorCode;
  reason: string;
};

export type RunResult = RunSuccess | RunFailure;
