import { McpErrorCode, McpProtocolError } from "./errors.js";
import type { InMemoryMcpServer } from "./mcp-server.js";

/** Agent-side gate: allowlist + read-only tools only. */
export class WhitelistAgent {
  constructor(
    private readonly server: InMemoryMcpServer,
    private readonly allowedToolNames: readonly string[],
  ) {}

  async call(name: string, args: Record<string, unknown> = {}): Promise<unknown> {
    if (!this.allowedToolNames.includes(name)) {
      throw new McpProtocolError(
        McpErrorCode.FORBIDDEN,
        `Tool not on allowlist: ${name}`,
      );
    }

    const descriptor = this.server.listTools().find((tool) => tool.name === name);
    if (!descriptor) {
      throw new McpProtocolError(
        McpErrorCode.NOT_FOUND,
        `Tool not registered on server: ${name}`,
      );
    }

    if (!descriptor.readOnly) {
      throw new McpProtocolError(
        McpErrorCode.FORBIDDEN,
        `Write-capable tool blocked for agent: ${name}`,
      );
    }

    return this.server.callTool(name, args);
  }
}
