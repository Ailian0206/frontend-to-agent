import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { z } from "zod";
import { createKnowledgeAgent } from "./agent.js";
import { invokeWithTimeout } from "./agent-run.js";
import { env } from "./config.js";
import { messageText } from "./format.js";

const ChatInput = z.object({
  message: z.string().trim().min(1).max(8_000),
  threadId: z.string().trim().min(1).max(128),
});

const agent = await createKnowledgeAgent();
const app = new Hono();

app.get("/api/health", (context) => context.json({ ok: true }));

app.post("/api/chat", async (context) => {
  const input = ChatInput.safeParse(await context.req.json().catch(() => null));
  if (!input.success) {
    return context.json(
      { error: "Invalid request", issues: input.error.flatten() },
      400,
    );
  }

  // Authentication and rate limiting belong at the trusted reverse-proxy/API boundary.
  const result = await invokeWithTimeout(
    (signal) => agent.invoke(
      { messages: [{ role: "user", content: input.data.message }] },
      {
        configurable: { thread_id: input.data.threadId },
        recursionLimit: 12,
        signal,
      },
    ),
  );

  return context.json({
    answer: messageText(result.messages.at(-1)),
    threadId: input.data.threadId,
  });
});

app.onError((error, context) => {
  console.error(error);
  return context.json({ error: "Agent request failed" }, 500);
});

app.use("/*", serveStatic({ root: "./public" }));

serve({ fetch: app.fetch, port: env.PORT }, ({ port }) => {
  console.log(`Knowledge Agent: http://localhost:${port}`);
});
