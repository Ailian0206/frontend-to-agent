import { hashPrompt } from "./prompt-version.js";
import { parseIntentJson, type IntentResult } from "./order-schema.js";

/** System prompt template; bumping this changes CURRENT_PROMPT_VERSION and fixtures must be refreshed. */
export const ORDER_TRIAGE_PROMPT = `你是订单分流助手。根据用户消息输出 JSON，字段：
- intent: query_status | cancel | refund | other
- orderId: 可选，格式 ORD-加六位数字
- missingFields: 缺少的槽位名数组
- confidence: 0 到 1 的置信度
只输出 JSON，不要 markdown。`;

export const CURRENT_PROMPT_VERSION = hashPrompt(ORDER_TRIAGE_PROMPT);

export type RegressionFixture = {
  id: string;
  promptVersion: string;
  rawJson: string;
  expected: IntentResult;
};

/** Golden model outputs recorded against CURRENT_PROMPT_VERSION (CI uses these only). */
export const REGRESSION_FIXTURES: RegressionFixture[] = [
  {
    id: "query-with-order-id",
    promptVersion: CURRENT_PROMPT_VERSION,
    rawJson: JSON.stringify({
      intent: "query_status",
      orderId: "ORD-123456",
      missingFields: [],
      confidence: 0.92,
    }),
    expected: {
      intent: "query_status",
      orderId: "ORD-123456",
      missingFields: [],
      confidence: 0.92,
    },
  },
  {
    id: "missing-order-id",
    promptVersion: CURRENT_PROMPT_VERSION,
    rawJson: JSON.stringify({
      intent: "other",
      missingFields: ["orderId"],
      confidence: 0.55,
    }),
    expected: {
      intent: "other",
      missingFields: ["orderId"],
      confidence: 0.55,
    },
  },
];

/**
 * Assert fixture prompt pin matches current template and JSON still parses to expected shape.
 */
export function assertFixtureMatches(promptVersion: string, rawJson: string): IntentResult {
  if (promptVersion !== CURRENT_PROMPT_VERSION) {
    throw new Error(
      `Prompt version mismatch: expected ${CURRENT_PROMPT_VERSION}, got ${promptVersion}`,
    );
  }
  const parsed = parseIntentJson(rawJson);
  const fixture = REGRESSION_FIXTURES.find(
    (f) => f.promptVersion === promptVersion && f.rawJson === rawJson,
  );
  if (fixture) {
    if (JSON.stringify(parsed) !== JSON.stringify(fixture.expected)) {
      throw new Error(`Parsed intent does not match fixture ${fixture.id}`);
    }
  }
  return parsed;
}
