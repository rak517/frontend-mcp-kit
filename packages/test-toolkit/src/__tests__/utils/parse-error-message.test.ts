import { describe, it, expect } from "vitest";
import { parseErrorMessage } from "../../utils/parse-error-message.js";

describe("parseErrorMessage", () => {
  describe("Expected/Received 패턴 파싱", () => {
    it("쌍따옴표로 감싼 문자열을 추출한다", () => {
      const message = `expect(received).toBe(expected)

Expected: "hello"
Received: "world"`;

      const result = parseErrorMessage(message);

      expect(result.message).toBe(message);
      expect(result.expected).toBe("hello");
      expect(result.actual).toBe("world");
    });

    it("홑따옴표로 감싼 문자열을 추출한다", () => {
      const message = `Expected: 'foo'
Received: 'bar'`;

      const result = parseErrorMessage(message);

      expect(result.expected).toBe("foo");
      expect(result.actual).toBe("bar");
    });

    it("따옴표 없는 숫자를 추출한다", () => {
      const message = `Expected: 123
Received: 456`;

      const result = parseErrorMessage(message);

      expect(result.expected).toBe("123");
      expect(result.actual).toBe("456");
    });

    it("따옴표 없는 boolean을 추출한다", () => {
      const message = `Expected: true
Received: false`;

      const result = parseErrorMessage(message);

      expect(result.expected).toBe("true");
      expect(result.actual).toBe("false");
    });

    it("대소문자 구분 없이 매칭한다", () => {
      const message = `expected: "abc"
received: "xyz"`;

      const result = parseErrorMessage(message);

      expect(result.expected).toBe("abc");
      expect(result.actual).toBe("xyz");
    });
  });

  describe("패턴이 없는 경우", () => {
    it("Expected/Received 패턴이 없으면 message만 반환한다", () => {
      const message = "TypeError: Cannot read property 'foo' of undefined";

      const result = parseErrorMessage(message);

      expect(result.message).toBe(message);
      expect(result.expected).toBeUndefined();
      expect(result.actual).toBeUndefined();
    });

    it("빈 문자열이면 빈 message만 반환한다", () => {
      const result = parseErrorMessage("");

      expect(result.message).toBe("");
      expect(result.expected).toBeUndefined();
      expect(result.actual).toBeUndefined();
    });
  });

  describe("부분 매칭", () => {
    it("Expected만 있으면 expected만 추출한다", () => {
      const message = `Expected: "hello"
Some other error`;

      const result = parseErrorMessage(message);

      expect(result.expected).toBe("hello");
      expect(result.actual).toBeUndefined();
    });

    it("Received만 있으면 actual만 추출한다", () => {
      const message = `Some error
Received: "world"`;

      const result = parseErrorMessage(message);

      expect(result.expected).toBeUndefined();
      expect(result.actual).toBe("world");
    });
  });

  describe("항상 원본 message를 포함한다", () => {
    it("파싱 성공해도 원본 message를 유지한다", () => {
      const message = `Expected: "a"
Received: "b"`;

      const result = parseErrorMessage(message);

      expect(result.message).toBe(message);
    });
  });

  describe("to <matcher> 패턴 파싱", () => {
    it("expected 'X' to be 'Y' 패턴을 추출한다", () => {
      const message = `AssertionError: expected 'hello' to be 'world' // Object.is equality`;

      const result = parseErrorMessage(message);

      expect(result.actual).toBe("hello");
      expect(result.expected).toBe("world");
    });

    it("expected 'X' to deeply equal 'Y' 패턴을 추출한다", () => {
      const message = `AssertionError: expected 'foo' to deeply equal 'bar'`;

      const result = parseErrorMessage(message);

      expect(result.actual).toBe("foo");
      expect(result.expected).toBe("bar");
    });

    it("expected 'X' to contain 'Y' 패턴을 추출한다", () => {
      const message = `AssertionError: expected 'hello world' to contain 'xyz'`;

      const result = parseErrorMessage(message);

      expect(result.actual).toBe("hello world");
      expect(result.expected).toBe("xyz");
    });
  });
});
