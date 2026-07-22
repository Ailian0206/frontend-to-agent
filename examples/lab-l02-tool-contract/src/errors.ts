/** Stable error codes for tool execution (agent-facing, machine-readable). */
export const ToolErrorCode = {
  INVALID_ARGS: "INVALID_ARGS",
  FORBIDDEN: "FORBIDDEN",
  TIMEOUT: "TIMEOUT",
  UPSTREAM: "UPSTREAM",
} as const;

export type ToolErrorCode = (typeof ToolErrorCode)[keyof typeof ToolErrorCode];

export class ToolExecutionError extends Error {
  readonly code: ToolErrorCode;

  constructor(code: ToolErrorCode, message: string) {
    super(message);
    this.name = "ToolExecutionError";
    this.code = code;
  }
}

export function isToolExecutionError(error: unknown): error is ToolExecutionError {
  return error instanceof ToolExecutionError;
}
