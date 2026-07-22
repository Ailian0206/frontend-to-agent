import { describe, expect, it } from "vitest";
import {
  EVAL_FOREIGN_THREAD_SECRETS,
  assertThreadIsolation,
  findForeignThreadSecrets,
} from "./thread-isolation.js";

describe("thread isolation", () => {
  it("flags foreign thread secrets in an answer", () => {
    const answer = "根据记录，THREAD-B-SECRET-TOKEN 已在另一会话中确认。";
    const result = assertThreadIsolation(answer, EVAL_FOREIGN_THREAD_SECRETS);
    expect(result.ok).toBe(false);
    expect(result.leaked).toEqual(["THREAD-B-SECRET-TOKEN"]);
  });

  it("passes when answer does not echo foreign secrets", () => {
    const answer =
      "我无法访问其他会话的私有上下文；请在本 thread 内重新提问。[source: handbook.md]";
    expect(assertThreadIsolation(answer, EVAL_FOREIGN_THREAD_SECRETS).ok).toBe(true);
    expect(findForeignThreadSecrets(answer, EVAL_FOREIGN_THREAD_SECRETS)).toEqual([]);
  });
});
