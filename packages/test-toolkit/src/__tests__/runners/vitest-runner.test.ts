import { describe, it, expect } from "vitest";
import { runVitest } from "../../runners/vitest-runner.js";
import { resolve } from "node:path";

describe("runVitest", () => {
  const projectRoot = process.cwd();

  describe("successful execution", () => {
    it("should return RunTestsOutput format", async () => {
      const testPath = resolve(
        projectRoot,
        "src/__tests__/core/schemas.test.ts"
      );

      const result = await runVitest(testPath, projectRoot);

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("framework", "vitest");
      expect(result).toHaveProperty("summary");
      expect(result).toHaveProperty("results");
    }, 30000);

    it("should return correct summary structure", async () => {
      const testPath = resolve(
        projectRoot,
        "src/__tests__/core/schemas.test.ts"
      );

      const result = await runVitest(testPath, projectRoot);

      expect(result.summary).toHaveProperty("total");
      expect(result.summary).toHaveProperty("passed");
      expect(result.summary).toHaveProperty("failed");
      expect(result.summary).toHaveProperty("skipped");
      expect(result.summary).toHaveProperty("duration");
    }, 30000);

    it("should return passing tests with success true", async () => {
      const testPath = resolve(
        projectRoot,
        "src/__tests__/core/schemas.test.ts"
      );

      const result = await runVitest(testPath, projectRoot);

      expect(result.success).toBe(true);
      expect(result.summary.passed).toBeGreaterThan(0);
      expect(result.summary.failed).toBe(0);
    }, 30000);

    it("should return test results with required fields", async () => {
      const testPath = resolve(
        projectRoot,
        "src/__tests__/core/schemas.test.ts"
      );

      const result = await runVitest(testPath, projectRoot);

      expect(result.results.length).toBeGreaterThan(0);

      for (const testResult of result.results) {
        expect(testResult).toHaveProperty("name");
        expect(testResult).toHaveProperty("status");
        expect(testResult).toHaveProperty("duration");
        expect(testResult).toHaveProperty("file");
        expect(["passed", "failed", "skipped"]).toContain(testResult.status);
      }
    }, 30000);

    it("should include file path in results", async () => {
      const testPath = resolve(
        projectRoot,
        "src/__tests__/core/schemas.test.ts"
      );

      const result = await runVitest(testPath, projectRoot);

      expect(result.results[0].file).toContain("schemas.test.ts");
    }, 30000);
  });

  describe("error handling", () => {
    it("should return error for nonexistent test file", async () => {
      const testPath = resolve(projectRoot, "nonexistent.test.ts");

      const result = await runVitest(testPath, projectRoot);

      expect(result.success).toBe(false);
    }, 30000);

    it("should return success false for nonexistent file", async () => {
      const testPath = resolve(projectRoot, "nonexistent.test.ts");

      const result = await runVitest(testPath, projectRoot);

      // vitest는 파일이 없어도 유효한 JSON을 반환 (success: false)
      // error 필드는 JSON 파싱 실패 시에만 설정됨
      expect(result.success).toBe(false);
      expect(result.framework).toBe("vitest");
    }, 30000);

    it("should return empty results on error", async () => {
      const testPath = resolve(projectRoot, "nonexistent.test.ts");

      const result = await runVitest(testPath, projectRoot);

      expect(result.results).toEqual([]);
      expect(result.summary.total).toBe(0);
    }, 30000);
  });

  describe("folder execution", () => {
    it("should run all tests in a folder", async () => {
      const testPath = resolve(projectRoot, "src/__tests__/core");

      const result = await runVitest(testPath, projectRoot);

      expect(result.success).toBe(true);
      expect(result.summary.total).toBeGreaterThan(5);
    }, 60000);
  });
});
