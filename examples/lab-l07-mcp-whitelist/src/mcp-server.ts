import { McpErrorCode, McpProtocolError } from "./errors.js";

export type McpToolDescriptor = {
  name: string;
  description: string;
  readOnly: boolean;
};

export type McpToolRegistration<
  TArgs extends Record<string, unknown> = Record<string, unknown>,
  TResult = unknown,
> = {
  name: string;
  description: string;
  readOnly: boolean;
  handler: (args: TArgs) => TResult | Promise<TResult>;
};

type StoredTool = McpToolRegistration<Record<string, unknown>, unknown>;

/** Minimal in-memory MCP tool host — no network, no official SDK. */
export class InMemoryMcpServer {
  private readonly tools = new Map<string, StoredTool>();

  registerTool(registration: McpToolRegistration): void {
    this.tools.set(registration.name, registration as StoredTool);
  }

  listTools(): McpToolDescriptor[] {
    return [...this.tools.values()]
      .map(({ name, description, readOnly }) => ({ name, description, readOnly }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async callTool(
    name: string,
    args: Record<string, unknown> = {},
  ): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new McpProtocolError(
        McpErrorCode.NOT_FOUND,
        `Unknown tool: ${name}`,
      );
    }
    return tool.handler(args);
  }
}
