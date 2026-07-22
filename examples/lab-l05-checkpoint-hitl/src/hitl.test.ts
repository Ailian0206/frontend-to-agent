import { describe, expect, it } from "vitest";
import * as hitlModule from "./hitl.js";
import {
  HitlEmailGate,
  HitlErrorCode,
  isHitlError,
} from "./hitl.js";

const sampleEmail = {
  to: "user@example.com",
  subject: "Hello",
  body: "Checkpoint lab",
  idempotencyKey: "idem-001",
};

describe("HitlEmailGate — confirm happy path", () => {
  it("propose then confirm sends once", () => {
    const gate = new HitlEmailGate();
    const proposal = gate.proposeEmailSend(sampleEmail);

    expect(proposal).toMatchObject({
      status: "confirm_required",
    });
    expect(proposal.proposalId).toBeTruthy();
    expect(proposal.token).toBeTruthy();

    const sent = gate.confirm(proposal.proposalId, proposal.token);
    expect(sent).toMatchObject({
      status: "sent",
      proposalId: proposal.proposalId,
      idempotencyKey: sampleEmail.idempotencyKey,
    });
    expect(sent.messageId).toMatch(/^msg_/);
    expect(gate.getPhysicalSendCount()).toBe(1);
  });
});

describe("HitlEmailGate — invalid token", () => {
  it("rejects confirm with wrong token", () => {
    const gate = new HitlEmailGate();
    const { proposalId, token } = gate.proposeEmailSend(sampleEmail);

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

describe("HitlEmailGate — reject", () => {
  it("reject cancels pending proposal", () => {
    const gate = new HitlEmailGate();
    const { proposalId, token } = gate.proposeEmailSend(sampleEmail);

    const cancelled = gate.reject(proposalId, token);
    expect(cancelled).toEqual({ status: "cancelled", proposalId });

    expect(() => gate.confirm(proposalId, token)).toThrow(
      expect.objectContaining({ code: HitlErrorCode.ALREADY_REJECTED }),
    );
    expect(gate.getPhysicalSendCount()).toBe(0);
  });
});

describe("HitlEmailGate — idempotent double confirm", () => {
  it("second confirm returns same result without duplicate send", () => {
    const gate = new HitlEmailGate();
    const { proposalId, token } = gate.proposeEmailSend(sampleEmail);

    const first = gate.confirm(proposalId, token);
    const second = gate.confirm(proposalId, token);

    expect(second).toEqual(first);
    expect(gate.getPhysicalSendCount()).toBe(1);
  });
});

describe("HitlEmailGate — public API surface", () => {
  it("does not export a direct send/execute function", () => {
    const keys = Object.keys(hitlModule).sort();
    expect(keys).not.toContain("sendEmail");
    expect(keys).not.toContain("executeEmailSend");
    expect(keys).not.toContain("deliverEmailMock");
  });
});
