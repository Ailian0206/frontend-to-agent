import { describe, expect, it } from "vitest";
import * as notifyModule from "./notify-hitl.js";
import {
  HitlErrorCode,
  HitlNotifyGate,
  isHitlError,
} from "./notify-hitl.js";

const sampleNotify = {
  threadId: "thread-demo",
  message: "请审批事故通报草稿",
  idempotencyKey: "notify-idem-001",
};

describe("HitlNotifyGate — confirm happy path", () => {
  it("propose then confirm sends once", () => {
    const gate = new HitlNotifyGate();
    const proposal = gate.proposeNotify(sampleNotify);

    expect(proposal).toMatchObject({ status: "confirm_required" });
    expect(proposal.proposalId).toBeTruthy();
    expect(proposal.token).toBeTruthy();

    const sent = gate.confirm(proposal.proposalId, proposal.token);
    expect(sent).toMatchObject({
      status: "sent",
      proposalId: proposal.proposalId,
      idempotencyKey: sampleNotify.idempotencyKey,
      threadId: sampleNotify.threadId,
    });
    expect(sent.notificationId).toMatch(/^ntf_/);
    expect(gate.getPhysicalSendCount()).toBe(1);
  });
});

describe("HitlNotifyGate — invalid token", () => {
  it("rejects confirm with wrong token", () => {
    const gate = new HitlNotifyGate();
    const { proposalId, token } = gate.proposeNotify(sampleNotify);

    try {
      gate.confirm(proposalId, `${token}x`);
      expect.fail("expected throw");
    } catch (error) {
      expect(isHitlError(error)).toBe(true);
      if (isHitlError(error)) {
        expect(error.code).toBe(HitlErrorCode.INVALID_TOKEN);
      }
    }
    expect(gate.getPhysicalSendCount()).toBe(0);
  });
});

describe("HitlNotifyGate — reject", () => {
  it("reject cancels pending proposal", () => {
    const gate = new HitlNotifyGate();
    const { proposalId, token } = gate.proposeNotify(sampleNotify);

    const cancelled = gate.reject(proposalId, token);
    expect(cancelled).toEqual({ status: "cancelled", proposalId });

    expect(() => gate.confirm(proposalId, token)).toThrow(
      expect.objectContaining({ code: HitlErrorCode.ALREADY_REJECTED }),
    );
    expect(gate.getPhysicalSendCount()).toBe(0);
  });
});

describe("HitlNotifyGate — idempotent double confirm", () => {
  it("second confirm returns same result without duplicate send", () => {
    const gate = new HitlNotifyGate();
    const { proposalId, token } = gate.proposeNotify(sampleNotify);

    const first = gate.confirm(proposalId, token);
    const second = gate.confirm(proposalId, token);

    expect(second).toEqual(first);
    expect(gate.getPhysicalSendCount()).toBe(1);
  });
});

describe("HitlNotifyGate — public API surface", () => {
  it("does not export a direct send function", () => {
    const keys = Object.keys(notifyModule).sort();
    expect(keys).not.toContain("sendNotify");
    expect(keys).not.toContain("deliverNotifyMock");
  });
});
