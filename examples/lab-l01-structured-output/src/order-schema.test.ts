import { describe, expect, it } from "vitest";
import { IntentParseError, parseIntentJson } from "./order-schema.js";

describe("parseIntentJson", () => {
  it("parses valid model JSON", () => {
    const raw = JSON.stringify({
      intent: "cancel",
      orderId: "ORD-000001",
      missingFields: [],
      confidence: 0.88,
    });
    expect(parseIntentJson(raw)).toEqual({
      intent: "cancel",
      orderId: "ORD-000001",
      missingFields: [],
      confidence: 0.88,
    });
  });

  it("applies default missingFields when omitted", () => {
    const raw = JSON.stringify({
      intent: "refund",
      confidence: 0.7,
    });
    expect(parseIntentJson(raw).missingFields).toEqual([]);
  });

  it("rejects illegal JSON", () => {
    expect(() => parseIntentJson("{ not json")).toThrow(IntentParseError);
    try {
      parseIntentJson("{ not json");
    } catch (error) {
      expect(error).toBeInstanceOf(IntentParseError);
      expect((error as IntentParseError).code).toBe("invalid_json");
    }
  });

  it("rejects schema violations", () => {
    const badOrderId = JSON.stringify({
      intent: "query_status",
      orderId: "BAD-123",
      confidence: 0.5,
    });
    expect(() => parseIntentJson(badOrderId)).toThrow(IntentParseError);

    const badConfidence = JSON.stringify({
      intent: "other",
      confidence: 1.5,
    });
    try {
      parseIntentJson(badConfidence);
    } catch (error) {
      expect(error).toBeInstanceOf(IntentParseError);
      expect((error as IntentParseError).code).toBe("schema");
    }
  });
});
