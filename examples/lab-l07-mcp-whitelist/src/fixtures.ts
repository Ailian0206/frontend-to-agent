import { InMemoryMcpServer } from "./mcp-server.js";

/** Demo catalog: read-only queries plus one write tool for deny-path tests. */
export function createDemoMcpServer(): InMemoryMcpServer {
  const server = new InMemoryMcpServer();

  server.registerTool({
    name: "docs.search",
    description: "Search internal documentation (read-only).",
    readOnly: true,
    handler: (args) => {
      const query = String(args.query ?? "");
      return { hits: query ? [`doc:${query}`] : [] };
    },
  });

  server.registerTool({
    name: "orders.get",
    description: "Fetch order snapshot by id (read-only).",
    readOnly: true,
    handler: (args) => {
      const orderId = String(args.orderId ?? "");
      return { orderId, status: orderId.endsWith("2") ? "shipped" : "pending" };
    },
  });

  server.registerTool({
    name: "orders.cancel",
    description: "Cancel an order (mutating).",
    readOnly: false,
    handler: (args) => ({ cancelled: true, orderId: String(args.orderId ?? "") }),
  });

  return server;
}
