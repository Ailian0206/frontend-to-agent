/** Citation format required by the agent system prompt. */
const CITATION_PATTERN = /\[\s*source:\s*[^\]]+\]/i;

/** Case-insensitive substrings associated with prompt-injection attempts. */
const INJECTION_PHRASES: readonly string[] = [
  "ignore previous instructions",
  "ignore all prior instructions",
  "disregard your instructions",
  "reveal the system prompt",
  "you are now dan",
  "jailbreak",
  "忽略以上指令",
  "忽略先前",
];

/** OpenAI-style key prefix; teaching fixture only — not a real secret. */
const FAKE_SECRET_PATTERN = /\bsk-[a-zA-Z0-9]{8,}\b/;

export type CheckAnswerResult = {
  ok: boolean;
  reasons: string[];
  /** When true, caller should refuse or replace with a safe no-cite template. */
  needsCiteRefuse?: boolean;
};

/**
 * Heuristic: answer reads like a factual claim from the knowledge base.
 * Refusal / meta replies without citations are excluded.
 */
export function looksFactualClaim(text: string): boolean {
  if (CITATION_PATTERN.test(text)) {
    return false;
  }
  if (isNoEvidenceRefusal(text)) {
    return false;
  }
  const trimmed = text.trim();
  if (trimmed.length < 24) {
    return false;
  }
  return (
    /\d/.test(trimmed) ||
    /根据|规定|必须|应当|小时内|工作日|版本\s*v?\d/i.test(trimmed)
  );
}

/** Template-style reply when retrieval did not support an answer (S5 refuse path). */
export function isNoEvidenceRefusal(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    /证据不足|无法从|没有找到|未在知识库|insufficient evidence|no relevant knowledge/i.test(
      text,
    ) || lower.includes("cannot answer from the retrieved")
  );
}

/**
 * Offline output guardrail (S10): block risky or uncited factual text before users see it.
 */
export function checkAnswer(text: string): CheckAnswerResult {
  const reasons: string[] = [];
  const lower = text.toLowerCase();

  for (const phrase of INJECTION_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      reasons.push(`prompt_injection:${phrase}`);
    }
  }

  if (FAKE_SECRET_PATTERN.test(text)) {
    reasons.push("leaked_secret:sk-pattern");
  }

  if (looksFactualClaim(text)) {
    reasons.push("missing_citation");
  }

  const needsCiteRefuse = reasons.includes("missing_citation");

  return {
    ok: reasons.length === 0,
    reasons,
    ...(needsCiteRefuse ? { needsCiteRefuse: true } : {}),
  };
}
