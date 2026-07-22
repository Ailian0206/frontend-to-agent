import { Hono } from "hono";
import { z } from "zod";
import {
  HitlErrorCode,
  HitlNotifyGate,
  isHitlError,
} from "./notify-hitl.js";

const ProposeBody = z.object({
  threadId: z.string().trim().min(1).max(128),
  message: z.string().trim().min(1).max(4_000),
  idempotencyKey: z.string().trim().min(1).max(128),
});

const TokenBody = z.object({
  proposalId: z.string().uuid(),
  token: z.string().min(16).max(128),
});

/**
 * HITL HTTP handlers (S7). Mount on the main app without importing the LangGraph agent.
 *
 * ```ts
 * const gate = new HitlNotifyGate();
 * app.route("/api/hitl", createHitlApp(gate));
 * ```
 */
export function createHitlApp(gate: HitlNotifyGate): Hono {
  const app = new Hono();

  app.post("/notify/propose", async (context) => {
    const body = ProposeBody.safeParse(await context.req.json().catch(() => null));
    if (!body.success) {
      return context.json(
        { error: "Invalid request", issues: body.error.flatten() },
        400,
      );
    }
    const proposal = gate.proposeNotify(body.data);
    return context.json(proposal, 202);
  });

  app.post("/notify/confirm", async (context) => {
    const body = TokenBody.safeParse(await context.req.json().catch(() => null));
    if (!body.success) {
      return context.json(
        { error: "Invalid request", issues: body.error.flatten() },
        400,
      );
    }
    try {
      const result = gate.confirm(body.data.proposalId, body.data.token);
      return context.json(result);
    } catch (error) {
      if (isHitlError(error)) {
        return context.json(
          { error: error.message, code: error.code },
          hitlErrorStatus(error.code),
        );
      }
      return context.json({ error: "HITL request failed" }, 500);
    }
  });

  app.post("/notify/reject", async (context) => {
    const body = TokenBody.safeParse(await context.req.json().catch(() => null));
    if (!body.success) {
      return context.json(
        { error: "Invalid request", issues: body.error.flatten() },
        400,
      );
    }
    try {
      const result = gate.reject(body.data.proposalId, body.data.token);
      return context.json(result);
    } catch (error) {
      if (isHitlError(error)) {
        return context.json(
          { error: error.message, code: error.code },
          hitlErrorStatus(error.code),
        );
      }
      return context.json({ error: "HITL request failed" }, 500);
    }
  });

  return app;
}

function hitlErrorStatus(code: HitlErrorCode): 403 | 404 | 409 {
  if (code === HitlErrorCode.NOT_FOUND) return 404;
  if (code === HitlErrorCode.INVALID_TOKEN) return 403;
  return 409;
}
