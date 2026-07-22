import { z } from "zod";

export const IntentSchema = z.object({
  intent: z.enum(["query_status", "cancel", "refund", "other"]),
  orderId: z
    .string()
    .regex(/^ORD-\d{6}$/)
    .optional(),
  missingFields: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
});

export type IntentResult = z.infer<typeof IntentSchema>;

export class IntentParseError extends Error {
  readonly code: "invalid_json" | "schema";

  constructor(code: "invalid_json" | "schema", message: string, cause?: unknown) {
    super(message, cause !== undefined ? { cause } : undefined);
    this.name = "IntentParseError";
    this.code = code;
  }
}

/** Parse model JSON text and validate against IntentSchema (no network). */
export function parseIntentJson(rawJson: string): IntentResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (error) {
    throw new IntentParseError("invalid_json", "Model output is not valid JSON", error);
  }

  const result = IntentSchema.safeParse(parsed);
  if (!result.success) {
    throw new IntentParseError(
      "schema",
      `Schema validation failed: ${result.error.message}`,
      result.error,
    );
  }
  return result.data;
}
