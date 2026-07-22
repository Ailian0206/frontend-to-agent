/** Agent / server error codes for in-memory MCP simulation. */
export const McpErrorCode = {
  NOT_FOUND: "NOT_FOUND",
  FORBIDDEN: "FORBIDDEN",
} as const;

export type McpErrorCode = (typeof McpErrorCode)[keyof typeof McpErrorCode];

export class McpProtocolError extends Error {
  readonly code: McpErrorCode;

  constructor(code: McpErrorCode, message: string) {
    super(message);
    this.name = "McpProtocolError";
    this.code = code;
  }
}

export function isMcpProtocolError(value: unknown): value is McpProtocolError {
  return value instanceof McpProtocolError;
}
