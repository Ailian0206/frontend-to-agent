export type GuardrailOptions = {
  /** When true, flag mainland-style mobile numbers (11 digits). */
  checkPiiPhone?: boolean;
};

export type GuardrailResult = {
  ok: boolean;
  reasons: string[];
};

/** Case-insensitive substrings associated with prompt-injection attempts. */
const INJECTION_PHRASES: readonly string[] = [
  "ignore previous instructions",
  "ignore all prior instructions",
  "disregard your instructions",
  "reveal the system prompt",
  "you are now dan",
  "jailbreak",
];

/** OpenAI-style key prefix; teaching fixture only — not a real secret. */
const FAKE_SECRET_PATTERN = /\bsk-[a-zA-Z0-9]{8,}\b/;

/** Simple CN mobile: 1 + 10 digits (optional separators). */
const PHONE_PATTERN =
  /\b1[3-9]\d[\s-]?\d{4}[\s-]?\d{4}\b|\b1[3-9]\d{9}\b/;

/**
 * Offline output guardrail (S10): block risky model text before it reaches users.
 */
export function checkOutput(
  text: string,
  options: GuardrailOptions = {},
): GuardrailResult {
  const reasons: string[] = [];
  const lower = text.toLowerCase();

  for (const phrase of INJECTION_PHRASES) {
    if (lower.includes(phrase)) {
      reasons.push(`prompt_injection:${phrase}`);
    }
  }

  if (FAKE_SECRET_PATTERN.test(text)) {
    reasons.push("leaked_secret:sk-pattern");
  }

  if (options.checkPiiPhone && PHONE_PATTERN.test(text)) {
    reasons.push("pii:phone-like");
  }

  return { ok: reasons.length === 0, reasons };
}
