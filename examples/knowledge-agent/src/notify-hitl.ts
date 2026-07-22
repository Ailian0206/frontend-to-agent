import { randomBytes, randomUUID } from "node:crypto";

export const HitlErrorCode = {
  NOT_FOUND: "NOT_FOUND",
  INVALID_TOKEN: "INVALID_TOKEN",
  ALREADY_REJECTED: "ALREADY_REJECTED",
  ALREADY_CANCELLED: "ALREADY_CANCELLED",
} as const;

export type HitlErrorCode = (typeof HitlErrorCode)[keyof typeof HitlErrorCode];

export class HitlError extends Error {
  readonly code: HitlErrorCode;

  constructor(code: HitlErrorCode, message: string) {
    super(message);
    this.name = "HitlError";
    this.code = code;
  }
}

export function isHitlError(error: unknown): error is HitlError {
  return error instanceof HitlError;
}

export type ProposeNotifyInput = {
  threadId: string;
  message: string;
  idempotencyKey: string;
};

export type ProposeNotifyResult = {
  status: "confirm_required";
  proposalId: string;
  token: string;
};

export type ConfirmNotifyResult = {
  status: "sent";
  proposalId: string;
  notificationId: string;
  idempotencyKey: string;
  threadId: string;
  sentAt: string;
};

export type RejectNotifyResult = {
  status: "cancelled";
  proposalId: string;
};

type ProposalStatus = "pending" | "confirmed" | "rejected";

type StoredProposal = {
  token: string;
  payload: ProposeNotifyInput;
  status: ProposalStatus;
  result?: ConfirmNotifyResult;
};

type SentLedgerEntry = {
  notificationId: string;
  sentAt: string;
  proposalId: string;
  threadId: string;
};

/** Mock outbound notify — only confirm() may call it. */
function deliverNotifyMock(
  payload: ProposeNotifyInput,
  proposalId: string,
): SentLedgerEntry {
  return {
    notificationId: `ntf_${randomBytes(8).toString("hex")}`,
    sentAt: new Date().toISOString(),
    proposalId,
    threadId: payload.threadId,
  };
}

/**
 * Human-in-the-loop gate for side-effecting notifications (S7).
 * Public API: proposeNotify → confirm | reject. No direct send path.
 */
export class HitlNotifyGate {
  private readonly proposals = new Map<string, StoredProposal>();
  private readonly sendsByIdempotencyKey = new Map<string, SentLedgerEntry>();
  private physicalSendCount = 0;

  proposeNotify(input: ProposeNotifyInput): ProposeNotifyResult {
    const proposalId = randomUUID();
    const token = randomBytes(24).toString("hex");
    this.proposals.set(proposalId, {
      token,
      payload: { ...input },
      status: "pending",
    });
    return { status: "confirm_required", proposalId, token };
  }

  confirm(proposalId: string, token: string): ConfirmNotifyResult {
    const proposal = this.requireProposal(proposalId);
    this.assertToken(proposal, token);

    if (proposal.status === "rejected") {
      throw new HitlError(
        HitlErrorCode.ALREADY_REJECTED,
        "Proposal was rejected and cannot be confirmed",
      );
    }

    if (proposal.status === "confirmed" && proposal.result) {
      return proposal.result;
    }

    const ledgerKey = proposal.payload.idempotencyKey;
    let ledger = this.sendsByIdempotencyKey.get(ledgerKey);
    if (!ledger) {
      ledger = deliverNotifyMock(proposal.payload, proposalId);
      this.sendsByIdempotencyKey.set(ledgerKey, ledger);
      this.physicalSendCount += 1;
    }

    const result: ConfirmNotifyResult = {
      status: "sent",
      proposalId,
      notificationId: ledger.notificationId,
      idempotencyKey: ledgerKey,
      threadId: ledger.threadId,
      sentAt: ledger.sentAt,
    };
    proposal.status = "confirmed";
    proposal.result = result;
    return result;
  }

  reject(proposalId: string, token: string): RejectNotifyResult {
    const proposal = this.requireProposal(proposalId);
    this.assertToken(proposal, token);

    if (proposal.status === "confirmed") {
      throw new HitlError(
        HitlErrorCode.ALREADY_CANCELLED,
        "Proposal already confirmed; cannot reject",
      );
    }

    proposal.status = "rejected";
    return { status: "cancelled", proposalId };
  }

  /** Test helper: count actual mock deliveries (not proposal count). */
  getPhysicalSendCount(): number {
    return this.physicalSendCount;
  }

  private requireProposal(proposalId: string): StoredProposal {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new HitlError(HitlErrorCode.NOT_FOUND, "Proposal not found");
    }
    return proposal;
  }

  private assertToken(proposal: StoredProposal, token: string): void {
    if (proposal.token !== token) {
      throw new HitlError(HitlErrorCode.INVALID_TOKEN, "Invalid confirmation token");
    }
  }
}
