import type { TestErrorInfo } from "../tools/run-tests.js";

/**
 * vitest/jest의 failureMessage에서 expected, actual 값을 추출
 *
 * 지원 패턴:
 * 1. Expected: "value" / Received: "value"
 * 2. expected 'actual' to be 'expected'
 */
export function parseErrorMessage(failureMessage: string): TestErrorInfo {
  const result: TestErrorInfo = {
    message: failureMessage,
  };

  // 패턴 1: Expected: "value" / Received: "value"
  const expectedMatch = failureMessage.match(
    /Expected:\s*(?:"([^"]+)"|'([^']+)'|(\S+))/i
  );
  const receivedMatch = failureMessage.match(
    /Received:\s*(?:"([^"]+)"|'([^']+)'|(\S+))/i
  );

  if (expectedMatch || receivedMatch) {
    if (expectedMatch) {
      result.expected =
        expectedMatch[1] ?? expectedMatch[2] ?? expectedMatch[3];
    }
    if (receivedMatch) {
      result.actual = receivedMatch[1] ?? receivedMatch[2] ?? receivedMatch[3];
    }
    return result;
  }

  // 패턴 2: expected 'actual' to <matcher> 'expected' (문자열)
  const quotedMatch = failureMessage.match(
    /expected '([^']*)' to .+ '([^']*)'/i
  );
  if (quotedMatch) {
    result.actual = quotedMatch[1];
    result.expected = quotedMatch[2];
    return result;
  }

  const firstLine = failureMessage.split("\n")[0];
  const cleaned = firstLine.replace(/\s*\/\/.*$/, "");

  // 패턴 3: expected {actual} to <matcher> {expected} (객체)
  const objectMatch = cleaned.match(/expected (\{.+\}) to .+ (\{.+\})$/i);
  if (objectMatch) {
    result.actual = objectMatch[1];
    result.expected = objectMatch[2];
    return result;
  }

  // 패턴 4: expected <actual> to <matcher> <expected> (숫자, boolean 등)
  const generalMatch = cleaned.match(/expected (.+) to .+ (\S+)$/i);
  if (generalMatch) {
    result.actual = generalMatch[1];
    result.expected = generalMatch[2];
    return result;
  }

  return result;
}
