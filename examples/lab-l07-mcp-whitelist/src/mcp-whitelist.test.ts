import { describe, expect, it } from "vitest";
import { WhitelistAgent } from "./agent-client.js";
import { McpErrorCode, isMcpProtocolError } from "./errors.js";
import { createDemoMcpServer } from "./fixtures.js";
import { InMemoryMcpServer } from "./mcp-server.js";

describe("InMemoryMcpServer", () => {
  it("lists registered tools with readOnly metadata", () => {
    const server = createDemoMcpServer();
    expect(server.listTools()).toEqual([
      {
        name: "docs.search",
        description: "Search internal documentation (read-only).",
        readOnly: true,
      },
      {
        name: "orders.cancel",
        description: "Cancel an order (mutating).",
        readOnly: false,
      },
      {
        name: "orders.get",
        description: "Fetch order snapshot by id (read-only).",
        readOnly: true,
      },
    ]);
  });

  it("callTool rejects unknown tools with NOT_FOUND", async () => {
    const server = new InMemoryMcpServer();
    await expect(server.callTool("missing.tool", {})).rejects.toMatchObject({
      code: McpErrorCode.NOT_FOUND,
    });
  });
});

describe("WhitelistAgent — allow", () => {
  it("invokes whitelisted read-only tools via the server", async () => {
    const server = createDemoMcpServer();
    const agent = new WhitelistAgent(server, ["docs.search", "orders.get"]);

    await expect(agent.call("docs.search", { query: "mcp" })).resolves.toEqual({
      hits: ["doc:mcp"],
    });

    await expect(agent.call("orders.get", { orderId: "ORD-000002" })).resolves.toEqual({
      orderId: "ORD-000002",
      status: "shipped",
    });
  });
});

describe("WhitelistAgent — deny", () => {
  it("returns FORBIDDEN when tool is not on the allowlist", async () => {
    const server = createDemoMcpServer();
    const agent = new WhitelistAgent(server, ["orders.get"]);

    try {
      await agent.call("docs.search", { query: "x" });
      expect.fail("expected throw");
    } catch (error) {
      expect(isMcpProtocolError(error)).toBe(true);
      if (isMcpProtocolError(error)) {
        expect(error.code).toBe(McpErrorCode.FORBIDDEN);
      }
    }
  });

  it("returns FORBIDDEN for write tools even when allowlisted", async () => {
    const server = createDemoMcpServer();
    const agent = new WhitelistAgent(server, ["orders.cancel", "orders.get"]);

    await expect(
      agent.call("orders.cancel", { orderId: "ORD-000001" }),
    ).rejects.toMatchObject({ code: McpErrorCode.FORBIDDEN });
  });

  it("returns NOT_FOUND when allowlisted name is not on the server", async () => {
    const server = createDemoMcpServer();
    const agent = new WhitelistAgent(server, ["inventory.sync"]);

    await expect(agent.call("inventory.sync", {})).rejects.toMatchObject({
      code: McpErrorCode.NOT_FOUND,
    });
  });
});
