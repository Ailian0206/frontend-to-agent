import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import { createHitlApp } from "./hitl-routes.js";
import { HitlNotifyGate } from "./notify-hitl.js";

describe("createHitlApp", () => {
  it("propose → confirm returns sent status", async () => {
    const gate = new HitlNotifyGate();
    const app = new Hono().route("/api/hitl", createHitlApp(gate));

    const proposeRes = await app.request("/api/hitl/notify/propose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        threadId: "t1",
        message: "hello",
        idempotencyKey: "k1",
      }),
    });
    expect(proposeRes.status).toBe(202);
    const proposal = (await proposeRes.json()) as {
      proposalId: string;
      token: string;
    };

    const confirmRes = await app.request("/api/hitl/notify/confirm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        proposalId: proposal.proposalId,
        token: proposal.token,
      }),
    });
    expect(confirmRes.status).toBe(200);
    const body = await confirmRes.json();
    expect(body).toMatchObject({ status: "sent", threadId: "t1" });
  });
});
