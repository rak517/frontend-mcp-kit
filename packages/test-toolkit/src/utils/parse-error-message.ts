import type { TestErrorInfo } from "../tools/run-tests.js";

/**
 * vitest/jest의 failureMessage에서 expected, actual 값을 추출
 *
 * 지원 패턴:
 * - Expected: "value" / Received: "value"
 * - Expected: value / Received: value
 * - expected "value" / received "value"
 */
export function parseErrorMessage(failureMessage: string): TestErrorInfo {
  const result: TestErrorInfo = {
    message: failureMessage,
  };

  // 패턴 1: Expected: "value" (따옴표 포함)
  // 패턴 2: Expected: value (따옴표 없음, 숫자나 boolean 등)
  const expectedMatch = failureMessage.match(
    /Expected:\s*(?:"([^"]+)"|'([^']+)'|(\S+))/i
  );
  const receivedMatch = failureMessage.match(
    /Received:\s*(?:"([^"]+)"|'([^']+)'|(\S+))/i
  );

  if (expectedMatch) {
    result.expected = expectedMatch[1] ?? expectedMatch[2] ?? expectedMatch[3];
  }

  if (receivedMatch) {
    result.actual = receivedMatch[1] ?? receivedMatch[2] ?? receivedMatch[3];
  }

  return result;
}
